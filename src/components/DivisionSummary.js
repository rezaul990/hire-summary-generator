import React, { useMemo } from 'react';
import './DivisionSummary.css';
import DataTable from './DataTable';

function DivisionSummary({ data, divisions, selectedDivision, onDivisionChange, selectedArea, onAreaChange, onDownload }) {
  const [viewMode, setViewMode] = React.useState('detailed'); // 'detailed', 'division', or 'area'

  const areas = useMemo(() => {
    if (!selectedDivision) return [];
    const uniqueAreas = [...new Set(data
      .filter(r => !r.isSubtotal && !r.isGrandTotal && r.Division === selectedDivision)
      .map(r => r.Area)
    )].sort();
    return uniqueAreas;
  }, [selectedDivision, data]);

  const filteredData = useMemo(() => {
    let filtered = [];

    if (viewMode === 'division') {
      // Show only division subtotals and grand total
      data.forEach(row => {
        if (row.isSubtotal || row.isGrandTotal) {
          if (selectedDivision) {
            if (row.Area.includes(selectedDivision)) {
              filtered.push(row);
            }
          } else {
            filtered.push(row);
          }
        }
      });

      // Recalculate grand total for filtered data
      if (filtered.length > 0 && (selectedDivision || selectedArea)) {
        const nonGrandTotalRows = filtered.filter(r => !r.isGrandTotal);
        const collectibleQtySum = nonGrandTotalRows.reduce((sum, r) => sum + parseFloat(r.Collectible_Acc_Qty || 0), 0);
        const collectedQtySum = nonGrandTotalRows.reduce((sum, r) => sum + parseFloat(r.Collected_Acc_Qty || 0), 0);
        const collectibleAmtSum = nonGrandTotalRows.reduce((sum, r) => sum + parseFloat(r.Collectible_Amount || 0), 0);
        const collectedAmtSum = nonGrandTotalRows.reduce((sum, r) => sum + parseFloat(r.Collected_Amount || 0), 0);
        const prevOverdueSum = nonGrandTotalRows.reduce((sum, r) => sum + parseFloat(r.Previous_Overdue || 0), 0);
        const runOverdueSum = nonGrandTotalRows.reduce((sum, r) => sum + parseFloat(r.Running_Overdue || 0), 0);

        filtered = filtered.filter(r => !r.isGrandTotal);
        filtered.push({
          Division: '',
          Area: 'GRAND TOTAL',
          Collectible_Acc_Qty: collectibleQtySum,
          Collected_Acc_Qty: collectedQtySum,
          Collection_Qty_Percent: collectibleQtySum > 0 ? ((collectedQtySum / collectibleQtySum) * 100).toFixed(2) : '0.00',
          Collectible_Amount: collectibleAmtSum,
          Collected_Amount: collectedAmtSum,
          Collection_Amt_Percent: collectibleAmtSum > 0 ? ((collectedAmtSum / collectibleAmtSum) * 100).toFixed(2) : '0.00',
          Previous_Overdue: prevOverdueSum,
          Running_Overdue: runOverdueSum,
          Overdue_Change: runOverdueSum - prevOverdueSum,
          isGrandTotal: true,
        });
      }
    } else if (viewMode === 'area') {
      // Show only area-wise totals and grand total
      const areaGroups = {};
      
      data.forEach(row => {
        if (!row.isSubtotal && !row.isGrandTotal) {
          if (!areaGroups[row.Area]) {
            areaGroups[row.Area] = [];
          }
          areaGroups[row.Area].push(row);
        }
      });

      Object.keys(areaGroups).sort().forEach(area => {
        const rows = areaGroups[area];
        
        const collectibleQtySum = rows.reduce((sum, r) => sum + parseFloat(r.Collectible_Acc_Qty || 0), 0);
        const collectedQtySum = rows.reduce((sum, r) => sum + parseFloat(r.Collected_Acc_Qty || 0), 0);
        const collectibleAmtSum = rows.reduce((sum, r) => sum + parseFloat(r.Collectible_Amount || 0), 0);
        const collectedAmtSum = rows.reduce((sum, r) => sum + parseFloat(r.Collected_Amount || 0), 0);
        const prevOverdueSum = rows.reduce((sum, r) => sum + parseFloat(r.Previous_Overdue || 0), 0);
        const runOverdueSum = rows.reduce((sum, r) => sum + parseFloat(r.Running_Overdue || 0), 0);

        if (!selectedDivision || rows.some(r => r.Division === selectedDivision)) {
          filtered.push({
            Division: rows[0].Division,
            Area: area,
            Collectible_Acc_Qty: collectibleQtySum,
            Collected_Acc_Qty: collectedQtySum,
            Collection_Qty_Percent: collectibleQtySum > 0 ? ((collectedQtySum / collectibleQtySum) * 100).toFixed(2) : '0.00',
            Collectible_Amount: collectibleAmtSum,
            Collected_Amount: collectedAmtSum,
            Collection_Amt_Percent: collectibleAmtSum > 0 ? ((collectedAmtSum / collectibleAmtSum) * 100).toFixed(2) : '0.00',
            Previous_Overdue: prevOverdueSum,
            Running_Overdue: runOverdueSum,
            Overdue_Change: runOverdueSum - prevOverdueSum,
            isAreaTotal: true,
          });
        }
      });

      // Recalculate grand total for filtered data
      if (filtered.length > 0) {
        const collectibleQtySum = filtered.reduce((sum, r) => sum + parseFloat(r.Collectible_Acc_Qty || 0), 0);
        const collectedQtySum = filtered.reduce((sum, r) => sum + parseFloat(r.Collected_Acc_Qty || 0), 0);
        const collectibleAmtSum = filtered.reduce((sum, r) => sum + parseFloat(r.Collectible_Amount || 0), 0);
        const collectedAmtSum = filtered.reduce((sum, r) => sum + parseFloat(r.Collected_Amount || 0), 0);
        const prevOverdueSum = filtered.reduce((sum, r) => sum + parseFloat(r.Previous_Overdue || 0), 0);
        const runOverdueSum = filtered.reduce((sum, r) => sum + parseFloat(r.Running_Overdue || 0), 0);

        filtered.push({
          Division: '',
          Area: 'GRAND TOTAL',
          Collectible_Acc_Qty: collectibleQtySum,
          Collected_Acc_Qty: collectedQtySum,
          Collection_Qty_Percent: collectibleQtySum > 0 ? ((collectedQtySum / collectibleQtySum) * 100).toFixed(2) : '0.00',
          Collectible_Amount: collectibleAmtSum,
          Collected_Amount: collectedAmtSum,
          Collection_Amt_Percent: collectibleAmtSum > 0 ? ((collectedAmtSum / collectibleAmtSum) * 100).toFixed(2) : '0.00',
          Previous_Overdue: prevOverdueSum,
          Running_Overdue: runOverdueSum,
          Overdue_Change: runOverdueSum - prevOverdueSum,
          isGrandTotal: true,
        });
      }
    } else {
      // Detailed view with areas
      if (!selectedDivision && !selectedArea) {
        filtered = data;
      } else {
        data.forEach(row => {
          if (row.isGrandTotal) return;

          if (row.isSubtotal) {
            const areaName = row.Area.replace(' - SUBTOTAL', '');
            const matchingRows = data.filter(
              r => !r.isSubtotal && !r.isGrandTotal && r.Area === areaName
            );

            const hasMatch = matchingRows.some(r => {
              if (selectedDivision && r.Division !== selectedDivision) return false;
              if (selectedArea && r.Area !== selectedArea) return false;
              return true;
            });

            if (hasMatch) {
              filtered.push(row);
            }
          } else {
            if (selectedDivision && row.Division !== selectedDivision) return;
            if (selectedArea && row.Area !== selectedArea) return;
            filtered.push(row);
          }
        });

        // Recalculate grand total for filtered data
        if (filtered.length > 0) {
          const nonSubtotalRows = filtered.filter(r => !r.isSubtotal);
          const collectibleQtySum = nonSubtotalRows.reduce((sum, r) => sum + parseFloat(r.Collectible_Acc_Qty || 0), 0);
          const collectedQtySum = nonSubtotalRows.reduce((sum, r) => sum + parseFloat(r.Collected_Acc_Qty || 0), 0);
          const collectibleAmtSum = nonSubtotalRows.reduce((sum, r) => sum + parseFloat(r.Collectible_Amount || 0), 0);
          const collectedAmtSum = nonSubtotalRows.reduce((sum, r) => sum + parseFloat(r.Collected_Amount || 0), 0);
          const prevOverdueSum = nonSubtotalRows.reduce((sum, r) => sum + parseFloat(r.Previous_Overdue || 0), 0);
          const runOverdueSum = nonSubtotalRows.reduce((sum, r) => sum + parseFloat(r.Running_Overdue || 0), 0);

          filtered.push({
            Division: '',
            Area: 'GRAND TOTAL',
            Collectible_Acc_Qty: collectibleQtySum,
            Collected_Acc_Qty: collectedQtySum,
            Collection_Qty_Percent: collectibleQtySum > 0 ? ((collectedQtySum / collectibleQtySum) * 100).toFixed(2) : '0.00',
            Collectible_Amount: collectibleAmtSum,
            Collected_Amount: collectedAmtSum,
            Collection_Amt_Percent: collectibleAmtSum > 0 ? ((collectedAmtSum / collectibleAmtSum) * 100).toFixed(2) : '0.00',
            Previous_Overdue: prevOverdueSum,
            Running_Overdue: runOverdueSum,
            Overdue_Change: runOverdueSum - prevOverdueSum,
            isGrandTotal: true,
          });
        }
      }
    }

    return filtered;
  }, [selectedDivision, selectedArea, data, viewMode]);

  const handleDivisionChange = (division) => {
    onDivisionChange(division);
    onAreaChange('');
  };

  return (
    <section className="summary-section">
      <div className="section-header">
        <h2>📊 Division & Area Wise Summary</h2>
        <button className="download-btn" onClick={onDownload}>
          ⬇ Download Excel
        </button>
      </div>

      <div className="view-mode-container">
        <label>View Mode:</label>
        <div className="view-mode-buttons">
          <button
            className={`mode-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('detailed');
              onDivisionChange('');
              onAreaChange('');
            }}
          >
            Detailed View
          </button>
          <button
            className={`mode-btn ${viewMode === 'division' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('division');
              onDivisionChange('');
              onAreaChange('');
            }}
          >
            Division Summary
          </button>
          <button
            className={`mode-btn ${viewMode === 'area' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('area');
              onDivisionChange('');
              onAreaChange('');
            }}
          >
            Area View
          </button>
        </div>
      </div>

      {viewMode === 'detailed' && (
        <div className="filter-container">
          <div className="filter-box">
            <label htmlFor="divisionFilter">Filter by Division:</label>
            <select
              id="divisionFilter"
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-box">
            <label htmlFor="areaFilter">Filter by Area:</label>
            <select
              id="areaFilter"
              value={selectedArea}
              onChange={(e) => onAreaChange(e.target.value)}
              className="filter-select"
              disabled={!selectedDivision}
            >
              <option value="">All Areas</option>
              {areas.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {viewMode === 'division' && (
        <div className="filter-container">
          <div className="filter-box">
            <label htmlFor="divisionFilterSummary">Filter by Division:</label>
            <select
              id="divisionFilterSummary"
              value={selectedDivision}
              onChange={(e) => onDivisionChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {viewMode === 'area' && (
        <div className="filter-container">
          <div className="filter-box">
            <label htmlFor="divisionFilterArea">Filter by Division:</label>
            <select
              id="divisionFilterArea"
              value={selectedDivision}
              onChange={(e) => onDivisionChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <DataTable data={filteredData} />
    </section>
  );
}

export default DivisionSummary;
