import React, { useState } from 'react';
import './DataTable.css';

function DataTable({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  if (!data || data.length === 0) {
    return <div className="no-data">No data to display</div>;
  }

  const columns = Object.keys(data[0]).filter(key => key !== 'isSubtotal');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col} onClick={() => handleSort(col)} className="sortable">
                {col.replace(/_/g, ' ')}
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
