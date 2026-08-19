import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useTodaysCollected, calcTodayCollected } from '../utils/useTodaysCollected';
import './AllAreasTodayReport.css';

/**
 * AllAreasTodayReport
 *
 * Shows "Today's Collected" (current upload minus yesterday's stored baseline)
 * for every area and every plaza across the entire data set.
 *
 * Visible to ALL users after a file upload.
 */
function AllAreasTodayReport({ areaWiseData }) {
  const captureRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [viewMode, setViewMode] = useState('area');      // 'area' | 'plaza'
  const [filterDivision, setFilterDivision] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch yesterday's all-area baseline from Supabase
  const { data: yesterdayAll, loading } = useTodaysCollected();

  const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n));

  // ── Raw plaza rows (no subtotals / grand totals) ──────────────────────────
  const plazaRows = useMemo(
    () =>
      areaWiseData.filter(
        r => !r.isSubtotal && !r.isGrandTotal && r.Plaza
      ),
    [areaWiseData]
  );

  // ── Division list for filter dropdown ────────────────────────────────────
  const divisions = useMemo(
    () => [...new Set(plazaRows.map(r => r.Division).filter(Boolean))].sort(),
    [plazaRows]
  );

  // ── Area list (depends on selected division) ──────────────────────────────
  const areas = useMemo(() => {
    const source = filterDivision
      ? plazaRows.filter(r => r.Division === filterDivision)
      : plazaRows;
    return [...new Set(source.map(r => r.Area).filter(Boolean))].sort();
  }, [plazaRows, filterDivision]);

  // ── Filtered plaza rows ───────────────────────────────────────────────────
  const filteredPlazas = useMemo(() => {
    return plazaRows.filter(r => {
      if (filterDivision && r.Division !== filterDivision) return false;
      if (filterArea && r.Area !== filterArea) return false;
      return true;
    });
  }, [plazaRows, filterDivision, filterArea]);

  // ── Area-level aggregated rows ────────────────────────────────────────────
  const areaRows = useMemo(() => {
    const areaMap = {};
    filteredPlazas.forEach(r => {
      const key = r.Area;
      if (!areaMap[key]) {
        areaMap[key] = {
          division: r.Division,
          area: r.Area,
          plazaCount: 0,
          collectibleQty: 0,
          collectedQty: 0,
          todayCollected: 0,
          plazasNoData: 0,
        };
      }
      const g = areaMap[key];
      g.plazaCount += 1;
      g.collectibleQty += parseFloat(r.Collectible_Acc_Qty || 0);
      g.collectedQty   += parseFloat(r.Collected_Acc_Qty   || 0);

      const areaYesterday = yesterdayAll[r.Area] || {};
      const yQty          = areaYesterday[r.Plaza];
      if (yQty === undefined) {
        g.plazasNoData += 1;
      } else {
        g.todayCollected += calcTodayCollected(r.Collected_Acc_Qty, yQty);
      }
    });

    return Object.values(areaMap).sort((a, b) =>
      b.todayCollected - a.todayCollected
    );
  }, [filteredPlazas, yesterdayAll]);

  // ── Grand total ───────────────────────────────────────────────────────────
  const grandTotal = useMemo(() => {
    let collectibleQty  = 0;
    let collectedQty    = 0;
    let todayCollected  = 0;
    let plazaCount      = 0;
    let plazasNoData    = 0;

    filteredPlazas.forEach(r => {
      plazaCount      += 1;
      collectibleQty  += parseFloat(r.Collectible_Acc_Qty || 0);
      collectedQty    += parseFloat(r.Collected_Acc_Qty   || 0);

      const areaYesterday = yesterdayAll[r.Area] || {};
      const yQty          = areaYesterday[r.Plaza];
      if (yQty === undefined) {
        plazasNoData += 1;
      } else {
        todayCollected += calcTodayCollected(r.Collected_Acc_Qty, yQty);
      }
    });

    return { collectibleQty, collectedQty, todayCollected, plazaCount, plazasNoData };
  }, [filteredPlazas, yesterdayAll]);

  // ── Per-plaza rows with today delta ──────────────────────────────────────
  const plazaDetailRows = useMemo(() => {
    return filteredPlazas
      .map(r => {
        const areaYesterday = yesterdayAll[r.Area] || {};
        const yQty          = areaYesterday[r.Plaza];
        const hasBaseline   = yQty !== undefined;
        const todayCollected = hasBaseline
          ? calcTodayCollected(r.Collected_Acc_Qty, yQty)
          : null;
        return {
          division:        r.Division,
          area:            r.Area,
          plaza:           r.Plaza,
          collectibleQty:  parseFloat(r.Collectible_Acc_Qty || 0),
          collectedQty:    parseFloat(r.Collected_Acc_Qty   || 0),
          qtyPct:          r.Collection_Qty_Percent,
          yesterdayQty:    hasBaseline ? yQty : null,
          todayCollected,
          hasBaseline,
        };
      })
      .sort((a, b) => {
        // Sort: rows with baseline first, descending by today's collected
        if (a.hasBaseline && !b.hasBaseline) return -1;
        if (!a.hasBaseline && b.hasBaseline) return 1;
        return (b.todayCollected ?? 0) - (a.todayCollected ?? 0);
      });
  }, [filteredPlazas, yesterdayAll]);

  const hasAnyBaseline = useMemo(
    () => Object.keys(yesterdayAll).length > 0,
    [yesterdayAll]
  );

  // ── Badge helpers ─────────────────────────────────────────────────────────
  const todayClass = (val) => {
    if (val === null || val === undefined) return 'atdr-badge atdr-badge-na';
    if (val < 0)   return 'atdr-badge atdr-badge-down';
    if (val < 10)  return 'atdr-badge atdr-badge-warn';
    return 'atdr-badge atdr-badge-up';
  };

  const todayLabel = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return (val > 0 ? '+' : '') + fmt(val);
  };

  // ── Screenshot / share ────────────────────────────────────────────────────
  const generateCanvas = async () => {
    const node = captureRef.current;
    const inner = node.querySelector('.atdr-table-scroll');
    const table = node.querySelector('.atdr-table');
    const tWidth = Math.ceil(table ? table.scrollWidth : inner ? inner.scrollWidth : node.scrollWidth);
    const style  = window.getComputedStyle(node);
    const fullW  = Math.ceil(tWidth + (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0));

    return html2canvas(node, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      width: fullW,
      windowWidth: fullW,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const el = clonedDoc.querySelector('.atdr-capture');
        if (el) { el.style.width = fullW + 'px'; el.style.maxWidth = 'none'; }
        const sc = clonedDoc.querySelector('.atdr-table-scroll');
        if (sc) { sc.style.overflow = 'visible'; sc.style.width = tWidth + 'px'; }
        const tb = clonedDoc.querySelector('.atdr-table');
        if (tb) { tb.style.width = tWidth + 'px'; tb.style.minWidth = tWidth + 'px'; }
      },
    });
  };

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    return `All_Areas_Today_Collected_${date}.png`;
  };

  const handleShare = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const canvas = await generateCanvas();
      const blob   = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const file   = new File([blob], getFileName(), { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "All Areas Today's Collected" });
      } else {
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url; link.download = getFileName(); link.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (e.name !== 'AbortError') alert('❌ Could not share. Try Download instead.');
    } finally { setSharing(false); }
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const canvas = await generateCanvas();
      const link   = document.createElement('a');
      link.href     = canvas.toDataURL('image/png');
      link.download = getFileName();
      link.click();
    } catch (e) {
      console.error(e);
      alert('❌ Could not generate image.');
    } finally { setSharing(false); }
  };

  const handleDivisionChange = (div) => {
    setFilterDivision(div);
    setFilterArea('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="atdr-section">
      {/* Collapsible header */}
      <div className="atdr-section-header" onClick={() => setIsExpanded(v => !v)}>
        <div className="atdr-header-title">
          <span className="atdr-collapse-icon">{isExpanded ? '▼' : '▶'}</span>
          <div>
            <h2>📅 Today's Collected — All Areas</h2>
            {!isExpanded && (
              <p className="atdr-expand-hint">Click to expand</p>
            )}
          </div>
        </div>
        <div className="atdr-header-actions" onClick={e => e.stopPropagation()}>
          {isExpanded && (
            <>
              <button className="atdr-btn atdr-btn-share" onClick={handleShare} disabled={sharing}>
                📤 {sharing ? 'Preparing…' : 'Share'}
              </button>
              <button className="atdr-btn atdr-btn-download" onClick={handleDownload} disabled={sharing}>
                ⬇️ Download
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="atdr-body">

          {/* Status banner */}
          {loading && (
            <div className="atdr-status atdr-status-loading">
              ⏳ Loading yesterday's baseline from Supabase…
            </div>
          )}
          {!loading && !hasAnyBaseline && (
            <div className="atdr-status atdr-status-nodata">
              ℹ️ No yesterday baseline found. Upload tomorrow to see Today's Collected values.
            </div>
          )}
          {!loading && hasAnyBaseline && (
            <div className="atdr-status atdr-status-ok">
              ✅ Comparing against yesterday's saved baseline
            </div>
          )}

          {/* Filters + view toggle */}
          <div className="atdr-controls">
            <div className="atdr-filters">
              <div className="atdr-filter-box">
                <label>Division</label>
                <select
                  value={filterDivision}
                  onChange={e => handleDivisionChange(e.target.value)}
                  className="atdr-select"
                >
                  <option value="">All Divisions</option>
                  {divisions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="atdr-filter-box">
                <label>Area</label>
                <select
                  value={filterArea}
                  onChange={e => setFilterArea(e.target.value)}
                  className="atdr-select"
                  disabled={!filterDivision}
                >
                  <option value="">All Areas</option>
                  {areas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="atdr-view-toggle">
              <button
                className={`atdr-toggle-btn ${viewMode === 'area' ? 'active' : ''}`}
                onClick={() => setViewMode('area')}
              >
                Area View
              </button>
              <button
                className={`atdr-toggle-btn ${viewMode === 'plaza' ? 'active' : ''}`}
                onClick={() => setViewMode('plaza')}
              >
                Plaza Detail
              </button>
            </div>
          </div>

          {/* Capture area (screenshot target) */}
          <div className="atdr-capture" ref={captureRef}>
            <div className="atdr-capture-header">
              <span className="atdr-capture-title">📅 Today's Collected — All Areas</span>
              <span className="atdr-capture-date">{new Date().toLocaleDateString('en-GB')}</span>
            </div>

            {/* Grand total summary cards */}
            <div className="atdr-summary-cards">
              <div className="atdr-card">
                <div className="atdr-card-label">Total Plazas</div>
                <div className="atdr-card-value">{fmt(grandTotal.plazaCount)}</div>
              </div>
              <div className="atdr-card">
                <div className="atdr-card-label">Total Collected</div>
                <div className="atdr-card-value">{fmt(grandTotal.collectedQty)}</div>
              </div>
              <div className="atdr-card atdr-card-highlight">
                <div className="atdr-card-label">Today's Collected</div>
                <div className={`atdr-card-value ${grandTotal.todayCollected >= 0 ? 'atdr-val-up' : 'atdr-val-down'}`}>
                  {loading ? '…' : !hasAnyBaseline ? 'N/A' : (grandTotal.todayCollected > 0 ? '+' : '') + fmt(grandTotal.todayCollected)}
                </div>
              </div>
              <div className="atdr-card">
                <div className="atdr-card-label">No Baseline</div>
                <div className="atdr-card-value atdr-val-muted">{grandTotal.plazasNoData} plazas</div>
              </div>
            </div>

            {/* ── Area View ─────────────────────────────────────────────── */}
            {viewMode === 'area' && (
              <div className="atdr-table-scroll">
                <table className="atdr-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Division</th>
                      <th>Area</th>
                      <th>Plazas</th>
                      <th>Target Qty</th>
                      <th>Total Collected</th>
                      <th className="atdr-th-today">Today's Collected</th>
                      <th>No Baseline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areaRows.map((row, i) => (
                      <tr key={row.area} className={i % 2 === 0 ? 'atdr-row-even' : 'atdr-row-odd'}>
                        <td className="atdr-td-center">{i + 1}</td>
                        <td>{row.division}</td>
                        <td className="atdr-td-area">{row.area}</td>
                        <td className="atdr-td-num">{row.plazaCount}</td>
                        <td className="atdr-td-num">{fmt(row.collectibleQty)}</td>
                        <td className="atdr-td-num">{fmt(row.collectedQty)}</td>
                        <td className="atdr-td-num atdr-td-today">
                          {loading ? (
                            <span className="atdr-badge atdr-badge-na">…</span>
                          ) : row.plazasNoData === row.plazaCount ? (
                            <span className="atdr-badge atdr-badge-na">N/A</span>
                          ) : (
                            <span className={todayClass(row.todayCollected)}>
                              {todayLabel(row.todayCollected)}
                            </span>
                          )}
                        </td>
                        <td className="atdr-td-num">
                          {row.plazasNoData > 0
                            ? <span className="atdr-badge atdr-badge-na">{row.plazasNoData}</span>
                            : <span className="atdr-badge atdr-badge-up">0</span>}
                        </td>
                      </tr>
                    ))}
                    {/* Grand total row */}
                    <tr className="atdr-row-total">
                      <td colSpan={3} className="atdr-td-total-label">GRAND TOTAL</td>
                      <td className="atdr-td-num">{fmt(grandTotal.plazaCount)}</td>
                      <td className="atdr-td-num">{fmt(grandTotal.collectibleQty)}</td>
                      <td className="atdr-td-num">{fmt(grandTotal.collectedQty)}</td>
                      <td className="atdr-td-num atdr-td-today">
                        {loading ? (
                          <span className="atdr-badge atdr-badge-na">…</span>
                        ) : !hasAnyBaseline ? (
                          <span className="atdr-badge atdr-badge-na">N/A</span>
                        ) : (
                          <span className={todayClass(grandTotal.todayCollected)}>
                            {todayLabel(grandTotal.todayCollected)}
                          </span>
                        )}
                      </td>
                      <td className="atdr-td-num">
                        {grandTotal.plazasNoData > 0
                          ? <span className="atdr-badge atdr-badge-na">{grandTotal.plazasNoData}</span>
                          : <span className="atdr-badge atdr-badge-up">0</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Plaza Detail View ──────────────────────────────────────── */}
            {viewMode === 'plaza' && (
              <div className="atdr-table-scroll">
                <table className="atdr-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Division</th>
                      <th>Area</th>
                      <th>Plaza</th>
                      <th>Target Qty</th>
                      <th>Collected</th>
                      <th>Qty %</th>
                      <th>Yesterday</th>
                      <th className="atdr-th-today">Today's Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plazaDetailRows.map((row, i) => (
                      <tr
                        key={`${row.area}-${row.plaza}`}
                        className={i % 2 === 0 ? 'atdr-row-even' : 'atdr-row-odd'}
                      >
                        <td className="atdr-td-center">{i + 1}</td>
                        <td>{row.division}</td>
                        <td className="atdr-td-area">{row.area}</td>
                        <td className="atdr-td-plaza">{row.plaza}</td>
                        <td className="atdr-td-num">{fmt(row.collectibleQty)}</td>
                        <td className="atdr-td-num">{fmt(row.collectedQty)}</td>
                        <td className="atdr-td-num">
                          <span className="atdr-pct-badge">{row.qtyPct}%</span>
                        </td>
                        <td className="atdr-td-num">
                          {row.hasBaseline
                            ? fmt(row.yesterdayQty)
                            : <span className="atdr-badge atdr-badge-na">—</span>}
                        </td>
                        <td className="atdr-td-num atdr-td-today">
                          {loading ? (
                            <span className="atdr-badge atdr-badge-na">…</span>
                          ) : (
                            <span className={todayClass(row.todayCollected)}>
                              {todayLabel(row.todayCollected)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Grand total row */}
                    <tr className="atdr-row-total">
                      <td colSpan={4} className="atdr-td-total-label">GRAND TOTAL</td>
                      <td className="atdr-td-num">{fmt(grandTotal.collectibleQty)}</td>
                      <td className="atdr-td-num">{fmt(grandTotal.collectedQty)}</td>
                      <td className="atdr-td-num">—</td>
                      <td className="atdr-td-num">—</td>
                      <td className="atdr-td-num atdr-td-today">
                        {loading ? (
                          <span className="atdr-badge atdr-badge-na">…</span>
                        ) : !hasAnyBaseline ? (
                          <span className="atdr-badge atdr-badge-na">N/A</span>
                        ) : (
                          <span className={todayClass(grandTotal.todayCollected)}>
                            {todayLabel(grandTotal.todayCollected)}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="atdr-capture-footer">Generated by Collection Analytics By Reza</div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AllAreasTodayReport;
