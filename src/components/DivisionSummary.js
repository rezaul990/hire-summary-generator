import React, { useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import './DivisionSummary.css';
import DataTable from './DataTable';

function DivisionSummary({ data, divisions, selectedDivision, onDivisionChange, selectedArea, onAreaChange, onDownload }) {
  const [viewMode, setViewMode] = React.useState('division'); // Start with 'division' view
  const tableRef = useRef(null);

  const handleScreenshot = async () => {
    if (!tableRef.current) return;

    try {
      // Show loading indicator
      const originalButtonText = document.querySelector('.summary-section .screenshot-btn');
      if (originalButtonText) {
        originalButtonText.textContent = '⏳ Capturing...';
        originalButtonText.disabled = true;
      }

      // Add capturing class
      tableRef.current.classList.add('capturing');

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get the actual dimensions
      const rect = tableRef.current.getBoundingClientRect();
      const scrollWidth = tableRef.current.scrollWidth;
      const scrollHeight = tableRef.current.scrollHeight;

      const canvas = await html2canvas(tableRef.current, {
        scale: 4, // Even higher scale for maximum clarity
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: scrollWidth,
        height: scrollHeight,
        windowWidth: scrollWidth,
        windowHeight: scrollHeight,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.screenshot-container');
          if (clonedElement) {
            clonedElement.style.overflow = 'visible';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.height = 'auto';
            clonedElement.style.width = scrollWidth + 'px';
            
            const wrapper = clonedElement.querySelector('.table-wrapper');
            if (wrapper) {
              wrapper.style.overflow = 'visible';
              wrapper.style.maxHeight = 'none';
              wrapper.style.height = 'auto';
            }

            // Ensure all text is sharp and bold
            const allText = clonedElement.querySelectorAll('*');
            allText.forEach(el => {
              el.style.webkitFontSmoothing = 'antialiased';
              el.style.mozOsxFontSmoothing = 'grayscale';
              el.style.textRendering = 'optimizeLegibility';
              el.style.fontWeight = 'bold';
            });
          }
        }
      });

      // Remove capturing class
      tableRef.current.classList.remove('capturing');

      // Restore button
      if (originalButtonText) {
        originalButtonText.textContent = '📸 Screenshot';
        originalButtonText.disabled = false;
      }

      // Convert canvas to blob with high quality
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filterInfo = selectedDivision ? `-${selectedDivision}` : '';
        link.download = `division-summary${filterInfo}-${timestamp}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0); // Maximum quality PNG
    } catch (error) {
      console.error('Screenshot failed:', error);
      tableRef.current.classList.remove('capturing');
      
      // Restore button
      const btn = document.querySelector('.summary-section .screenshot-btn');
      if (btn) {
        btn.textContent = '📸 Screenshot';
        btn.disabled = false;
      }
      
      alert('Failed to capture screenshot. Please try again.');
    }
  };

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
        <div className="header-actions">
          <button className="screenshot-btn" onClick={handleScreenshot} title="Take Screenshot">
            📸 Screenshot
          </button>
          <button className="download-btn" onClick={onDownload}>
            ⬇ Download Excel
          </button>
        </div>
      </div>

      <div ref={tableRef} className="screenshot-container">
        <div className="screenshot-header">
          <h3 className="screenshot-title">📊 Division & Area Wise Summary</h3>
          <div className="screenshot-filters">
            <span className="filter-info">View: <strong>{viewMode === 'division' ? 'Division Summary' : viewMode === 'area' ? 'Area View' : 'Detailed View'}</strong></span>
            {selectedDivision && <span className="filter-info">Division: <strong>{selectedDivision}</strong></span>}
            {selectedArea && <span className="filter-info">Area: <strong>{selectedArea}</strong></span>}
            <span className="filter-info">Date: <strong>{new Date().toLocaleDateString()}</strong></span>
          </div>
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
      </div>
    </section>
  );
}

export default DivisionSummary;
