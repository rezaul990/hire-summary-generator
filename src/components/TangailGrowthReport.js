import React, { useEffect, useMemo, useState } from 'react';
import './TangailGrowthReport.css';
import { getTangailAreaMonthlyPct, saveTangailAreaMonthlyPct } from '../utils/supabase';

const cleanArea = (area) => (area || '').replace(/\s*-\s*SUBTOTAL\s*$/i, '').trim();

function TangailGrowthReport({ userArea, areaWiseData }) {
  const isTangailUser = userArea && userArea.toLowerCase().includes('tangail');

  const [prevPct, setPrevPct] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  // ── Load stored Previous Month % ──────────────────────────────────────────
  useEffect(() => {
    if (!isTangailUser) return;
    let active = true;
    setLoading(true);
    getTangailAreaMonthlyPct().then(data => {
      if (active) {
        setPrevPct(data || {});
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [isTangailUser]);

  // ── Build current area-wise Qty % from the uploaded file ──────────────────
  // Area subtotal rows carry no Division, so map each area to its division
  // from the plaza rows first.
  const divisionOfArea = useMemo(() => {
    const map = {};
    (areaWiseData || []).forEach(row => {
      if (row.isSubtotal || row.isGrandTotal) return;
      if (row.Area && row.Division) map[row.Area] = row.Division;
    });
    return map;
  }, [areaWiseData]);

  const allAreaRows = useMemo(() =>
    (areaWiseData || [])
      .filter(row => row.isSubtotal && !row.isGrandTotal)
      .map(row => {
        const collectible = parseFloat(row.Collectible_Acc_Qty || 0);
        const collected = parseFloat(row.Collected_Acc_Qty || 0);
        const curPct = collectible > 0 ? (collected / collectible) * 100 : 0;
        const area = cleanArea(row.Area);
        return { area, curPct, division: divisionOfArea[area] || '' };
      })
      .sort((a, b) => a.area.localeCompare(b.area)),
    [areaWiseData, divisionOfArea]
  );

  const divisions = useMemo(
    () => [...new Set(allAreaRows.map(r => r.division).filter(Boolean))].sort(),
    [allAreaRows]
  );

  const areaRows = useMemo(
    () => (selectedDivision
      ? allAreaRows.filter(r => r.division === selectedDivision)
      : allAreaRows),
    [allAreaRows, selectedDivision]
  );

  // Only Tangail-area users see this section
  if (!isTangailUser) return null;

  if (allAreaRows.length === 0) return null;

  const pctText = (v) => `${Number(v).toFixed(2)}%`;

  const growthOf = (area, curPct) => {
    const prev = prevPct[area];
    if (prev == null) return null;
    return curPct - prev;
  };

  const growthClass = (g) => {
    if (g == null) return 'tgr-growth tgr-growth-none';
    if (g > 0) return 'tgr-growth tgr-growth-up';
    if (g < 0) return 'tgr-growth tgr-growth-down';
    return 'tgr-growth tgr-growth-flat';
  };

  const growthText = (g) => {
    if (g == null) return '—';
    const sign = g > 0 ? '+' : '';
    return `${sign}${g.toFixed(2)}%`;
  };

  const statusText = (g) => {
    if (g == null) return 'No baseline';
    if (g > 0) return 'Growth';
    if (g < 0) return 'DeGrowth';
    return 'No change';
  };

  // ── Save current upload's % as Previous Month baseline ────────────────────
  // Always snapshots ALL areas, even when the table is filtered by division.
  const handleSaveCurrent = async () => {
    const confirmed = window.confirm(
      `💾 Save the current Qty % of ${allAreaRows.length} areas as the Previous Month baseline?\n\n` +
      `Future uploads will compare against these values.`
    );
    if (!confirmed) return;

    setSaving(true);
    setMsg('');

    const records = allAreaRows.map(r => ({
      area_name: r.area,
      qty_percent: Number(r.curPct.toFixed(2)),
    }));

    const ok = await saveTangailAreaMonthlyPct(records);
    if (ok) {
      const next = { ...prevPct };
      records.forEach(r => { next[r.area_name] = r.qty_percent; });
      setPrevPct(next);
      setMsg('✅ Current Qty % saved as Previous Month baseline!');
    } else {
      setMsg('❌ Failed to save. Please check your connection and try again.');
    }
    setSaving(false);
  };

  // ── Manual edit ───────────────────────────────────────────────────────────
  const handleEditOpen = () => {
    const d = {};
    allAreaRows.forEach(r => {
      d[r.area] = prevPct[r.area] != null ? String(prevPct[r.area]) : '';
    });
    setDraft(d);
    setEditing(true);
    setMsg('');
  };

  const handleEditCancel = () => {
    setEditing(false);
    setDraft({});
    setMsg('');
  };

  const handleSaveEdits = async () => {
    const records = [];
    for (const r of allAreaRows) {
      const raw = draft[r.area];
      if (raw === '' || raw == null) continue;
      const num = parseFloat(raw);
      if (isNaN(num) || num < 0) {
        setMsg(`❌ Invalid value for ${r.area}. Enter a number 0 or above.`);
        return;
      }
      records.push({ area_name: r.area, qty_percent: Number(num.toFixed(2)) });
    }

    if (records.length === 0) {
      setMsg('❌ No values to save.');
      return;
    }

    setSaving(true);
    setMsg('');
    const ok = await saveTangailAreaMonthlyPct(records);
    if (ok) {
      const next = { ...prevPct };
      records.forEach(r => { next[r.area_name] = r.qty_percent; });
      setPrevPct(next);
      setEditing(false);
      setDraft({});
      setMsg('✅ Previous Month Qty % updated!');
    } else {
      setMsg('❌ Failed to save. Please check your connection and try again.');
    }
    setSaving(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="tgr-section">
      <div className="tgr-header">
        <h2>📈 Area-wise Qty % Growth Report</h2>
        <div className="tgr-actions">
          {editing ? (
            <>
              <button className="tgr-save-btn" onClick={handleSaveEdits} disabled={saving}>
                {saving ? '💾 Saving…' : '💾 Save Changes'}
              </button>
              <button className="tgr-cancel-btn" onClick={handleEditCancel} disabled={saving}>
                ✖ Cancel
              </button>
            </>
          ) : (
            <>
              <button className="tgr-save-btn" onClick={handleSaveCurrent} disabled={saving}>
                {saving ? '💾 Saving…' : '💾 Save as Previous Month %'}
              </button>
              <button className="tgr-edit-btn" onClick={handleEditOpen} disabled={saving}>
                ✏️ Edit Manually
              </button>
            </>
          )}
        </div>
      </div>

      {msg && (
        <div className={`tgr-msg ${msg.startsWith('✅') ? 'tgr-msg-ok' : 'tgr-msg-err'}`}>
          {msg}
        </div>
      )}

      <div className="tgr-capture">
        <div className="tgr-title-bar">
          <span className="tgr-title-text">Qty % Growth &amp; DeGrowth — Area Wise</span>
          <span className="tgr-date-badge">{new Date().toLocaleDateString('en-GB')}</span>
        </div>

        {divisions.length > 1 && (
          <div className="tgr-filter-bar">
            <label htmlFor="tgrDivisionFilter">Filter by Division:</label>
            <select
              id="tgrDivisionFilter"
              className="tgr-filter-select"
              value={selectedDivision}
              onChange={e => setSelectedDivision(e.target.value)}
            >
              <option value="">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
            <span className="tgr-filter-count">
              {areaRows.length} of {allAreaRows.length} areas
            </span>
          </div>
        )}

        <table className="tgr-table">
          <thead>
            <tr>
              <th className="tgr-th-area">Area</th>
              <th className="tgr-th-pct">Previous Month Qty %</th>
              <th className="tgr-th-pct">Current Month Qty %</th>
              <th className="tgr-th-pct">Growth / DeGrowth</th>
              <th className="tgr-th-status">Status</th>
            </tr>
          </thead>
          <tbody>
            {areaRows.length === 0 && (
              <tr>
                <td className="tgr-td-area tgr-empty-row" colSpan={5}>
                  No areas found in this division.
                </td>
              </tr>
            )}
            {areaRows.map((row, i) => {
              const g = growthOf(row.area, row.curPct);
              return (
                <tr key={row.area} className={i % 2 === 0 ? 'tgr-row-even' : 'tgr-row-odd'}>
                  <td className="tgr-td-area">{row.area}</td>
                  <td className="tgr-td-pct">
                    {editing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="tgr-input"
                        value={draft[row.area] ?? ''}
                        onChange={e => setDraft({ ...draft, [row.area]: e.target.value })}
                        placeholder="0.00"
                      />
                    ) : loading ? (
                      <span className="tgr-empty">…</span>
                    ) : prevPct[row.area] != null ? (
                      pctText(prevPct[row.area])
                    ) : (
                      <span className="tgr-empty">—</span>
                    )}
                  </td>
                  <td className="tgr-td-pct tgr-current">{pctText(row.curPct)}</td>
                  <td className={growthClass(g)}>{growthText(g)}</td>
                  <td className={`tgr-td-status ${g == null ? 'tgr-status-none' : g > 0 ? 'tgr-status-up' : g < 0 ? 'tgr-status-down' : 'tgr-status-flat'}`}>
                    {g == null ? '—' : g > 0 ? '▲' : g < 0 ? '▼' : '●'} {statusText(g)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="tgr-hint">
        Previous Month Qty % is the stored baseline. Click <strong>Save as Previous Month %</strong> to store the current
        upload's values, or <strong>Edit Manually</strong> to correct them.
      </p>
    </div>
  );
}

export default TangailGrowthReport;
