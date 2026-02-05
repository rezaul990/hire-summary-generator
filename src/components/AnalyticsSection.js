import React, { useMemo, useState } from 'react';
import './AnalyticsSection.css';

function AnalyticsSection({ areaWiseData }) {
  const [expandedSections, setExpandedSections] = useState({});

  const analytics = useMemo(() => {
    if (!areaWiseData || areaWiseData.length === 0) {
      return {
        lowestQtyPlazas: [],
        lowestQtyAreas: [],
        lowestAmtPlazas: [],
        lowestAmtAreas: [],
        highestOverduePlazas: [],
        highestOverdueAreas: [],
      };
    }

    const plazas = [];
    const areas = new Map();

    // Collect plaza data
    areaWiseData.forEach(row => {
      if (row.isSubtotal || row.isGrandTotal) return;

      if (row.Plaza) {
        plazas.push({
          division: row.Division,
          area: row.Area,
          plaza: row.Plaza,
          collectionQtyPercent: parseFloat(row.Collection_Qty_Percent),
          collectionAmtPercent: parseFloat(row.Collection_Amt_Percent),
          overdueChange: parseFloat(row.Overdue_Change),
        });
      }

      // Collect area data
      if (row.Area && !areas.has(row.Area)) {
        areas.set(row.Area, {
          division: row.Division,
          area: row.Area,
          collectionQtyPercent: parseFloat(row.Collection_Qty_Percent),
          collectionAmtPercent: parseFloat(row.Collection_Amt_Percent),
          overdueChange: parseFloat(row.Overdue_Change),
        });
      }
    });

    // Get area subtotals from subtotal rows
    const areaSubtotals = new Map();
    areaWiseData.forEach(row => {
      if (row.isSubtotal && row.Area && row.Area.includes('SUBTOTAL') && !row.Area.includes('Division')) {
        const areaName = row.Area.replace(' - SUBTOTAL', '');
        areaSubtotals.set(areaName, {
          area: areaName,
          collectionQtyPercent: parseFloat(row.Collection_Qty_Percent),
          collectionAmtPercent: parseFloat(row.Collection_Amt_Percent),
          overdueChange: parseFloat(row.Overdue_Change),
        });
      }
    });

    // Sort and get top/bottom items
    const lowestQtyPlazas = plazas
      .sort((a, b) => a.collectionQtyPercent - b.collectionQtyPercent)
      .slice(0, 20);

    const lowestQtyAreas = Array.from(areaSubtotals.values())
      .sort((a, b) => a.collectionQtyPercent - b.collectionQtyPercent)
      .slice(0, 10);

    const lowestAmtPlazas = plazas
      .sort((a, b) => a.collectionAmtPercent - b.collectionAmtPercent)
      .slice(0, 20);

    const lowestAmtAreas = Array.from(areaSubtotals.values())
      .sort((a, b) => a.collectionAmtPercent - b.collectionAmtPercent)
      .slice(0, 10);

    const highestOverduePlazas = plazas
      .sort((a, b) => b.overdueChange - a.overdueChange)
      .slice(0, 20);

    const highestOverdueAreas = Array.from(areaSubtotals.values())
      .sort((a, b) => b.overdueChange - a.overdueChange)
      .slice(0, 10);

    return {
      lowestQtyPlazas,
      lowestQtyAreas,
      lowestAmtPlazas,
      lowestAmtAreas,
      highestOverduePlazas,
      highestOverdueAreas,
    };
  }, [areaWiseData]);

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const renderTable = (data, columns) => (
    <div className="analytics-table">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key} className={col.className || ''}>
                  {col.format ? col.format(item[col.key]) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="analytics-section">
      <div className="analytics-container">
        <h3>📈 Performance Analytics</h3>

        {/* Lowest Collection Qty Percentage */}
        <div className="analytics-card">
          <div 
            className="analytics-header"
            onClick={() => toggleSection('lowestQty')}
          >
            <h4>📉 20 Lowest Collection Qty % - Plazas</h4>
            <span className="toggle-icon">{expandedSections['lowestQty'] ? '▼' : '▶'}</span>
          </div>
          {expandedSections['lowestQty'] && (
            <div className="analytics-content">
              {renderTable(analytics.lowestQtyPlazas, [
                { key: 'plaza', label: 'Plaza Name' },
                { key: 'area', label: 'Area' },
                { key: 'division', label: 'Division' },
                { key: 'collectionQtyPercent', label: 'Collection Qty %', format: (v) => v.toFixed(2) + '%', className: 'text-right' },
              ])}
            </div>
          )}
        </div>

        <div className="analytics-card">
          <div 
            className="analytics-header"
            onClick={() => toggleSection('lowestQtyArea')}
          >
            <h4>📉 10 Lowest Collection Qty % - Areas</h4>
            <span className="toggle-icon">{expandedSections['lowestQtyArea'] ? '▼' : '▶'}</span>
          </div>
          {expandedSections['lowestQtyArea'] && (
            <div className="analytics-content">
              {renderTable(analytics.lowestQtyAreas, [
                { key: 'area', label: 'Area Name' },
                { key: 'collectionQtyPercent', label: 'Collection Qty %', format: (v) => v.toFixed(2) + '%', className: 'text-right' },
              ])}
            </div>
          )}
        </div>

        {/* Lowest Collection Amt Percentage */}
        <div className="analytics-card">
          <div 
            className="analytics-header"
            onClick={() => toggleSection('lowestAmt')}
          >
            <h4>📉 20 Lowest Collection Amt % - Plazas</h4>
            <span className="toggle-icon">{expandedSections['lowestAmt'] ? '▼' : '▶'}</span>
          </div>
          {expandedSections['lowestAmt'] && (
            <div className="analytics-content">
              {renderTable(analytics.lowestAmtPlazas, [
                { key: 'plaza', label: 'Plaza Name' },
                { key: 'area', label: 'Area' },
                { key: 'division', label: 'Division' },
                { key: 'collectionAmtPercent', label: 'Collection Amt %', format: (v) => v.toFixed(2) + '%', className: 'text-right' },
              ])}
            </div>
          )}
        </div>

        <div className="analytics-card">
          <div 
            className="analytics-header"
            onClick={() => toggleSection('lowestAmtArea')}
          >
            <h4>📉 10 Lowest Collection Amt % - Areas</h4>
            <span className="toggle-icon">{expandedSections['lowestAmtArea'] ? '▼' : '▶'}</span>
          </div>
          {expandedSections['lowestAmtArea'] && (
            <div className="analytics-content">
              {renderTable(analytics.lowestAmtAreas, [
                { key: 'area', label: 'Area Name' },
                { key: 'collectionAmtPercent', label: 'Collection Amt %', format: (v) => v.toFixed(2) + '%', className: 'text-right' },
              ])}
            </div>
          )}
        </div>

        {/* Highest Overdue Change */}
        <div className="analytics-card">
          <div 
            className="analytics-header"
            onClick={() => toggleSection('highestOverdue')}
          >
            <h4>📈 20 Highest Overdue Change Amount - Plazas</h4>
            <span className="toggle-icon">{expandedSections['highestOverdue'] ? '▼' : '▶'}</span>
          </div>
          {expandedSections['highestOverdue'] && (
            <div className="analytics-content">
              {renderTable(analytics.highestOverduePlazas, [
                { key: 'plaza', label: 'Plaza Name' },
                { key: 'area', label: 'Area' },
                { key: 'division', label: 'Division' },
                { key: 'overdueChange', label: 'Overdue Change', format: (v) => v.toFixed(2), className: 'text-right highlight-red' },
              ])}
            </div>
          )}
        </div>

        <div className="analytics-card">
          <div 
            className="analytics-header"
            onClick={() => toggleSection('highestOverdueArea')}
          >
            <h4>📈 10 Highest Overdue Change Amount - Areas</h4>
            <span className="toggle-icon">{expandedSections['highestOverdueArea'] ? '▼' : '▶'}</span>
          </div>
          {expandedSections['highestOverdueArea'] && (
            <div className="analytics-content">
              {renderTable(analytics.highestOverdueAreas, [
                { key: 'area', label: 'Area Name' },
                { key: 'overdueChange', label: 'Overdue Change', format: (v) => v.toFixed(2), className: 'text-right highlight-red' },
              ])}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AnalyticsSection;
