import React, { useMemo, useState } from 'react';
import './OverdueStatistics.css';

function OverdueStatistics({ areaWiseData, divisionData }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const statistics = useMemo(() => {
    if (!areaWiseData || areaWiseData.length === 0) {
      return { 
        plazas: [], 
        areas: [], 
        divisions: [],
        plazaCount: 0,
        areaCount: 0,
        divisionCount: 0
      };
    }

    const plazasMap = new Map();
    const areasMap = new Map();
    const divisionsMap = new Map();

    // First pass: collect all plazas with overdue change > 0
    areaWiseData.forEach(row => {
      // Skip subtotals and grand total
      if (row.isSubtotal || row.isGrandTotal) return;

      const overdueChange = parseFloat(row.Overdue_Change);
      
      if (overdueChange > 0 && row.Plaza) {
        const plazaKey = `${row.Division}|${row.Area}|${row.Plaza}`;
        if (!plazasMap.has(plazaKey)) {
          plazasMap.set(plazaKey, {
            division: row.Division,
            area: row.Area,
            plaza: row.Plaza,
            overdueChange: overdueChange
          });
        }
      }
    });

    // Second pass: use subtotal rows to get accurate area subtotals
    areaWiseData.forEach(row => {
      if (row.isGrandTotal) return;

      const overdueChange = parseFloat(row.Overdue_Change);

      // Process area subtotals (Area column contains "Area Name - SUBTOTAL")
      if (row.isSubtotal && row.Area && row.Area.includes('SUBTOTAL') && !row.Area.includes('Division')) {
        const areaName = row.Area.replace(' - SUBTOTAL', '');
        if (overdueChange > 0) {
          const areaKey = areaName;
          if (!areasMap.has(areaKey)) {
            areasMap.set(areaKey, {
              area: areaName,
              division: row.Division,
              overdueChange: overdueChange
            });
          }
        }
      }
    });

    // Third pass: use divisionData to get division subtotals
    if (divisionData && divisionData.length > 0) {
      divisionData.forEach(row => {
        if (row.isGrandTotal) return;

        const overdueChange = parseFloat(row.Overdue_Change);

        // Process division subtotals (Area column contains "Division-XX - SUBTOTAL")
        if (row.isSubtotal && row.Area && row.Area.includes('SUBTOTAL')) {
          const divisionName = row.Area.replace(' - SUBTOTAL', '');
          if (overdueChange > 0) {
            const divisionKey = divisionName;
            if (!divisionsMap.has(divisionKey)) {
              divisionsMap.set(divisionKey, {
                division: divisionName,
                overdueChange: overdueChange
              });
            }
          }
        }
      });
    }

    return {
      plazas: Array.from(plazasMap.values()),
      areas: Array.from(areasMap.values()),
      divisions: Array.from(divisionsMap.values()),
      plazaCount: plazasMap.size,
      areaCount: areasMap.size,
      divisionCount: divisionsMap.size,
    };
  }, [areaWiseData, divisionData]);

  return (
    <section className="overdue-statistics-section">
      <div className="statistics-container">
        <h3>📊 Overdue Change Summary (> 0)</h3>
        
        <div className="statistics-grid">
          <div className="stat-card" onClick={() => setExpandedSection(expandedSection === 'divisions' ? null : 'divisions')}>
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <div className="stat-label">Divisions</div>
              <div className="stat-value">{statistics.divisionCount}</div>
            </div>
            <div className="expand-icon">{expandedSection === 'divisions' ? '▼' : '▶'}</div>
          </div>
          
          <div className="stat-card" onClick={() => setExpandedSection(expandedSection === 'areas' ? null : 'areas')}>
            <div className="stat-icon">📍</div>
            <div className="stat-content">
              <div className="stat-label">Areas</div>
              <div className="stat-value">{statistics.areaCount}</div>
            </div>
            <div className="expand-icon">{expandedSection === 'areas' ? '▼' : '▶'}</div>
          </div>
          
          <div className="stat-card" onClick={() => setExpandedSection(expandedSection === 'plazas' ? null : 'plazas')}>
            <div className="stat-icon">🏪</div>
            <div className="stat-content">
              <div className="stat-label">Plazas</div>
              <div className="stat-value">{statistics.plazaCount}</div>
            </div>
            <div className="expand-icon">{expandedSection === 'plazas' ? '▼' : '▶'}</div>
          </div>
        </div>

        {expandedSection === 'divisions' && (
          <div className="details-section">
            <h4>Divisions with Overdue Change > 0</h4>
            <div className="details-list">
              {statistics.divisions.map((item, idx) => (
                <div key={idx} className="detail-item">
                  <span className="detail-name">{item.division}</span>
                  <span className="detail-value">Subtotal: {item.overdueChange.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {expandedSection === 'areas' && (
          <div className="details-section">
            <h4>Areas with Overdue Change > 0</h4>
            <div className="details-list">
              {statistics.areas.map((item, idx) => (
                <div key={idx} className="detail-item">
                  <div className="detail-info">
                    <span className="detail-name">{item.area}</span>
                    <span className="detail-division">{item.division}</span>
                  </div>
                  <span className="detail-value">Subtotal: {item.overdueChange.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {expandedSection === 'plazas' && (
          <div className="details-section">
            <h4>Plazas with Overdue Change > 0</h4>
            <div className="details-list">
              {statistics.plazas.map((item, idx) => (
                <div key={idx} className="detail-item">
                  <div className="detail-info">
                    <span className="detail-name">{item.plaza}</span>
                    <span className="detail-division">{item.division} / {item.area}</span>
                  </div>
                  <span className="detail-value">{item.overdueChange.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default OverdueStatistics;
