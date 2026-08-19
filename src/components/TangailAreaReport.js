import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './TangailAreaReport.css';
import { getYesterdayTangailPlazaData } from '../utils/supabase';

function TangailAreaReport({ userArea, areaWiseData }) {
  const captureRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [yesterdayPlazaData, setYesterdayPlazaData] = useState({});

  const isTangailUser = userArea && userArea.toLowerCase().includes('tangail');

  useEffect(() => {
    if (!isTangailUser) return;
    const fetchYesterdayData = async () => {
      const data = await getYesterdayTangailPlazaData();
      setYesterdayPlazaData(data);
    };
    fetchYesterdayData();
  }, [isTangailUser]);

  if (!isTangailUser) return null;

  // Filter only Tangail plaza rows (no subtotals, no grand total)
  const tangailPlazas = areaWiseData.filter(
    row =>
      row.Area &&
      row.Area.toLowerCase().includes('tangail') &&
      !row.isSubtotal &&
      !row.isGrandTotal &&
      row.Plaza
  );

  if (tangailPlazas.length === 0) return null;

  // Build full report rows
  let totalAcQty = 0;
  let totalCollected = 0;
  let totalNoCollected = 0;
  let totalYesterdayColl = 0;
  let totalCollectibleAmt = 0;
  let totalCollectedAmt = 0;
  let totalPrevOverdue = 0;
  let totalRunOverdue = 0;

  const reportRows = tangailPlazas.map((plaza, index) => {
    const acQty       = parseFloat(plaza.Collectible_Acc_Qty || 0);
    const collected   = parseFloat(plaza.Collected_Acc_Qty   || 0);
    const noCollected = acQty - collected;
    const collPct     = acQty > 0 ? ((collected / acQty) * 100).toFixed(2) : '0.00';
    const yesterdayColl  = parseFloat(yesterdayPlazaData[plaza.Plaza] || 0);
    const collectibleAmt = parseFloat(plaza.Collectible_Amount || 0);
    const collectedAmt   = parseFloat(plaza.Collected_Amount   || 0);
    const amtCollPct = collectibleAmt > 0
      ? ((collectedAmt / collectibleAmt) * 100).toFixed(2)
      : '0.00';
    const prevOverdue  = parseFloat(plaza.Previous_Overdue || 0);
    const runOverdue   = parseFloat(plaza.Running_Overdue  || 0);
    const overdueChange = runOverdue - prevOverdue;

    totalAcQty          += acQty;
    totalCollected      += collected;
    totalNoCollected    += noCollected;
    totalYesterdayColl  += yesterdayColl;
    totalCollectibleAmt += collectibleAmt;
    totalCollectedAmt   += collectedAmt;
    totalPrevOverdue    += prevOverdue;
    totalRunOverdue     += runOverdue;

    return {
      sn: index + 1,
      plaza: plaza.Plaza,
      acQty, collected, noCollected, collPct,
      yesterdayColl,
      collectibleAmt, collectedAmt, amtCollPct,
      prevOverdue, runOverdue, overdueChange,
    };
  });

  const totalNoCollPct  = totalAcQty > 0
    ? ((totalCollected / totalAcQty) * 100).toFixed(2) : '0.00';
  const totalAmtCollPct = totalCollectibleAmt > 0
    ? ((totalCollectedAmt / totalCollectibleAmt) * 100).toFixed(2) : '0.00';
  const totalOverdueChange = totalRunOverdue - totalPrevOverdue;

  const fmt = (num) => new Intl.NumberFormat('en-IN').format(Math.round(num));

  // Date formatted as DD-MM-YYYY
  const today = new Date();
  const dd   = String(today.getDate()).padStart(2, '0');
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  const currentTime = today.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Overdue cell class
  const overdueClass = (val) => {
    if (val < 0) return 'tar-td tar-td-right tar-td-overdue-neg';
    if (val > 0) return 'tar-td tar-td-right tar-td-overdue-pos';
    return 'tar-td tar-td-right tar-td-overdue-zero';
  };

  // ── Image generation ──
  const generateCanvas = async () =>
    html2canvas(captureRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });

  const getFileName = () => {
    const iso = today.toISOString().split('T')[0];
    return `Tangail_Area_Collection_Report_${iso}.png`;
  };

  const handleShareImage = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const canvas = await generateCanvas();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], getFileName(), { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Tangail Area Collection Report',
          text: `📊 Collection Report ${dateStr} — ${currentTime}`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = getFileName();
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing image:', err);
        alert('❌ Could not share the image. Please try the Download button instead.');
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const canvas = await generateCanvas();
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = getFileName();
      link.click();
    } catch (err) {
      console.error('Error downloading image:', err);
      alert('❌ Could not generate the image. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="tangail-area-report">
      {/* ── Buttons outside capture area ── */}
      <div className="tar-header">
        <h2>📊 Tangail Area Collection Report</h2>
        <div className="tar-actions">
          <button className="tar-share-btn" onClick={handleShareImage} disabled={sharing}>
            <span>📤</span> {sharing ? 'Preparing...' : 'Share as Image'}
          </button>
          <button className="tar-download-btn" onClick={handleDownloadImage} disabled={sharing}>
            <span>⬇️</span> Download
          </button>
        </div>
      </div>

      {/* ── Capture area ── */}
      <div className="tar-capture" ref={captureRef}>

        {/* Title + time — white background, centered */}
        <div className="tar-title-bar">
          <div className="tar-title-main">Collection Report {dateStr}</div>
          <div className="tar-title-time">{currentTime}</div>
        </div>

        {/* Table */}
        <div className="tar-table-wrapper">
          <table className="tar-table">
            <thead>
              <tr className="tar-thead-row">
                <th className="tar-th tar-th-sn">S / N<br/>▼</th>
                <th className="tar-th tar-th-plaza">Plaza Name<br/>▼</th>
                <th className="tar-th tar-th-num">AC Qty<br/>▼</th>
                <th className="tar-th tar-th-num">Collected<br/>▼</th>
                <th className="tar-th tar-th-num">No Coll<br/>▼</th>
                <th className="tar-th tar-th-pct">Coll %<br/>▼</th>
                <th className="tar-th tar-th-num">Yesterday Coll Qty<br/>▼</th>
                <th className="tar-th tar-th-amt">Collectible Amt.<br/>▼</th>
                <th className="tar-th tar-th-amt">Collected Amt.<br/>▼</th>
                <th className="tar-th tar-th-pct">Coll %<br/>▼</th>
                <th className="tar-th tar-th-amt">Previous Month Overdue<br/>▼</th>
                <th className="tar-th tar-th-amt">Running Month Overdue<br/>▼</th>
                <th className="tar-th tar-th-amt">Overdue Inrease/Decrea...<br/>▼</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr key={row.sn} className={row.sn % 2 === 0 ? 'tar-row-even' : 'tar-row-odd'}>
                  <td className="tar-td tar-td-center">{row.sn}</td>
                  <td className="tar-td tar-td-plaza">{row.plaza}</td>
                  <td className="tar-td tar-td-right">{fmt(row.acQty)}</td>
                  <td className="tar-td tar-td-right">{fmt(row.collected)}</td>
                  <td className="tar-td tar-td-right">{fmt(row.noCollected)}</td>
                  <td className="tar-td tar-td-right">{row.collPct}%</td>
                  <td className="tar-td tar-td-right">{fmt(row.yesterdayColl)}</td>
                  <td className="tar-td tar-td-right">{fmt(row.collectibleAmt)}</td>
                  <td className="tar-td tar-td-right">{fmt(row.collectedAmt)}</td>
                  <td className="tar-td tar-td-right">{row.amtCollPct}%</td>
                  <td className="tar-td tar-td-right">{fmt(row.prevOverdue)}</td>
                  <td className="tar-td tar-td-right">{fmt(row.runOverdue)}</td>
                  <td className={overdueClass(row.overdueChange)}>
                    {fmt(row.overdueChange)}
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr className="tar-row-total">
                <td className="tar-td tar-td-center" colSpan={2}>Total</td>
                <td className="tar-td tar-td-right">{fmt(totalAcQty)}</td>
                <td className="tar-td tar-td-right">{fmt(totalCollected)}</td>
                <td className="tar-td tar-td-right">{fmt(totalNoCollected)}</td>
                <td className="tar-td tar-td-right">{totalNoCollPct}%</td>
                <td className="tar-td tar-td-right">{fmt(totalYesterdayColl)}</td>
                <td className="tar-td tar-td-right">{fmt(totalCollectibleAmt)}</td>
                <td className="tar-td tar-td-right">{fmt(totalCollectedAmt)}</td>
                <td className="tar-td tar-td-right">{totalAmtCollPct}%</td>
                <td className="tar-td tar-td-right">{fmt(totalPrevOverdue)}</td>
                <td className="tar-td tar-td-right">{fmt(totalRunOverdue)}</td>
                <td className={overdueClass(totalOverdueChange)}>
                  {fmt(totalOverdueChange)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TangailAreaReport;
