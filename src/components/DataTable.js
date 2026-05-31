import React, { useState } from 'react';
import './DataTable.css';

function DataTable({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  if (!data || data.length === 0) {
    return <div className="no-data">No data to display</div>;
  }

  const HELPER_KEYS = ['isSubtotal', 'isGrandTotal', 'isAreaTotal'];
  const columns = Object.keys(data[0]).filter(key => !HELPER_KEYS.includes(key));

  const colWidths = {
    Division: '8%',
    Area: '8%',
    Plaza: '12%',
    Collectible_Acc_Qty: '8%',
    Collected_Acc_Qty: '8%',
    Collection_Qty_Percent: '6%',
    Collectible_Amount: '11%',
    Collected_Amount: '10%',
    Collection_Amt_Percent: '6%',
    Previous_Overdue: '9%',
    Running_Overdue: '9%',
    Overdue_Change: '8%',
    Plazas_OD_Increased: '9%',
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getColumnLabel = (col) => {
    const labels = {
      'Division': 'Division',
      'Area': 'Area',
      'Plaza': 'Plaza',
      'Collectible_Acc_Qty': 'Target Qty',
      'Collected_Acc_Qty': 'Ach. Qty',
      'Collection_Qty_Percent': 'Qty %',
      'Collectible_Amount': 'Target Amt',
      'Collected_Amount': 'Ach. Amt',
      'Collection_Amt_Percent': 'Amt %',
      'Previous_Overdue': 'Prev O/D',
      'Running_Overdue': 'Curr O/D',
      'Overdue_Change': 'Inc/Dec',
      'Plazas_OD_Increased': 'O/D ↑ Plazas'
    };
    return labels[col] || col.replace(/_/g, ' ');
  };

  const sortedData = !sortConfig.key ? data : [...data].sort((a, b) => {
    if (a.isGrandTotal) return 1;
    if (b.isGrandTotal) return -1;
    if (a.isSubtotal) return 1;
    if (b.isSubtotal) return -1;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <colgroup>
          {columns.map(col => (
            <col key={col} style={{ width: colWidths[col] || 'auto' }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col} onClick={() => handleSort(col)} className="sortable">
                {getColumnLabel(col)}
                {sortConfig.key === col && (
                  <span className="sort-indicator">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx} className={row.isGrandTotal ? 'grand-total-row' : row.isSubtotal ? 'subtotal-row' : ''}>
              {columns.map(col => {
                let cellClassName = '';
                
                if (col.includes('Percent')) {
                  cellClassName = 'text-right';
                } else if (col === 'Todays_Overdue_Collection') {
                  cellClassName = 'highlight-overdue';
                } else if (col === 'Overdue_Change') {
                  const value = parseFloat(row[col]);
                  cellClassName = value > 0 ? 'overdue-change-positive' : 'overdue-change-negative';
                } else if (col === 'Plazas_OD_Increased') {
                  const value = parseFloat(row[col]);
                  cellClassName = value > 0 ? 'od-plazas-cell has-increase' : 'od-plazas-cell';
                }
                
                return (
                  <td key={col} className={cellClassName}>
                    {row[col]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
