import { getYesterdayData, getYesterdayPlazaCollectionForArea } from './supabase.js';
import { getWhatsAppConfigFromFirebase } from '../config/firebase.js';

// ─────────────────────────────────────────────
// WaSender API Configuration
// ─────────────────────────────────────────────
const WASENDER_API_KEY = '45286d7b16ceb5f66f9a0d355452f7c12557fc17959f52e2aee12d8013dbb96c';
const WASENDER_API_URL = 'https://www.wasenderapi.com/api/send-message';

// ─────────────────────────────────────────────
// Helper: Convert HTML → WhatsApp formatting
// ─────────────────────────────────────────────
const htmlToWhatsApp = (text) =>
  text
    .replace(/<b>([\s\S]*?)<\/b>/g, '*$1*')
    .replace(/<i>([\s\S]*?)<\/i>/g, '_$1_')
    .replace(/<[^>]+>/g, '');

// ─────────────────────────────────────────────
// Helper: Format number with commas
// ─────────────────────────────────────────────
const fmt = (num) => new Intl.NumberFormat('en-IN').format(Math.round(num));

// ─────────────────────────────────────────────
// Core: Send ONE WhatsApp message via WaSender
// ─────────────────────────────────────────────
export const sendWhatsAppMessage = async (message, toPhone) => {
  try {
    const cleanMessage = htmlToWhatsApp(message);

    const response = await fetch(WASENDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WASENDER_API_KEY}`,
      },
      body: JSON.stringify({
        to: toPhone,
        text: cleanMessage,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ WhatsApp message successfully sent to +${toPhone}`);
    } else {
      console.error(`❌ WaSender API error for +${toPhone}:`, data.message || JSON.stringify(data));
    }

    return data.success === true;
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp to +${toPhone}:`, error);
    return false;
  }
};

// ─────────────────────────────────────────────
// Build area report for any given area name
// ─────────────────────────────────────────────
const buildAreaReport = async (areaWiseData, areaName) => {
  // Filter plaza rows for this area
  const areaRows = areaWiseData.filter(
    row =>
      row.Area &&
      row.Area.toLowerCase().trim() === areaName.toLowerCase().trim() &&
      !row.isSubtotal &&
      !row.isGrandTotal &&
      row.Plaza
  );

  if (areaRows.length === 0) {
    console.log(`ℹ️ No plaza rows found for area "${areaName}" in uploaded file`);
    return null;
  }

  // Fetch yesterday's plaza baseline from all_plaza_daily table
  const yesterdayPlazaData = await getYesterdayPlazaCollectionForArea(areaName);
  const hasBaseline        = Object.keys(yesterdayPlazaData).length > 0;

  // Fetch yesterday's area total
  const yesterdayAreaData = await getYesterdayData();
  const yesterdayAreaQty  = yesterdayAreaData[areaName] || 0;

  // Compute totals
  let totalCollectibleQty  = 0;
  let totalCollectedQty    = 0;
  let totalCollectibleAmt  = 0;
  let totalCollectedAmt    = 0;
  let totalPrevOverdue     = 0;
  let totalRunOverdue      = 0;
  let totalTodayCollected  = 0;

  const plazaDetails = [];

  areaRows.forEach(row => {
    const collectedQty   = parseFloat(row.Collected_Acc_Qty  || 0);
    const collectibleQty = parseFloat(row.Collectible_Acc_Qty || 0);
    const collectedAmt   = parseFloat(row.Collected_Amount    || 0);
    const collectibleAmt = parseFloat(row.Collectible_Amount  || 0);
    const prevOD         = parseFloat(row.Previous_Overdue    || 0);
    const runOD          = parseFloat(row.Running_Overdue     || 0);

    totalCollectibleQty  += collectibleQty;
    totalCollectedQty    += collectedQty;
    totalCollectibleAmt  += collectibleAmt;
    totalCollectedAmt    += collectedAmt;
    totalPrevOverdue     += prevOD;
    totalRunOverdue      += runOD;

    const yQty         = yesterdayPlazaData[row.Plaza];
    const hasPlazaBase = yQty !== undefined;
    const todayQty     = hasPlazaBase ? collectedQty - yQty : null;

    if (hasPlazaBase && todayQty !== null) totalTodayCollected += todayQty;

    plazaDetails.push({
      plaza:         row.Plaza,
      collectedQty,
      collectedAmt,
      qtyPercent:    row.Collection_Qty_Percent,
      amtPercent:    row.Collection_Amt_Percent,
      overdueChange: runOD - prevOD,
      todayQty,
      hasPlazaBase,
    });
  });

  const qtyPercent    = totalCollectibleQty > 0
    ? ((totalCollectedQty / totalCollectibleQty) * 100).toFixed(2) : '0.00';
  const amtPercent    = totalCollectibleAmt > 0
    ? ((totalCollectedAmt / totalCollectibleAmt) * 100).toFixed(2) : '0.00';
  const totalOdChange = totalRunOverdue - totalPrevOverdue;

  // Area-level "Today's Collected" label
  let todayCollectedLabel;
  if (hasBaseline) {
    const sign = totalTodayCollected >= 0 ? '+' : '';
    todayCollectedLabel = `*Today's Collected: ${sign}${fmt(totalTodayCollected)}*`;
  } else {
    const areaDiff = totalCollectedQty - yesterdayAreaQty;
    if (yesterdayAreaQty === 0) {
      todayCollectedLabel = `Today's Collected: _(No baseline yet)_`;
    } else {
      const sign = areaDiff >= 0 ? '+' : '';
      todayCollectedLabel = `*Today's Collected: ${sign}${fmt(areaDiff)}*`;
    }
  }

  // Separate low-performance vs normal plazas
  const lowPerf  = plazaDetails.filter(p => p.hasPlazaBase && p.todayQty !== null && p.todayQty < 10);
  const normalPl = plazaDetails.filter(p => !lowPerf.includes(p));

  const todayLabel = (p) => {
    if (!p.hasPlazaBase || p.todayQty === null) return 'No baseline';
    return `Today: ${p.todayQty >= 0 ? '+' : ''}${fmt(p.todayQty)}`;
  };

  let lowPerfText = '';
  if (lowPerf.length > 0) {
    lowPerfText = '\n\n⚠️ *LOW PERFORMANCE* (Today < 10 cards):';
    lowPerf.forEach((p, i) => {
      lowPerfText += `\n  ${i + 1}. ${p.plaza} — ${todayLabel(p)} | Total: ${fmt(p.collectedQty)}`;
    });
  }

  let plazaText = '';
  normalPl.forEach((p, i) => {
    const odIcon = p.overdueChange > 0 ? '🔴' : '🟢';
    const odSign = p.overdueChange > 0 ? '+' : '';
    plazaText +=
      `\n  ${i + 1}. *${p.plaza}*` +
      `\n     ${todayLabel(p)} | Total: ${fmt(p.collectedQty)} | Qty: ${p.qtyPercent}%` +
      `\n     Amt: ${fmt(p.collectedAmt)} (${p.amtPercent}%) | ${odIcon} OD: ${odSign}${fmt(p.overdueChange)}`;
  });

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    `📊 *${areaName.toUpperCase()} REPORT*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 ${dateStr}  ⏰ ${timeStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📇 ${todayCollectedLabel}\n` +
    `📦 Total Collected: ${fmt(totalCollectedQty)}\n\n` +
    `🎯 Target Qty: ${fmt(totalCollectibleQty)}\n` +
    `✅ Achieved: ${fmt(totalCollectedQty)} (${qtyPercent}%)\n\n` +
    `💰 Target Amt: ${fmt(totalCollectibleAmt)}\n` +
    `💵 Achieved: ${fmt(totalCollectedAmt)} (${amtPercent}%)\n\n` +
    `📉 Prev O/D: ${fmt(totalPrevOverdue)}\n` +
    `📊 Current O/D: ${fmt(totalRunOverdue)}\n` +
    `${totalOdChange > 0 ? '🔴' : '🟢'} O/D Change: ${fmt(totalOdChange)}` +
    `${lowPerfText}\n` +
    `\n🏪 *PLAZA DETAILS:*` +
    `${plazaText}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `_Collection Analytics By Reza_`
  );
};

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────
// Main export — called on every Excel upload
// Reads multi-recipient list from Firebase Realtime Database
// and dispatches reports to all configured phone numbers
// ─────────────────────────────────────────────
export const sendWhatsAppUploadNotification = async (areaWiseData) => {
  try {
    const config = await getWhatsAppConfigFromFirebase();
    const { enabled, recipients } = config || {};

    if (!enabled) {
      console.log('ℹ️ WhatsApp reports are master-disabled in Firebase settings');
      return;
    }

    const activeRecipients = (recipients || []).filter(
      r => r.enabled && r.phone && r.area
    );

    if (activeRecipients.length === 0) {
      console.log('ℹ️ No active WhatsApp recipient rules found in Firebase');
      return;
    }

    console.log(`🚀 Dispatching WhatsApp reports to ${activeRecipients.length} target(s)...`);

    // Cache generated reports by area name to avoid duplicate calculations
    const areaReportCache = {};

    for (let i = 0; i < activeRecipients.length; i++) {
      const recipient = activeRecipients[i];
      const { phone, area, label } = recipient;

      if (!areaReportCache[area]) {
        areaReportCache[area] = await buildAreaReport(areaWiseData, area);
      }

      const message = areaReportCache[area];

      if (message) {
        console.log(`📤 Sending ${area} report to ${label ? `"${label}" ` : ''}(+${phone})...`);
        await sendWhatsAppMessage(message, phone);
      } else {
        console.log(`ℹ️ Skipped ${label || phone} — no data found for "${area}" in uploaded file`);
      }

      // If multiple targets, add a small 1s delay between sends
      if (i < activeRecipients.length - 1) {
        await sleep(1000);
      }
    }
  } catch (error) {
    console.error('❌ WhatsApp multi-dispatch error:', error);
  }
};
