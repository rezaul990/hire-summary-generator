import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './TangailDailyReport.css';
import { getYesterdayTangailPlazaData, getTangailPlazaTargets, saveTangailPlazaTargets } from '../utils/supabase';

const ADMIN_EMAIL = 'thedigitaltimes24@gmail.com';

// ── Parse pasted text into { plaza_name → target_qty } ──────────────────────
// Accepts any of these formats per line:
//   "Plaza Name   50"        (spaces/tabs between name and number)
//   "Plaza Name\t50"
//   "Plaza Name,50"
//   "Plaza Name - 50"        (dash-separated)
// The LAST token on the line that is a pure number is treated as the target.
// Lines with no number are silently skipped.
const parsePastedTargets = (text) => {
  const result = {};
  text.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Split on tab, comma, or 2+ spaces — try tab/comma first, else split last word
    let parts;
    if (trimmed.includes('\t')) {
      parts = trimmed.split('\t').map(p => p.trim());
    } else if (trimmed.includes(',')) {
      parts = trimmed.split(',').map(p => p.trim());
    } else {
      // Split on 2+ whitespace characters
      parts = trimmed.split(/\s{2,}/).map(p => p.trim());
      // Fallback: split on last whitespace group
      if (parts.length < 2) {
        const lastSpace = trimmed.lastIndexOf(' ');
        if (lastSpace === -1) return;
        parts = [trimmed.slice(0, lastSpace).trim(), trimmed.slice(lastSpace + 1).trim()];
      }
    }

    // Last non-empty part that is a number is the target
    const numPart = [...parts].reverse().find(p => /^\d+$/.test(p.replace(/,/g, '')));
    if (!numPart) return;

    const qty = parseInt(numPart.replace(/,/g, ''), 10);
    // Everything except the number part is the plaza name
    const namePart = parts.slice(0, parts.lastIndexOf(numPart)).join(' ').trim()
      || parts.filter(p => p !== numPart).join(' ').trim();

    if (namePart) result[namePart] = qty;
  });
  return result;
};

