import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './TangailDailyReport.css';
import { getYesterdayTangailPlazaData } from '../utils/supabase';

function TangailDailyReport({ userArea, areaWiseData }) {
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

  // Only render for Tangail users
  if (!isTangailUser) return null;

  // Filter Tangail plaza data
  const tangailPlazas = areaWiseData.filter(
    row => row.Area && row.Area.toLowerCase().includes('tangail') &&
    !row.isSubtotal && !row.isGrandTotal && row.Plaza
  );

  if (tangailPlazas.length === 0) return null;

  // Build report rows
  let totalTodayCollected = 0;
  const reportRows = tangailPlazas.map((plaza) => {
    const yesterdayQty = yesterdayPlazaData[plaza.Plaza] || 0;
    const todayCollected = parseFloat(plaza.Collected_Acc_Qty || 0) - yesterdayQty;
    totalTodayCollected += todayCollected;
    return {
      plaza: plaza.Plaza,
      todayCollected,
    };
  });

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const generateCanvas = async () => {
    const node = captureRef.current;
    return html2canvas(node, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });
  };

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    return `Tangail_Daily_Report_${date}.png`;
  };

  const handleShareImage = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const canvas = await generateCanvas();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const fileName = getFileName();
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Tangail Daily Report',
          text: `📍 কার্ড কলেকশন আপডেট — ${currentTime}`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing image:', error);
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
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName();
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('❌ Could not generate the image. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="tangail-daily-report">
      <div className="tdr-header">
        <h2>📍 Tangail Daily Report</h2>
        <div className="tdr-actions">
          <button className="tdr-share-btn" onClick={handleShareImage} disabled={sharing}>
            <span>📤</span> {sharing ? 'Preparing...' : 'Share as Image'}
          </button>
          <button className="tdr-download-btn" onClick={handleDownloadImage} disabled={sharing}>
            <span>⬇️</span> Download
          </button>
        </div>
      </div>

      <div className="tdr-capture" ref={captureRef}>
        {/* Yellow title bar with red time badge */}
        <div className="tdr-title-bar">
          <span className="tdr-title-text">কার্ড কলেকশন আপডেট</span>
          <span className="tdr-time-badge">{currentTime}</span>
        </div>

        <table className="tdr-table">
          <thead>
            <tr>
              <th className="tdr-th-plaza">Plaza Name</th>
              <th className="tdr-th-ach">Ach</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row, i) => (
              <tr key={i} className={`tdr-row ${row.todayCollected < 10 ? 'tdr-row-red' : 'tdr-row-teal'}`}>
                <td className="tdr-td-plaza">{row.plaza}</td>
                <td className="tdr-td-ach">{formatNumber(row.todayCollected)}</td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="tdr-row-total">
              <td className="tdr-td-total-label">Total</td>
              <td className="tdr-td-total-value">{formatNumber(totalTodayCollected)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TangailDailyReport;
