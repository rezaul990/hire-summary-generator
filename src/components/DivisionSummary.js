import React, { useMemo } from 'react';
import './DivisionSummary.css';
import DataTable from './DataTable';

function DivisionSummary({ data, divisions, selectedDivision, onDivisionChange, selectedArea, onAreaChange, onDownload }) {
  const [viewMode, setViewMode] = React.useState('detailed'); // 'detailed' or 'division'

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

        // Add grand total
        if (filtered.length > 0) {
          const grandTotalRow = data.find(r => r.isGrandTotal);
          if (grandTotalRow) {
            filtered.push(grandTotalRow);
          }
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

      <DataTable data={filteredData} />
    </section>
  );
}

export default DivisionSummary;