function TangailDailyReport({ userArea, areaWiseData, user }) {
  const captureRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [yesterdayPlazaData, setYesterdayPlazaData] = useState({});
  const [plazaTargets, setPlazaTargets] = useState({});   // { [plaza_name]: target_qty }
  const [showPastePanel, setShowPastePanel] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsePreview, setParsePreview] = useState({}); // live preview of parsed result
  const [savingTargets, setSavingTargets] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const isTangailUser = userArea && userArea.toLowerCase().includes('tangail');
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  // ── Fetch baseline + targets on mount ─────────────────────────────────────
  useEffect(() => {
    if (!isTangailUser) return;

    const fetchData = async () => {
      const [yesterday, targets] = await Promise.all([
        getYesterdayTangailPlazaData(),
        getTangailPlazaTargets(),
      ]);
      setYesterdayPlazaData(yesterday);
      setPlazaTargets(targets);
    };

    fetchData();
  }, [isTangailUser]);

  // Only render for Tangail users
  if (!isTangailUser) return null;

  // ── Filter Tangail plazas ──────────────────────────────────────────────────
  const tangailPlazas = areaWiseData.filter(
    row =>
      row.Area &&
      row.Area.toLowerCase().includes('tangail') &&
      !row.isSubtotal &&
      !row.isGrandTotal &&
      row.Plaza
  );

  if (tangailPlazas.length === 0) return null;

  // ── Build report rows ──────────────────────────────────────────────────────
  let totalAch = 0;
  let totalTarget = 0;

  const reportRows = tangailPlazas.map(plaza => {
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmt = num => new Intl.NumberFormat('en-IN').format(Math.round(num));

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  // ── Row colour logic (same as before, based on ach) ───────────────────────
  const rowClass = ach => (ach < 10 ? 'tdr-row-red' : 'tdr-row-teal');

  // ── Paste panel handlers ───────────────────────────────────────────────────
  const handlePasteChange = (text) => {
    setPasteText(text);
    setParsePreview(parsePastedTargets(text));
  };

  const handleOpenPaste = () => {
    // Pre-fill textarea with current targets so admin can just edit numbers
    const lines = Object.entries(plazaTargets)
      .map(([name, qty]) => `${name}\t${qty}`)
      .join('\n');
    setPasteText(lines);
    setParsePreview(plazaTargets);
    setShowPastePanel(true);
    setSaveMsg('');
  };

  const handleClosePaste = () => {
    setShowPastePanel(false);
    setPasteText('');
    setParsePreview({});
    setSaveMsg('');
  };

  const handleSaveTargets = async () => {
    const parsed = parsePastedTargets(pasteText);
    if (Object.keys(parsed).length === 0) {
      setSaveMsg('❌ No valid entries found. Check format.');
      return;
    }
    setSavingTargets(true);
    setSaveMsg('');
    const payload = Object.entries(parsed).map(([plaza_name, target_qty]) => ({
      plaza_name,
      target_qty,
    }));
    const ok = await saveTangailPlazaTargets(payload);
    if (ok) {
      setPlazaTargets(parsed);
      setShowPastePanel(false);
      setPasteText('');
      setParsePreview({});
      setSaveMsg(`✅ ${payload.length} plaza targets saved!`);
      setTimeout(() => setSaveMsg(''), 4000);
    } else {
      setSaveMsg('❌ Failed to save. Please try again.');
    }
    setSavingTargets(false);
  };

  // ── Image capture ──────────────────────────────────────────────────────────
  const generateCanvas = async () =>
    html2canvas(captureRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    return `Tangail_Daily_Report_${date}.png`;
  };

  const handleShareImage = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const canvas = await generateCanvas();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], getFileName(), { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Tangail Daily Report',
          text: `📍 কার্ড কলেকশন আপডেট — ${currentTime}`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = getFileName();
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing image:', error);
        alert('❌ Could not share the image. Please try the Download button instead.');
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const canvas = await generateCanvas();
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName();
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('❌ Could not generate the image. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="tangail-daily-report">

      {/* ── Section header ── */}
      <div className="tdr-header">
        <h2>📍 Tangail Daily Report</h2>
        <div className="tdr-actions">
          {isAdmin && (
            <button className="tdr-target-edit-btn" onClick={handleOpenPaste}>
              🎯 Set Targets
            </button>
          )}
          <button className="tdr-share-btn" onClick={handleShareImage} disabled={sharing}>
            <span>📤</span> {sharing ? 'Preparing...' : 'Share'}
          </button>
          <button className="tdr-download-btn" onClick={handleDownloadImage} disabled={sharing}>
            <span>⬇️</span> Download
          </button>
        </div>
      </div>

      {/* Save feedback */}
      {saveMsg && (
        <div className={`tdr-save-msg ${saveMsg.startsWith('✅') ? 'tdr-save-msg-ok' : 'tdr-save-msg-err'}`}>
          {saveMsg}
        </div>
      )}

      {/* ── Paste Target Panel (admin only) ── */}
      {isAdmin && showPastePanel && (
        <div className="tdr-paste-panel">
          <div className="tdr-paste-header">
            <span className="tdr-paste-title">🎯 Paste Plaza Targets</span>
            <button className="tdr-target-cancel-btn" onClick={handleClosePaste} disabled={savingTargets}>✕ Close</button>
          </div>

          <p className="tdr-paste-hint">
            Paste one plaza per line — <strong>Plaza Name</strong> then <strong>Target Qty</strong> separated by a tab, comma, or 2+ spaces. Example:
          </p>
          <pre className="tdr-paste-example">{`Walton Plaza-Adalot Road, Tangail\t50\nWalton Plaza-Bashtoil, Mirzapur\t30`}</pre>

          <textarea
            className="tdr-paste-textarea"
            value={pasteText}
            onChange={e => handlePasteChange(e.target.value)}
            placeholder={"Walton Plaza-Adalot Road, Tangail\t50\nWalton Plaza-Bashtoil, Mirzapur\t30"}
            rows={10}
            spellCheck={false}
          />

          {/* Live preview */}
          {Object.keys(parsePreview).length > 0 && (
            <div className="tdr-paste-preview">
              <p className="tdr-preview-label">✅ Parsed {Object.keys(parsePreview).length} entries:</p>
              <div className="tdr-preview-list">
                {Object.entries(parsePreview).map(([name, qty]) => (
                  <div key={name} className="tdr-preview-row">
                    <span className="tdr-preview-name">{name}</span>
                    <span className="tdr-preview-qty">{qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tdr-paste-footer">
            <button
              className="tdr-target-save-btn"
              onClick={handleSaveTargets}
              disabled={savingTargets || Object.keys(parsePreview).length === 0}
            >
              {savingTargets ? '💾 Saving…' : `💾 Save ${Object.keys(parsePreview).length} Targets`}
            </button>
          </div>
        </div>
      )}

      {/* ── Capture area (shared as image) ── */}
      <div className="tdr-capture" ref={captureRef}>

        {/* Yellow title bar */}
        <div className="tdr-title-bar">
          <span className="tdr-title-text">কার্ড কলেকশন আপডেট</span>
          <span className="tdr-time-badge">{currentTime}</span>
        </div>

        <table className="tdr-table">
          <thead>
            <tr>
              <th className="tdr-th-plaza">Plaza Name</th>
              <th className="tdr-th-target">Target</th>
              <th className="tdr-th-ach">Ach</th>
              <th className="tdr-th-not-ach">Not Ach</th>
              <th className="tdr-th-coll-pct">Coll%</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row, i) => (
              <tr key={i} className={`tdr-row ${rowClass(row.ach)}`}>
                <td className="tdr-td-plaza">{row.plaza}</td>
                <td className="tdr-td-target">
                  {row.target > 0 ? fmt(row.target) : <span className="tdr-no-target">—</span>}
                </td>
                <td className="tdr-td-ach">{fmt(row.ach)}</td>
                <td className={`tdr-td-not-ach ${row.target > 0 ? (row.notAch === 0 ? 'tdr-not-ach-zero' : 'tdr-not-ach-pending') : ''}`}>
                  {row.target > 0 ? fmt(row.notAch) : <span className="tdr-no-target">—</span>}
                </td>
                <td className={`tdr-td-coll-pct ${row.collPct !== null ? (parseFloat(row.collPct) >= 100 ? 'tdr-pct-full' : parseFloat(row.collPct) >= 50 ? 'tdr-pct-mid' : 'tdr-pct-low') : ''}`}>
                  {row.collPct !== null ? `${row.collPct}%` : <span className="tdr-no-target">—</span>}
                </td>
              </tr>
            ))}

            {/* ── Total row ── */}
            <tr className="tdr-row-total">
              <td className="tdr-td-total-label">Total</td>
              <td className="tdr-td-total-value">{totalTarget > 0 ? fmt(totalTarget) : '—'}</td>
              <td className="tdr-td-total-value">{fmt(totalAch)}</td>
              <td className="tdr-td-total-value">{totalTarget > 0 ? fmt(totalNotAch) : '—'}</td>
              <td className="tdr-td-total-value tdr-pct-total">{totalCollPct !== null ? `${totalCollPct}%` : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TangailDailyReport;
