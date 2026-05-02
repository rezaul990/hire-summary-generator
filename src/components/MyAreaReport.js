import React from 'react';
import './MyAreaReport.css';

function MyAreaReport({ userArea, areaWiseData }) {
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
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="my-area-report">
      <div className="my-area-header">
        <h2>📍 My Area Report: {userArea}</h2>
        <div className="area-summary-cards">
          <div className="summary-card">
            <div className="card-label">Card Collected</div>
            <div className="card-value">{formatNumber(totalCollectedQty)}</div>
          </div>
          <div className="summary-card">
            <div className="card-label">Collection %</div>
            <div className="card-value">
              <span className="qty-badge">Qty: {qtyPercent}%</span>
              <span className="amt-badge">Amt: {amtPercent}%</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-label">Overdue Change</div>
            <div className={`card-value ${overdueChange > 0 ? 'negative' : 'positive'}`}>
              {overdueChange > 0 ? '+' : ''}{formatNumber(overdueChange)}
            </div>
          </div>
        </div>
      </div>

      <div className="plaza-list">
        <h3>🏪 Plaza Details ({myAreaData.length} Plazas)</h3>
        <div className="plaza-grid">
          {myAreaData.map((plaza, index) => {
            const plazaOverdueChange = parseFloat(plaza.Running_Overdue || 0) - parseFloat(plaza.Previous_Overdue || 0);
            return (
              <div key={index} className="plaza-card">
                <div className="plaza-name">{plaza.Plaza}</div>
                <div className="plaza-stats">
                  <div className="stat-row">
                    <span className="stat-label">Cards:</span>
                    <span className="stat-value">{plaza.Collected_Acc_Qty}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Qty:</span>
                    <span className="stat-value">{plaza.Collection_Qty_Percent}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Amt:</span>
                    <span className="stat-value">{plaza.Collection_Amt_Percent}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">O/D Change:</span>
                    <span className={`stat-value ${plazaOverdueChange > 0 ? 'negative' : 'positive'}`}>
                      {plazaOverdueChange > 0 ? '+' : ''}{formatNumber(plazaOverdueChange)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyAreaReport;
