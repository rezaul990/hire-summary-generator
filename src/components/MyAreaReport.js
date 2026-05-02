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
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  return (
    <div className="my-area-report">
      <div className="my-area-header">
        <h2>📍 My Area Report: {userArea}</h2>
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
                  <td className="number-cell">{plaza.Collection_Qty_Percent}</td>
                  <td className="number-cell">{formatNumber(plaza.Collectible_Amount)}</td>
                  <td className="number-cell">{formatNumber(plaza.Collected_Amount)}</td>
                  <td className="number-cell">{plaza.Collection_Amt_Percent}</td>
                  <td className="number-cell">{formatNumber(plaza.Previous_Overdue)}</td>
                  <td className="number-cell">{formatNumber(plaza.Running_Overdue)}</td>
                  <td className={`number-cell ${overdueChange > 0 ? 'negative-change' : 'positive-change'}`}>
                    {overdueChange > 0 ? '' : ''}{formatNumber(overdueChange)}
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
              <td className="number-cell">{qtyPercent}</td>
              <td className="number-cell">{formatNumber(totalCollectibleAmt)}</td>
              <td className="number-cell">{formatNumber(totalCollectedAmt)}</td>
              <td className="number-cell">{amtPercent}</td>
              <td className="number-cell">{formatNumber(totalPrevOverdue)}</td>
              <td className="number-cell">{formatNumber(totalRunOverdue)}</td>
              <td className={`number-cell ${overdueChange > 0 ? 'negative-change' : 'positive-change'}`}>
                {overdueChange > 0 ? '' : ''}{formatNumber(overdueChange)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyAreaReport;
