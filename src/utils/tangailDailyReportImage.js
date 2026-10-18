import html2canvas from 'html2canvas';
import { getYesterdayTangailPlazaData, getTangailPlazaTargets } from './supabase';

const fmt = (num) => new Intl.NumberFormat('en-IN').format(Math.round(num));

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

/**
 * Build the Tangail Daily Report DOM (same markup as TangailDailyReport.js)
 * from raw data, off-screen, and capture it as a PNG blob.
 *
 * @param {Array} areaWiseData - Area-wise summary rows for the uploaded file
 * @returns {Promise<{blob: Blob, filename: string} | null>}
 */
export const generateTangailDailyReportBlob = async (areaWiseData) => {
  const tangailPlazas = (areaWiseData || []).filter(
    (row) =>
      row.Area &&
      row.Area.toLowerCase().includes('tangail') &&
      !row.isSubtotal &&
      !row.isGrandTotal &&
      row.Plaza
  );

  if (tangailPlazas.length === 0) return null;

  const [yesterdayPlazaData, plazaTargets] = await Promise.all([
    getYesterdayTangailPlazaData(),
    getTangailPlazaTargets(),
  ]);

  let totalAch = 0;
  let totalTarget = 0;

  const rows = tangailPlazas.map((plaza) => {
    const yesterdayQty = yesterdayPlazaData[plaza.Plaza] || 0;
    const ach = Math.max(0, parseFloat(plaza.Collected_Acc_Qty || 0) - yesterdayQty);
    const target = plazaTargets[plaza.Plaza] || 0;
    const notAch = Math.max(0, target - ach);
    const collPct = target > 0 ? ((ach / target) * 100).toFixed(1) : null;

    totalAch += ach;
    totalTarget += target;

    return { plaza: plaza.Plaza, ach, target, notAch, collPct };
  });

  const totalNotAch = Math.max(0, totalTarget - totalAch);
  const totalCollPct = totalTarget > 0 ? ((totalAch / totalTarget) * 100).toFixed(1) : null;

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // ── Build capture area ──────────────────────────────────────────────────────
  const capture = el('div', 'tdr-capture');

  const titleBar = el('div', 'tdr-title-bar');
  titleBar.appendChild(el('span', 'tdr-title-text', 'কার্ড কলেকশন আপডেট'));
  titleBar.appendChild(el('span', 'tdr-time-badge', currentTime));
  capture.appendChild(titleBar);

  const table = el('table', 'tdr-table');

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  [
    ['tdr-th-plaza', 'Plaza Name'],
    ['tdr-th-target', 'Target'],
    ['tdr-th-ach', 'Ach'],
    ['tdr-th-not-ach', 'Not Ach'],
    ['tdr-th-coll-pct', 'Coll%'],
  ].forEach(([cls, label]) => headRow.appendChild(el('th', cls, label)));
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  rows.forEach((row) => {
    const tr = el('tr', `tdr-row ${row.ach < 10 ? 'tdr-row-red' : 'tdr-row-teal'}`);
    tr.appendChild(el('td', 'tdr-td-plaza', row.plaza));

    if (row.target > 0) {
      tr.appendChild(el('td', 'tdr-td-target', fmt(row.target)));
    } else {
      const td = el('td', 'tdr-td-target');
      td.appendChild(el('span', 'tdr-no-target', '—'));
      tr.appendChild(td);
    }

    tr.appendChild(el('td', 'tdr-td-ach', fmt(row.ach)));

    const notAchTd = el(
      'td',
      `tdr-td-not-ach ${row.target > 0 ? (row.notAch === 0 ? 'tdr-not-ach-zero' : 'tdr-not-ach-pending') : ''}`
    );
    if (row.target > 0) {
      notAchTd.textContent = fmt(row.notAch);
    } else {
      notAchTd.appendChild(el('span', 'tdr-no-target', '—'));
    }
    tr.appendChild(notAchTd);

    const pctTd = el(
      'td',
      `tdr-td-coll-pct ${row.collPct !== null
        ? parseFloat(row.collPct) >= 100
          ? 'tdr-pct-full'
          : parseFloat(row.collPct) >= 50
          ? 'tdr-pct-mid'
          : 'tdr-pct-low'
        : ''}`
    );
    if (row.collPct !== null) {
      pctTd.textContent = `${row.collPct}%`;
    } else {
      pctTd.appendChild(el('span', 'tdr-no-target', '—'));
    }
    tr.appendChild(pctTd);

    tbody.appendChild(tr);
  });

  const totalRow = el('tr', 'tdr-row-total');
  totalRow.appendChild(el('td', 'tdr-td-total-label', 'Total'));
  totalRow.appendChild(el('td', 'tdr-td-total-value', totalTarget > 0 ? fmt(totalTarget) : '—'));
  totalRow.appendChild(el('td', 'tdr-td-total-value', fmt(totalAch)));
  totalRow.appendChild(el('td', 'tdr-td-total-value', totalTarget > 0 ? fmt(totalNotAch) : '—'));
  totalRow.appendChild(
    el('td', 'tdr-td-total-value tdr-pct-total', totalCollPct !== null ? `${totalCollPct}%` : '—')
  );
  tbody.appendChild(totalRow);

  table.appendChild(tbody);
  capture.appendChild(table);

  // ── Render off-screen and capture ───────────────────────────────────────────
  const host = document.createElement('div');
  host.style.position = 'absolute';
  host.style.left = '-100000px';
  host.style.top = '0';
  host.style.width = '640px';
  host.appendChild(capture);
  document.body.appendChild(host);

  try {
    const canvas = await html2canvas(capture, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;

    const date = new Date().toISOString().split('T')[0];
    return { blob, filename: `Tangail_Daily_Report_${date}.png` };
  } finally {
    if (host.parentNode) host.parentNode.removeChild(host);
  }
};
