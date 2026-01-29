import React, { useMemo } from 'react';
import * as XLSX from 'xlsx';
import './AreaWiseSummary.css';
import DataTable from './DataTable';

function AreaWiseSummary({ data, divisions, selectedDivision, onDivisionChange, onDownload }) {
  const [selectedArea, setSelectedArea] = React.useState('');

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
      <div className="section-header">
        <h2>📍 Area Wise Summary with Plaza Details</h2>
        <button className="download-btn" onClick={handleDownload}>
          ⬇ Download Excel
        </button>
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
    </section>
  );
}

export default AreaWiseSummary;
