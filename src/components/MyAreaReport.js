import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import './MyAreaReport.css';

function MyAreaReport({ userArea, areaWiseData }) {
  const captureRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  // Filter data for user's area
  const myAreaData = areaWiseData.filter(
    row => row.Area && row.Area.toLowerCase().includes(userArea.toLowerCase()) && 
    !row.isSubtotal && !row.isGrandTotal && row.Plaza
  );

  if (myAreaData.length === 0) {
    return (
      <div className="my-area-report">
        <div className="my-area-header">
          <h2>📍 My Area Report: {userArea}</h2>
        </div>
        <div className="no-data-message">
          <p>No data found for your area in the uploaded file.</p>
        </div>
      </div>
    );
  }

  // Calculate area totals
  let totalCollectibleQty = 0;
  let totalCollectedQty = 0;
  let totalCollectibleAmt = 0;
  let totalCollectedAmt = 0;
  let totalPrevOverdue = 0;
  let totalRunOverdue = 0;

  myAreaData.forEach(row => {
    totalCollectibleQty += parseFloat(row.Collectible_Acc_Qty || 0);
    totalCollectedQty += parseFloat(row.Collected_Acc_Qty || 0);
    totalCollectibleAmt += parseFloat(row.Collectible_Amount || 0);
    totalCollectedAmt += parseFloat(row.Collected_Amount || 0);
    totalPrevOverdue += parseFloat(row.Previous_Overdue || 0);
    totalRunOverdue += parseFloat(row.Running_Overdue || 0);
  });

  const qtyPercent = totalCollectibleQty > 0 
    ? ((totalCollectedQty / totalCollectibleQty) * 100).toFixed(2) 
    : '0.00';
  const amtPercent = totalCollectibleAmt > 0 
    ? ((totalCollectedAmt / totalCollectibleAmt) * 100).toFixed(2) 
    : '0.00';
  const overdueChange = totalRunOverdue - totalPrevOverdue;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  const generateCanvas = async () => {
    const node = captureRef.current;

    // The table can be wider than the mobile viewport (horizontal scroll).
    // Measure the full content width so html2canvas captures every column,
    // including Inc/Dec, instead of only the visible portion.
    const tableContainer = node.querySelector('.my-area-table-container');
    const table = node.querySelector('.my-area-table');
    const fullWidth = Math.ceil(
      Math.max(
        node.scrollWidth,
        table ? table.scrollWidth : 0,
        tableContainer ? tableContainer.scrollWidth : 0
      )
    );

    return html2canvas(node, {
      backgroundColor: '#764ba2',
      scale: 2,
      useCORS: true,
      logging: false,
      width: fullWidth,
      windowWidth: fullWidth,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Force the cloned report to render at full width with no scroll clipping
        const clonedCapture = clonedDoc.querySelector('.my-area-capture');
        if (clonedCapture) {
          clonedCapture.style.width = fullWidth + 'px';
          clonedCapture.style.maxWidth = 'none';
        }
        const clonedContainer = clonedDoc.querySelector('.my-area-table-container');
        if (clonedContainer) {
          clonedContainer.style.overflow = 'visible';
          clonedContainer.style.overflowX = 'visible';
          clonedContainer.style.maxWidth = 'none';
          clonedContainer.style.width = '100%';
        }
        const clonedTable = clonedDoc.querySelector('.my-area-table');
        if (clonedTable) {
          clonedTable.style.minWidth = '0';
          clonedTable.style.width = '100%';
        }
      },
    });
  };

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    const safeArea = userArea.replace(/[^a-zA-Z0-9]/g, '_');
    return `My_Area_Report_${safeArea}_${date}.png`;
  };

  const handleShareImage = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const canvas = await generateCanvas();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const fileName = getFileName();
      const file = new File([blob], fileName, { type: 'image/png' });

      // Try native share (works on mobile - WhatsApp, etc.)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My Area Report: ${userArea}`,
          text: `📍 My Area Report: ${userArea}`,
        });
      } else {
        // Fallback: download the image
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
    <div className="my-area-report">
      <div className="my-area-header">
        <h2>📍 My Area Report: {userArea}</h2>
        <div className="my-area-actions">
          <button className="share-btn" onClick={handleShareImage} disabled={sharing}>
            <span>📤</span> {sharing ? 'Preparing...' : 'Share as Image'}
          </button>
          <button className="download-img-btn" onClick={handleDownloadImage} disabled={sharing}>
            <span>⬇️</span> Download
          </button>
        </div>
      </div>

      <div className="my-area-capture" ref={captureRef}>
        <div className="capture-title">
          📍 My Area Report: {userArea}
          <span className="capture-date">{new Date().toLocaleDateString('en-GB')}</span>
        </div>

        <div className="my-area-stats">
          <div className="stat-box">
            <div className="stat-box-label">Total Plazas</div>
            <div className="stat-box-value">{myAreaData.length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Card Collected</div>
            <div className="stat-box-value">{formatNumber(totalCollectedQty)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Qty Achieved</div>
            <div className="stat-box-value">{qtyPercent}%</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Amt Achieved</div>
            <div className="stat-box-value">{amtPercent}%</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">O/D Change</div>
            <div className={`stat-box-value ${overdueChange > 0 ? 'value-up' : 'value-down'}`}>
              {overdueChange > 0 ? '▲' : '▼'} {formatNumber(Math.abs(overdueChange))}
            </div>
          </div>
        </div>

        <div className="my-area-table-container">
          <table className="my-area-table">
            <thead>
              <tr>
                <th>Division</th>
                <th>Area</th>
                <th>Plaza</th>
                <th>Target Qty</th>
                <th>Ach. Qty</th>
                <th>Qty %</th>
                <th>Target Amt</th>
                <th>Ach. Amt</th>
                <th>Amt %</th>
                <th>Prev O/D</th>
                <th>Curr O/D</th>
                <th>Inc/Dec</th>
              </tr>
            </thead>
            <tbody>
              {myAreaData.map((plaza, index) => {
                const overdueChange = parseFloat(plaza.Running_Overdue || 0) - parseFloat(plaza.Previous_Overdue || 0);
                return (
                  <tr key={index}>
                    <td>{plaza.Division}</td>
                    <td>{plaza.Area}</td>
                    <td className="plaza-name-cell">{plaza.Plaza}</td>
                    <td className="number-cell">{formatNumber(plaza.Collectible_Acc_Qty)}</td>
                    <td className="number-cell">{formatNumber(plaza.Collected_Acc_Qty)}</td>
                    <td className="number-cell"><span className="percent-badge">{plaza.Collection_Qty_Percent}%</span></td>
                    <td className="number-cell">{formatNumber(plaza.Collectible_Amount)}</td>
                    <td className="number-cell">{formatNumber(plaza.Collected_Amount)}</td>
                    <td className="number-cell"><span className="percent-badge">{plaza.Collection_Amt_Percent}%</span></td>
                    <td className="number-cell">{formatNumber(plaza.Previous_Overdue)}</td>
                    <td className="number-cell">{formatNumber(plaza.Running_Overdue)}</td>
                    <td className="number-cell">
                      <span className={`change-badge ${overdueChange > 0 ? 'change-up' : 'change-down'}`}>
                        {overdueChange > 0 ? '▲' : '▼'} {formatNumber(Math.abs(overdueChange))}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Area Subtotal Row */}
              <tr className="subtotal-row">
                <td></td>
                <td colSpan="2" className="subtotal-label">{userArea} - SUBTOTAL</td>
                <td className="number-cell">{formatNumber(totalCollectibleQty)}</td>
                <td className="number-cell">{formatNumber(totalCollectedQty)}</td>
                <td className="number-cell"><span className="percent-badge">{qtyPercent}%</span></td>
                <td className="number-cell">{formatNumber(totalCollectibleAmt)}</td>
                <td className="number-cell">{formatNumber(totalCollectedAmt)}</td>
                <td className="number-cell"><span className="percent-badge">{amtPercent}%</span></td>
                <td className="number-cell">{formatNumber(totalPrevOverdue)}</td>
                <td className="number-cell">{formatNumber(totalRunOverdue)}</td>
                <td className="number-cell">
                  <span className={`change-badge ${overdueChange > 0 ? 'change-up' : 'change-down'}`}>
                    {overdueChange > 0 ? '▲' : '▼'} {formatNumber(Math.abs(overdueChange))}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="capture-footer">Generated by Collection Analytics By Reza</div>
      </div>
    </div>
  );
}

export default MyAreaReport;
