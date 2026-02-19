import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
import FileUpload from './components/FileUpload';
import DivisionSummary from './components/DivisionSummary';
import AreaWiseSummary from './components/AreaWiseSummary';
import DailyComparison from './components/DailyComparison';
import OverdueStatistics from './components/OverdueStatistics';
import AnalyticsSection from './components/AnalyticsSection';

function App() {
  const [divisionData, setDivisionData] = useState([]);
  const [areaWiseData, setAreaWiseData] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(false);
  const statisticsRef = React.useRef(null);

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

  const handleFile = (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Please upload a valid Excel file (.xls or .xlsx)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ File size exceeds 10MB limit');
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        processData(raw);
      } catch (error) {
        alert('❌ Error reading file. Please ensure it is a valid Excel file.');
        console.error('File read error:', error);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading file');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const processData = (raw) => {
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

    generateSummaries(rows);
  };

  const generateSummaries = (rows) => {
    const grouped = {};
    const areaWiseMap = {};

    rows.forEach(row => {
      const divisionCol = findColumn(row, ['division']);
      const areaCol = findColumn(row, ['area']);
      const plazaCol = findColumn(row, ['plaza']);

      const collectibleQtyCol = findColumn(row, ['collectibleaccqty']);
      const collectedQtyCol = findColumn(row, ['collectedaccqty']);
      const collectibleAmtCol = findColumn(row, ['collectibleamt']);
      const collectedAmtCol = findColumn(row, ['collectedamt']);
      const prevOverdueCol = findColumn(row, ['previousmonthoverdue']);
      const runOverdueCol = findColumn(row, ['runningmonthoverdue']);

      const division = String(row[divisionCol] || '').trim();
      const area = String(row[areaCol] || '').trim();
      const plaza = String(row[plazaCol] || '').trim();

      if (!division || !area || division.toLowerCase() === 'division' || area.toLowerCase() === 'area') return;

      const collectibleQty = toNumber(row[collectibleQtyCol]);
      const collectedQty = toNumber(row[collectedQtyCol]);
      const collectibleAmt = toNumber(row[collectibleAmtCol]);
      const collectedAmt = toNumber(row[collectedAmtCol]);
      const prevOverdue = toNumber(row[prevOverdueCol]);
      const runOverdue = toNumber(row[runOverdueCol]);

      const key = division + '|' + area;

      if (!grouped[key]) {
        grouped[key] = {
          Division: division,
          Area: area,
          CollectibleQty: 0,
          CollectedQty: 0,
          CollectibleAmt: 0,
          CollectedAmt: 0,
          PrevOverdue: 0,
          RunOverdue: 0,
        };
      }

      grouped[key].CollectibleQty += collectibleQty;
      grouped[key].CollectedQty += collectedQty;
      grouped[key].CollectibleAmt += collectibleAmt;
      grouped[key].CollectedAmt += collectedAmt;
      grouped[key].PrevOverdue += prevOverdue;
      grouped[key].RunOverdue += runOverdue;

      const areaKey = area;
      if (!areaWiseMap[areaKey]) {
        areaWiseMap[areaKey] = [];
      }
      areaWiseMap[areaKey].push({
        Division: division,
        Area: area,
        Plaza: plaza,
        Collectible_Acc_Qty: collectibleQty,
        Collected_Acc_Qty: collectedQty,
        Collection_Qty_Percent: collectibleQty > 0 ? ((collectedQty / collectibleQty) * 100).toFixed(2) : '0.00',
        Collectible_Amount: collectibleAmt,
        Collected_Amount: collectedAmt,
        Collection_Amt_Percent: collectibleAmt > 0 ? ((collectedAmt / collectibleAmt) * 100).toFixed(2) : '0.00',
        Previous_Overdue: prevOverdue,
        Running_Overdue: runOverdue,
        Overdue_Change: runOverdue - prevOverdue,
      });
    });

    const divisionSummary = generateDivisionSummary(grouped);
    const areaWiseSummary = generateAreaWiseSummary(areaWiseMap);

    setDivisionData(divisionSummary);
    setAreaWiseData(areaWiseSummary);

    const divisionList = [...new Set(areaWiseSummary.map(d => d.Division).filter(d => d && !d.includes('SUBTOTAL')))].sort();
    setDivisions(divisionList);
    setSelectedDivision('');
  };

  const generateDivisionSummary = (grouped) => {
    let summaryData = [];
    const divisionGroups = {};
    let grandTotalQty = 0, grandTotalCollectedQty = 0, grandTotalAmt = 0, grandTotalCollectedAmt = 0, grandTotalPrevOverdue = 0, grandTotalRunOverdue = 0;

    Object.values(grouped).forEach(row => {
      if (!divisionGroups[row.Division]) {
        divisionGroups[row.Division] = [];
      }
      divisionGroups[row.Division].push(row);
      grandTotalQty += row.CollectibleQty;
      grandTotalCollectedQty += row.CollectedQty;
      grandTotalAmt += row.CollectibleAmt;
      grandTotalCollectedAmt += row.CollectedAmt;
      grandTotalPrevOverdue += row.PrevOverdue;
      grandTotalRunOverdue += row.RunOverdue;
    });

    Object.keys(divisionGroups)
      .sort()
      .forEach(division => {
        const areas = divisionGroups[division];

        areas.forEach(area => {
          summaryData.push({
            Division: area.Division,
            Area: area.Area,
            Collectible_Acc_Qty: area.CollectibleQty,
            Collected_Acc_Qty: area.CollectedQty,
            Collection_Qty_Percent: area.CollectibleQty > 0 ? ((area.CollectedQty / area.CollectibleQty) * 100).toFixed(2) : '0.00',
            Collectible_Amount: area.CollectibleAmt,
            Collected_Amount: area.CollectedAmt,
            Collection_Amt_Percent: area.CollectibleAmt > 0 ? ((area.CollectedAmt / area.CollectibleAmt) * 100).toFixed(2) : '0.00',
            Previous_Overdue: area.PrevOverdue,
            Running_Overdue: area.RunOverdue,
            Overdue_Change: area.RunOverdue - area.PrevOverdue,
          });
        });

        const collectibleQtySum = areas.reduce((sum, a) => sum + a.CollectibleQty, 0);
        const collectedQtySum = areas.reduce((sum, a) => sum + a.CollectedQty, 0);
        const collectibleAmtSum = areas.reduce((sum, a) => sum + a.CollectibleAmt, 0);
        const collectedAmtSum = areas.reduce((sum, a) => sum + a.CollectedAmt, 0);
        const prevOverdueSum = areas.reduce((sum, a) => sum + a.PrevOverdue, 0);
        const runOverdueSum = areas.reduce((sum, a) => sum + a.RunOverdue, 0);

        summaryData.push({
          Division: '',
          Area: `${division} - SUBTOTAL`,
          Collectible_Acc_Qty: collectibleQtySum,
          Collected_Acc_Qty: collectedQtySum,
          Collection_Qty_Percent: collectibleQtySum > 0 ? ((collectedQtySum / collectibleQtySum) * 100).toFixed(2) : '0.00',
          Collectible_Amount: collectibleAmtSum,
          Collected_Amount: collectedAmtSum,
          Collection_Amt_Percent: collectibleAmtSum > 0 ? ((collectedAmtSum / collectibleAmtSum) * 100).toFixed(2) : '0.00',
          Previous_Overdue: prevOverdueSum,
          Running_Overdue: runOverdueSum,
          Overdue_Change: runOverdueSum - prevOverdueSum,
          isSubtotal: true,
        });
      });

    summaryData.push({
      Division: '',
      Area: 'GRAND TOTAL',
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

    return summaryData;
  };

  const generateAreaWiseSummary = (areaWiseMap) => {
    let areaWiseSummary = [];

    Object.keys(areaWiseMap)
      .sort()
      .forEach(area => {
        const plazas = areaWiseMap[area];
        
        // Add individual plaza rows
        plazas.forEach(plaza => {
          areaWiseSummary.push(plaza);
        });

        // Add area subtotal after all plazas of that area
        const collectibleQtySum = plazas.reduce((sum, p) => sum + toNumber(p.Collectible_Acc_Qty), 0);
        const collectedQtySum = plazas.reduce((sum, p) => sum + toNumber(p.Collected_Acc_Qty), 0);
        const collectibleAmtSum = plazas.reduce((sum, p) => sum + toNumber(p.Collectible_Amount), 0);
        const collectedAmtSum = plazas.reduce((sum, p) => sum + toNumber(p.Collected_Amount), 0);
        const prevOverdueSum = plazas.reduce((sum, p) => sum + toNumber(p.Previous_Overdue), 0);
        const runOverdueSum = plazas.reduce((sum, p) => sum + toNumber(p.Running_Overdue), 0);

        areaWiseSummary.push({
          Division: '',
          Area: `${area} - SUBTOTAL`,
          Plaza: '',
          Collectible_Acc_Qty: collectibleQtySum,
          Collected_Acc_Qty: collectedQtySum,
          Collection_Qty_Percent: collectibleQtySum > 0 ? ((collectedQtySum / collectibleQtySum) * 100).toFixed(2) : '0.00',
          Collectible_Amount: collectibleAmtSum,
          Collected_Amount: collectedAmtSum,
          Collection_Amt_Percent: collectibleAmtSum > 0 ? ((collectedAmtSum / collectibleAmtSum) * 100).toFixed(2) : '0.00',
          Previous_Overdue: prevOverdueSum,
          Running_Overdue: runOverdueSum,
          Overdue_Change: runOverdueSum - prevOverdueSum,
          isSubtotal: true,
        });
      });

    // Add grand total for area-wise summary
    let grandTotalQty = 0, grandTotalCollectedQty = 0, grandTotalAmt = 0, grandTotalCollectedAmt = 0, grandTotalPrevOverdue = 0, grandTotalRunOverdue = 0;
    
    Object.values(areaWiseMap).forEach(plazas => {
      plazas.forEach(plaza => {
        grandTotalQty += toNumber(plaza.Collectible_Acc_Qty);
        grandTotalCollectedQty += toNumber(plaza.Collected_Acc_Qty);
        grandTotalAmt += toNumber(plaza.Collectible_Amount);
        grandTotalCollectedAmt += toNumber(plaza.Collected_Amount);
        grandTotalPrevOverdue += toNumber(plaza.Previous_Overdue);
        grandTotalRunOverdue += toNumber(plaza.Running_Overdue);
      });
    });

    areaWiseSummary.push({
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

    return areaWiseSummary;
  };

  const downloadExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
    XLSX.writeFile(workbook, filename);
  };

  const scrollToStatistics = () => {
    if (statisticsRef.current) {
      statisticsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app">
      <div className="credit-top">
        <p>Developer: <strong>Md. Rezaul Karim RCM</strong></p>
      </div>
      <div className="container">
        <header className="header">
          <h1>📊 Walton Division & Area Wise Summary</h1>
          <p>Upload your Excel file to generate summaries</p>
          {divisionData.length > 0 && (
            <button className="go-to-stats-btn" onClick={scrollToStatistics}>
              ⬇ Go to Statistics
            </button>
          )}
        </header>

        <div className="instruction-box">
          <h3>📋 Instructions / নির্দেশনা</h3>
          <p>POS এ লগিন করে - Sales &gt; Reports &gt; Hire Acc Target & Ach &gt; Collection Tr. & Achv. Summary Report ডাউনলোড করে আপলোড করুন</p>
        </div>

        <FileUpload onFileUpload={handleFile} loading={loading} />

        {divisionData.length > 0 && (
          <>
            <DivisionSummary 
              data={divisionData} 
              divisions={divisions}
              selectedDivision={selectedDivision}
              onDivisionChange={setSelectedDivision}
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              onDownload={() => downloadExcel(divisionData, 'division_summary.xlsx')} 
            />
            <AreaWiseSummary
              data={areaWiseData}
              divisions={divisions}
              selectedDivision={selectedDivision}
              onDivisionChange={setSelectedDivision}
              onDownload={() => downloadExcel(areaWiseData, 'area_wise_summary.xlsx')}
            />
            <DailyComparison />
            <div ref={statisticsRef}>
              <OverdueStatistics areaWiseData={areaWiseData} divisionData={divisionData} />
            </div>
            <AnalyticsSection areaWiseData={areaWiseData} />
          </>
        )}
      </div>
      <div className="credit-bottom">
        <p>Developer: <strong>Md. Rezaul Karim RCM</strong></p>
      </div>
    </div>
  );
}

export default App;
