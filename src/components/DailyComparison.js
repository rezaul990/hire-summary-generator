import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import './DailyComparison.css';
import DataTable from './DataTable';

function DailyComparison() {
  const [previousData, setPreviousData] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [fullComparisonData, setFullComparisonData] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [divisions, setDivisions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [viewMode, setViewMode] = useState('detailed');

  const toNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'string') val = val.replace(/,/g, '');
    return isNaN(val) ? 0 : Number(val);
  };

  const normalize = (text) => {
    return String(text).replace(/\s+/g, '').replace(/\./g, '').toLowerCase();
  };

  const findColumn = (row, keywords) => {
    for (let col in row) {
      const name = normalize(col);
      if (keywords.some(k => name.includes(k))) return col;
    }
    return null;
  };

  const processFile = (file, isCurrentDay) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      let headerIndex = -1;
      for (let i = 0; i < raw.length; i++) {
        const text = raw[i].join(' ').toLowerCase();
        if (
          text.includes('division') &&
          text.includes('area') &&
          text.includes('plaza') &&
          text.includes('collectible')
        ) {
          headerIndex = i;
          break;
        }
      }

      if (headerIndex === -1) {
        alert('❌ Could not detect header row.');
        return;
      }

      const headers = raw[headerIndex];
      const dataRows = raw.slice(headerIndex + 1);

      const rows = dataRows.map(r => {
        let obj = {};
        headers.forEach((h, i) => (obj[h] = r[i]));
        return obj;
      });

      const processedData = rows
        .map(row => {
          const divisionCol = findColumn(row, ['division']);
          const areaCol = findColumn(row, ['area']);
          const plazaCol = findColumn(row, ['plaza']);
          const collectedQtyCol = findColumn(row, ['collectedaccqty']);
          const collectedAmtCol = findColumn(row, ['collectedamt']);
          const runOverdueCol = findColumn(row, ['runningmonthoverdue']);
          const prevOverdueCol = findColumn(row, ['previousmonthoverdue']);

          const division = String(row[divisionCol] || '').trim();
          const area = String(row[areaCol] || '').trim();
          const plaza = String(row[plazaCol] || '').trim();

          if (!division || !area || division.toLowerCase() === 'division' || area.toLowerCase() === 'area') return null;

          return {
            Division: division,
            Area: area,
            Plaza: plaza,
            Collected_Acc_Qty: toNumber(row[collectedQtyCol]),
            Collected_Amount: toNumber(row[collectedAmtCol]),
            Running_Overdue: toNumber(row[runOverdueCol]),
            Previous_Overdue: toNumber(row[prevOverdueCol]),
          };
        })
        .filter(r => r !== null);

      if (isCurrentDay) {
        setCurrentData(processedData);
      } else {
        setPreviousData(processedData);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const generateComparison = () => {
    if (!previousData || !currentData) {
      alert('Please upload both previous day and current day files');
      return;
    }

    const comparison = [];

    currentData.forEach(currentRow => {
      const key = `${currentRow.Division}|${currentRow.Area}|${currentRow.Plaza}`;
      const prevRow = previousData.find(
        r => `${r.Division}|${r.Area}|${r.Plaza}` === key
      );

      const prevQty = prevRow ? prevRow.Collected_Acc_Qty : 0;
      const prevAmt = prevRow ? prevRow.Collected_Amount : 0;
      const prevOverdue = prevRow ? prevRow.Running_Overdue : 0;
      const dailyQty = currentRow.Collected_Acc_Qty - prevQty;
      const dailyAmt = currentRow.Collected_Amount - prevAmt;
      const todaysOverdueCollection = prevOverdue - currentRow.Running_Overdue;

      comparison.push({
        Division: currentRow.Division,
        Area: currentRow.Area,
        Plaza: currentRow.Plaza,
        Previous_Collected_Qty: prevQty,
        Current_Collected_Qty: currentRow.Collected_Acc_Qty,
        Daily_Collected_Qty: dailyQty,
        Previous_Collected_Amt: prevAmt,
        Current_Collected_Amt: currentRow.Collected_Amount,
        Daily_Collected_Amt: dailyAmt,
        Previous_Overdue: prevOverdue,
        Current_Overdue: currentRow.Running_Overdue,
        Todays_Overdue_Collection: todaysOverdueCollection,
      });
    });

    // Add area subtotals
    const areaGroups = {};
    comparison.forEach(row => {
      if (!areaGroups[row.Area]) {
        areaGroups[row.Area] = [];
      }
      areaGroups[row.Area].push(row);
    });

    const withSubtotals = [];
    Object.keys(areaGroups)
      .sort()
      .forEach(area => {
        const plazas = areaGroups[area];
        plazas.forEach(plaza => {
          withSubtotals.push(plaza);
        });

        const prevQtySum = plazas.reduce((sum, p) => sum + p.Previous_Collected_Qty, 0);
        const currQtySum = plazas.reduce((sum, p) => sum + p.Current_Collected_Qty, 0);
        const dailyQtySum = plazas.reduce((sum, p) => sum + p.Daily_Collected_Qty, 0);
        const prevAmtSum = plazas.reduce((sum, p) => sum + p.Previous_Collected_Amt, 0);
        const currAmtSum = plazas.reduce((sum, p) => sum + p.Current_Collected_Amt, 0);
        const dailyAmtSum = plazas.reduce((sum, p) => sum + p.Daily_Collected_Amt, 0);
        const prevOverdueSum = plazas.reduce((sum, p) => sum + p.Previous_Overdue, 0);
        const currOverdueSum = plazas.reduce((sum, p) => sum + p.Current_Overdue, 0);
        const todaysOverdueCollectionSum = plazas.reduce((sum, p) => sum + p.Todays_Overdue_Collection, 0);

        withSubtotals.push({
          Division: '',
          Area: `${area} - SUBTOTAL`,
          Plaza: '',
          Previous_Collected_Qty: prevQtySum,
          Current_Collected_Qty: currQtySum,
          Daily_Collected_Qty: dailyQtySum,
          Previous_Collected_Amt: prevAmtSum,
          Current_Collected_Amt: currAmtSum,
          Daily_Collected_Amt: dailyAmtSum,
          Previous_Overdue: prevOverdueSum,
          Current_Overdue: currOverdueSum,
          Todays_Overdue_Collection: todaysOverdueCollectionSum,
          isSubtotal: true,
        });
      });

    // Add grand total
    const grandPrevQty = comparison.reduce((sum, r) => sum + r.Previous_Collected_Qty, 0);
    const grandCurrQty = comparison.reduce((sum, r) => sum + r.Current_Collected_Qty, 0);
    const grandDailyQty = comparison.reduce((sum, r) => sum + r.Daily_Collected_Qty, 0);
    const grandPrevAmt = comparison.reduce((sum, r) => sum + r.Previous_Collected_Amt, 0);
    const grandCurrAmt = comparison.reduce((sum, r) => sum + r.Current_Collected_Amt, 0);
    const grandDailyAmt = comparison.reduce((sum, r) => sum + r.Daily_Collected_Amt, 0);
    const grandPrevOverdue = comparison.reduce((sum, r) => sum + r.Previous_Overdue, 0);
    const grandCurrOverdue = comparison.reduce((sum, r) => sum + r.Current_Overdue, 0);
    const grandTodaysOverdueCollection = comparison.reduce((sum, r) => sum + r.Todays_Overdue_Collection, 0);

    withSubtotals.push({
      Division: '',
      Area: 'GRAND TOTAL',
      Plaza: '',
      Previous_Collected_Qty: grandPrevQty,
      Current_Collected_Qty: grandCurrQty,
      Daily_Collected_Qty: grandDailyQty,
      Previous_Collected_Amt: grandPrevAmt,
      Current_Collected_Amt: grandCurrAmt,
      Daily_Collected_Amt: grandDailyAmt,
      Previous_Overdue: grandPrevOverdue,
      Current_Overdue: grandCurrOverdue,
      Todays_Overdue_Collection: grandTodaysOverdueCollection,
      isGrandTotal: true,
    });

    setFullComparisonData(withSubtotals);
    setComparisonData(withSubtotals);

    const uniqueDivisions = [...new Set(comparison.map(r => r.Division))].sort();
    setDivisions(uniqueDivisions);
    setSelectedDivision('');
    setSelectedArea('');
    setAreas([]);
  };

  const filteredData = useMemo(() => {
    if (!selectedDivision && !selectedArea && viewMode === 'detailed') return comparisonData;

    let filtered = [];

    if (viewMode === 'division') {
      // Show only division-wise totals with grand total
      const divisionGroups = {};
      
      fullComparisonData.forEach(row => {
        if (!row.isSubtotal && !row.isGrandTotal) {
          if (!divisionGroups[row.Division]) {
            divisionGroups[row.Division] = [];
          }
          divisionGroups[row.Division].push(row);
        }
      });

      Object.keys(divisionGroups).sort().forEach(division => {
        const rows = divisionGroups[division];
        
        const prevQtySum = rows.reduce((sum, r) => sum + r.Previous_Collected_Qty, 0);
        const currQtySum = rows.reduce((sum, r) => sum + r.Current_Collected_Qty, 0);
        const dailyQtySum = rows.reduce((sum, r) => sum + r.Daily_Collected_Qty, 0);
        const prevAmtSum = rows.reduce((sum, r) => sum + r.Previous_Collected_Amt, 0);
        const currAmtSum = rows.reduce((sum, r) => sum + r.Current_Collected_Amt, 0);
        const dailyAmtSum = rows.reduce((sum, r) => sum + r.Daily_Collected_Amt, 0);
        const prevOverdueSum = rows.reduce((sum, r) => sum + r.Previous_Overdue, 0);
        const currOverdueSum = rows.reduce((sum, r) => sum + r.Current_Overdue, 0);
        const todaysOverdueSum = rows.reduce((sum, r) => sum + r.Todays_Overdue_Collection, 0);

        if (!selectedDivision || selectedDivision === division) {
          filtered.push({
            Division: division,
            Area: '',
            Plaza: '',
            Previous_Collected_Qty: prevQtySum,
            Current_Collected_Qty: currQtySum,
            Daily_Collected_Qty: dailyQtySum,
            Previous_Collected_Amt: prevAmtSum,
            Current_Collected_Amt: currAmtSum,
            Daily_Collected_Amt: dailyAmtSum,
            Previous_Overdue: prevOverdueSum,
            Current_Overdue: currOverdueSum,
            Todays_Overdue_Collection: todaysOverdueSum,
            isDivisionTotal: true,
          });
        }
      });

      // Add grand total
      if (filtered.length > 0) {
        const grandTotalRow = fullComparisonData.find(r => r.isGrandTotal);
        if (grandTotalRow) {
          filtered.push(grandTotalRow);
        }
      }
    } else if (viewMode === 'area') {
      // Show only area-wise totals with grand total
      const areaGroups = {};
      
      fullComparisonData.forEach(row => {
        if (!row.isSubtotal && !row.isGrandTotal) {
          if (!areaGroups[row.Area]) {
            areaGroups[row.Area] = [];
          }
          areaGroups[row.Area].push(row);
        }
      });

      Object.keys(areaGroups).sort().forEach(area => {
        const rows = areaGroups[area];
        
        const prevQtySum = rows.reduce((sum, r) => sum + r.Previous_Collected_Qty, 0);
        const currQtySum = rows.reduce((sum, r) => sum + r.Current_Collected_Qty, 0);
        const dailyQtySum = rows.reduce((sum, r) => sum + r.Daily_Collected_Qty, 0);
        const prevAmtSum = rows.reduce((sum, r) => sum + r.Previous_Collected_Amt, 0);
        const currAmtSum = rows.reduce((sum, r) => sum + r.Current_Collected_Amt, 0);
        const dailyAmtSum = rows.reduce((sum, r) => sum + r.Daily_Collected_Amt, 0);
        const prevOverdueSum = rows.reduce((sum, r) => sum + r.Previous_Overdue, 0);
        const currOverdueSum = rows.reduce((sum, r) => sum + r.Current_Overdue, 0);
        const todaysOverdueSum = rows.reduce((sum, r) => sum + r.Todays_Overdue_Collection, 0);

        if (!selectedDivision || rows.some(r => r.Division === selectedDivision)) {
          filtered.push({
            Division: rows[0].Division,
            Area: area,
            Plaza: '',
            Previous_Collected_Qty: prevQtySum,
            Current_Collected_Qty: currQtySum,
            Daily_Collected_Qty: dailyQtySum,
            Previous_Collected_Amt: prevAmtSum,
            Current_Collected_Amt: currAmtSum,
            Daily_Collected_Amt: dailyAmtSum,
            Previous_Overdue: prevOverdueSum,
            Current_Overdue: currOverdueSum,
            Todays_Overdue_Collection: todaysOverdueSum,
            isAreaTotal: true,
          });
        }
      });

      // Add grand total
      if (filtered.length > 0) {
        const grandTotalRow = fullComparisonData.find(r => r.isGrandTotal);
        if (grandTotalRow) {
          filtered.push(grandTotalRow);
        }
      }
    } else {
      // Detailed view
      fullComparisonData.forEach(row => {
        if (row.isGrandTotal) return;

        if (row.isSubtotal) {
          const areaName = row.Area.replace(' - SUBTOTAL', '');
          const matchingRows = fullComparisonData.filter(
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

      if (filtered.length > 0) {
        const grandTotalRow = fullComparisonData.find(r => r.isGrandTotal);
        if (grandTotalRow) {
          filtered.push(grandTotalRow);
        }
      }
    }

    return filtered;
  }, [selectedDivision, selectedArea, fullComparisonData, comparisonData, viewMode]);

  const handleDivisionChange = (division) => {
    setSelectedDivision(division);
    setSelectedArea('');

    if (division) {
      const uniqueAreas = [...new Set(fullComparisonData
        .filter(r => !r.isSubtotal && !r.isGrandTotal && r.Division === division)
        .map(r => r.Area)
      )].sort();
      setAreas(uniqueAreas);
    } else {
      setAreas([]);
    }
  };

  const handleDownload = () => {
    const downloadData = filteredData.map(({ isSubtotal, isGrandTotal, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(downloadData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily_Comparison');
    XLSX.writeFile(workbook, 'daily_comparison.xlsx');
  };

  return (
    <section className="summary-section daily-comparison-section">
      <div className="section-header">
        <h2>📈 Daily Collection Comparison</h2>
        <button className="download-btn" onClick={handleDownload} disabled={filteredData.length === 0}>
          ⬇ Download Excel
        </button>
      </div>

      <div className="comparison-upload-container">
        <div className="upload-box">
          <label>Previous Day File</label>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => e.target.files[0] && processFile(e.target.files[0], false)}
            className="file-input"
          />
          {previousData && <span className="file-status">✓ Loaded</span>}
        </div>

        <div className="upload-box">
          <label>Current Day File</label>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => e.target.files[0] && processFile(e.target.files[0], true)}
            className="file-input"
          />
          {currentData && <span className="file-status">✓ Loaded</span>}
        </div>

        <button
          className="compare-btn"
          onClick={generateComparison}
          disabled={!previousData || !currentData}
        >
          Compare
        </button>
      </div>

      {comparisonData.length > 0 && (
        <>
          <div className="view-mode-container">
            <label>View Mode:</label>
            <div className="view-mode-buttons">
              <button
                className={`mode-btn ${viewMode === 'detailed' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('detailed');
                  setSelectedDivision('');
                  setSelectedArea('');
                }}
              >
                Detailed View
              </button>
              <button
                className={`mode-btn ${viewMode === 'division' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('division');
                  setSelectedDivision('');
                  setSelectedArea('');
                }}
              >
                Division View
              </button>
              <button
                className={`mode-btn ${viewMode === 'area' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('area');
                  setSelectedDivision('');
                  setSelectedArea('');
                }}
              >
                Area View
              </button>
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

            {viewMode === 'detailed' && (
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
            )}
          </div>
        </>
      )}

      {filteredData.length > 0 && <DataTable data={filteredData} />}
    </section>
  );
}

export default DailyComparison;
