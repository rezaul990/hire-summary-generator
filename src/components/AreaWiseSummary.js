import React, { useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import './AreaWiseSummary.css';
import DataTable from './DataTable';

function AreaWiseSummary({ data, divisions, selectedDivision, onDivisionChange, onDownload }) {
  const [selectedArea, setSelectedArea] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false); // Initially collapsed
  const tableRef = useRef(null);

  const handleScreenshot = async () => {
    if (!tableRef.current) return;

    try {
      // Show loading indicator
      const originalButtonText = document.querySelector('.area-wise-section .screenshot-btn');
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
        const areaInfo = selectedArea ? `-${selectedArea}` : '';
        link.download = `area-wise-summary${filterInfo}${areaInfo}-${timestamp}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0); // Maximum quality PNG
    } catch (error) {
      console.error('Screenshot failed:', error);
      tableRef.current.classList.remove('capturing');
      
      // Restore button
      const btn = document.querySelector('.area-wise-section .screenshot-btn');
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

    if (!selectedDivision && !selectedArea) {
      filtered = data;
    } else {
      data.forEach(row => {
        if (row.isGrandTotal) {
          return;
        }
        if (row.isSubtotal) {
          const areaName = row.Area.replace(' - SUBTOTAL', '');
          const areaPlazas = data.filter(
            r => !r.isSubtotal && !r.isGrandTotal && r.Area === areaName
          );

          const hasMatch = areaPlazas.some(r => {
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

      // Add filtered grand total
      let grandTotalQty = 0, grandTotalCollectedQty = 0, grandTotalAmt = 0, grandTotalCollectedAmt = 0, grandTotalPrevOverdue = 0, grandTotalRunOverdue = 0;
      
      filtered.forEach(row => {
        if (!row.isSubtotal) {
          grandTotalQty += parseFloat(row.Collectible_Acc_Qty) || 0;
          grandTotalCollectedQty += parseFloat(row.Collected_Acc_Qty) || 0;
          grandTotalAmt += parseFloat(row.Collectible_Amount) || 0;
          grandTotalCollectedAmt += parseFloat(row.Collected_Amount) || 0;
          grandTotalPrevOverdue += parseFloat(row.Previous_Overdue) || 0;
          grandTotalRunOverdue += parseFloat(row.Running_Overdue) || 0;
        }
      });

      filtered.push({
        Division: '',
        Area: 'GRAND TOTAL',
        Plaza: '',
        Collectible_Acc_Qty: grandTotalQty,
        Collected_Acc_Qty: grandTotalCollectedQty,
        Collection_Qty_Percent: grandTotalQty > 0 ? ((grandTotalCollectedQty / grandTotalQty) * 100).toFixed(2) : '0.00',
        Collectible_Amount: grandTotalAmt,
        Collected_Amount: grandTotalCollectedAmt,
        Collection_Amt_Percent: grandTotalAmt > 0 ? ((grandTotalCollectedAmt / grandTotalAmt) * 100).toFixed(2) : '0.00',
        Previous_Overdue: grandTotalPrevOverdue,
        Running_Overdue: grandTotalRunOverdue,
        Overdue_Change: grandTotalRunOverdue - grandTotalPrevOverdue,
        isGrandTotal: true,
      });
    }

    return filtered;
  }, [data, selectedDivision, selectedArea]);

  const handleDivisionChange = (division) => {
    onDivisionChange(division);
    setSelectedArea('');
  };

  const handleDownload = () => {
    const downloadData = filteredData.map(({ isSubtotal, isGrandTotal, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(downloadData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Area_Wise_Summary');
    XLSX.writeFile(workbook, 'area_wise_summary.xlsx');
  };

  return (
    <section className="summary-section area-wise-section">
      <div className="section-header collapsible-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-title">
          <span className="collapse-icon">{isExpanded ? '▼' : '▶'}</span>
          <div className="header-text">
            <h2>📍 Area Wise Summary with Plaza Details</h2>
            {!isExpanded && <p className="expand-instruction">Click to expand and view plaza details</p>}
          </div>
        </div>
        <div className="header-actions">
          {isExpanded && (
            <button 
              className="screenshot-btn" 
              onClick={(e) => {
                e.stopPropagation();
                handleScreenshot();
              }}
              title="Take Screenshot"
            >
              📸 Screenshot
            </button>
          )}
          <button 
            className="download-btn" 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            ⬇ Download Excel
          </button>
        </div>
      </div>

      {isExpanded && (
        <div ref={tableRef} className="collapsible-content screenshot-container">
          <div className="screenshot-header">
            <h3 className="screenshot-title">📍 Area Wise Summary with Plaza Details</h3>
            <div className="screenshot-filters">
              {selectedDivision && <span className="filter-info">Division: <strong>{selectedDivision}</strong></span>}
              {selectedArea && <span className="filter-info">Area: <strong>{selectedArea}</strong></span>}
              <span className="filter-info">Date: <strong>{new Date().toLocaleDateString()}</strong></span>
            </div>
          </div>

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
                onChange={(e) => setSelectedArea(e.target.value)}
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

          <DataTable data={filteredData} />
        </div>
      )}
    </section>
  );
}

export default AreaWiseSummary;
