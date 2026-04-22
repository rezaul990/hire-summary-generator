import { getYesterdayData, getYesterdayTangailPlazaData } from './supabase.js';

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8628472212:AAEBDPpAmX9h_13bsRRE7ccxNtMqsp3uHu8';
const TELEGRAM_CHAT_ID = '5831003572';

/**
 * Send a message to Telegram
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} - Success status
 */
export const sendTelegramMessage = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
};

/**
 * Track file upload usage
 * @returns {Promise<void>}
 */
export const trackFileUpload = async () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-GB');
  
  const message = `
📊 <b>Collection Summary App Usage</b>

📅 Date: ${dateStr}
⏰ Time: ${timeStr}
📁 Action: Excel file uploaded
🔢 Daily usage count tracked

---
<i>Automated notification from Collection Analytics</i>
  `.trim();

  await sendTelegramMessage(message);
};

/**
 * Send Tangail Area Report to Telegram with daily card comparison
 * @param {Array} areaWiseData - The area-wise data
 * @returns {Promise<void>}
 */
export const sendTangailReport = async (areaWiseData) => {
  // Filter Tangail area data
  const tangailData = areaWiseData.filter(
    row => row.Area && row.Area.toLowerCase().includes('tangail') && !row.isGrandTotal
  );

  if (tangailData.length === 0) {
    console.log('No Tangail data found');
    return;
  }

  // Calculate Tangail totals
  let totalCollectibleQty = 0;
  let totalCollectedQty = 0;
  let totalCollectibleAmt = 0;
  let totalCollectedAmt = 0;
  let totalPrevOverdue = 0;
  let totalRunOverdue = 0;

  const plazaDetails = [];

  tangailData.forEach(row => {
    if (!row.isSubtotal) {
      totalCollectibleQty += parseFloat(row.Collectible_Acc_Qty || 0);
      totalCollectedQty += parseFloat(row.Collected_Acc_Qty || 0);
      totalCollectibleAmt += parseFloat(row.Collectible_Amount || 0);
      totalCollectedAmt += parseFloat(row.Collected_Amount || 0);
      totalPrevOverdue += parseFloat(row.Previous_Overdue || 0);
      totalRunOverdue += parseFloat(row.Running_Overdue || 0);

      const overdueChange = parseFloat(row.Running_Overdue || 0) - parseFloat(row.Previous_Overdue || 0);

      plazaDetails.push({
        plaza: row.Plaza,
        collectedQty: row.Collected_Acc_Qty,
        collectedAmt: row.Collected_Amount,
        qtyPercent: row.Collection_Qty_Percent,
        amtPercent: row.Collection_Amt_Percent,
        overdueChange: overdueChange,
      });
    }
  });

  const qtyPercent = totalCollectibleQty > 0 
    ? ((totalCollectedQty / totalCollectibleQty) * 100).toFixed(2) 
    : '0.00';
  const amtPercent = totalCollectibleAmt > 0 
    ? ((totalCollectedAmt / totalCollectibleAmt) * 100).toFixed(2) 
    : '0.00';
  const overdueChange = totalRunOverdue - totalPrevOverdue;

  // Get yesterday's Tangail card collection from Supabase
  const yesterdayData = await getYesterdayData();
  const tangailAreaName = 'Tangail Area';
  const yesterdayQty = yesterdayData[tangailAreaName] || 0;
  const todayQty = parseInt(totalCollectedQty) || 0;
  const qtyDiff = todayQty - yesterdayQty;

  // Determine comparison text
  let cardComparisonText = '';
  if (yesterdayQty === 0) {
    cardComparisonText = '(First day data)';
  } else if (qtyDiff > 0) {
    cardComparisonText = `(↑ +${formatNumber(qtyDiff)} from yesterday)`;
  } else if (qtyDiff < 0) {
    cardComparisonText = `(↓ ${formatNumber(qtyDiff)} from yesterday)`;
  } else {
    cardComparisonText = `(→ Same as yesterday)`;
  }

  // Get yesterday's Tangail plaza data from Supabase
  const yesterdayPlazaData = await getYesterdayTangailPlazaData();

  // Separate plazas into two groups: low growth (difference < 10) and good performance (difference >= 10)
  const lowPerformancePlazas = [];
  const normalPlazas = [];

  plazaDetails.forEach(plaza => {
    const todayQty = parseInt(plaza.collectedQty) || 0;
    const yesterdayQty = yesterdayPlazaData[plaza.plaza] || 0;
    const qtyDiff = todayQty - yesterdayQty;
    
    // Low performance = difference from yesterday is less than 10 (including negative)
    // Only check if yesterday data exists
    if (yesterdayQty > 0 && qtyDiff < 10) {
      lowPerformancePlazas.push(plaza);
    } else {
      normalPlazas.push(plaza);
    }
  });

  // Format low performance plazas (difference < 10 from yesterday)
  let lowPerformanceList = '';
  if (lowPerformancePlazas.length > 0) {
    lowPerformancePlazas.forEach((plaza, index) => {
      const todayQty = parseInt(plaza.collectedQty) || 0;
      const yesterdayQty = yesterdayPlazaData[plaza.plaza] || 0;
      const qtyDiff = todayQty - yesterdayQty;
      
      let comparisonText = '';
      if (qtyDiff > 0) {
        comparisonText = `(↑ +${qtyDiff})`;
      } else if (qtyDiff < 0) {
        comparisonText = `(↓ ${qtyDiff})`;
      } else {
        comparisonText = `(→ Same)`;
      }
      
      lowPerformanceList += `\n${index + 1}. <b>${plaza.plaza}</b> - Card: ${plaza.collectedQty} ${comparisonText}`;
    });
  }

  // Format normal plazas (10+ cards)
  let plazaList = '';
  normalPlazas.forEach((plaza, index) => {
    const todayQty = parseInt(plaza.collectedQty) || 0;
    const yesterdayQty = yesterdayPlazaData[plaza.plaza] || 0;
    const qtyDiff = todayQty - yesterdayQty;
    
    let comparisonText = '';
    if (yesterdayQty === 0) {
      comparisonText = '(First day)';
    } else if (qtyDiff > 0) {
      comparisonText = `(↑ +${qtyDiff})`;
    } else if (qtyDiff < 0) {
      comparisonText = `(↓ ${qtyDiff})`;
    } else {
      comparisonText = `(→ Same)`;
    }
    
    const overdueIndicator = plaza.overdueChange > 0 ? '🔴' : '🟢';
    const overdueSign = plaza.overdueChange > 0 ? '+' : '';
    
    plazaList += `\n${index + 1}. <b>${plaza.plaza}</b>
   Card: ${plaza.collectedQty} ${comparisonText} | Qty: ${plaza.qtyPercent}%
   Amt: ${formatNumber(plaza.collectedAmt)} (${plaza.amtPercent}%)
   ${overdueIndicator} O/D Change: ${overdueSign}${formatNumber(plaza.overdueChange)}`;
  });

  const message = `
🏢 <b>TANGAIL AREA REPORT</b>

📅 Date: ${new Date().toLocaleDateString('en-GB')}
⏰ Time: ${new Date().toLocaleTimeString('en-GB')}

📊 <b>SUMMARY</b>
━━━━━━━━━━━━━━━━━━━━
📇 Card Collected: ${formatNumber(totalCollectedQty)} ${cardComparisonText}

🎯 Target Qty: ${formatNumber(totalCollectibleQty)}
✅ Achieved Qty: ${formatNumber(totalCollectedQty)} (${qtyPercent}%)

💰 Target Amt: ${formatNumber(totalCollectibleAmt)}
💵 Achieved Amt: ${formatNumber(totalCollectedAmt)} (${amtPercent}%)

📉 Previous O/D: ${formatNumber(totalPrevOverdue)}
📊 Current O/D: ${formatNumber(totalRunOverdue)}
${overdueChange > 0 ? '🔴' : '🟢'} Change: ${formatNumber(overdueChange)}
${lowPerformancePlazas.length > 0 ? `\n⚠️ <b>LOW PERFORMANCE PLAZAS (Growth Below 10 Cards)</b>\n━━━━━━━━━━━━━━━━━━━━${lowPerformanceList}\n` : ''}
🏪 <b>PLAZA DETAILS</b>
━━━━━━━━━━━━━━━━━━━━${plazaList}

━━━━━━━━━━━━━━━━━━━━
<i>Generated by Collection Analytics By Reza</i>
  `.trim();

  await sendTelegramMessage(message);

  // Note: Tangail plaza data is saved manually by user via save button
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Send Division-02 Report to Telegram with daily comparison
 * @param {Array} areaWiseData - The area-wise data
 * @returns {Promise<void>}
 */
export const sendDivision02Report = async (areaWiseData) => {
  // Filter Division-02 areas (Dhaka West, Gazipur West, Sirajgonj, Tangail)
  const division02Areas = ['dhaka west', 'gazipur west', 'sirajgonj', 'tangail'];
  
  const areaReports = [];
  
  division02Areas.forEach(areaName => {
    const areaData = areaWiseData.filter(
      row => row.Area && row.Area.toLowerCase().includes(areaName) && row.isSubtotal
    );

    if (areaData.length > 0) {
      const area = areaData[0];
      const overdueChange = parseFloat(area.Running_Overdue || 0) - parseFloat(area.Previous_Overdue || 0);
      
      // Clean area name by removing " - SUBTOTAL"
      const cleanAreaName = area.Area.replace(' - SUBTOTAL', '');
      
      areaReports.push({
        name: cleanAreaName,
        collectedQty: area.Collected_Acc_Qty || 0,
        qtyPercent: area.Collection_Qty_Percent || '0.00',
        amtPercent: area.Collection_Amt_Percent || '0.00',
        overdueChange: overdueChange,
      });
    }
  });

  if (areaReports.length === 0) {
    console.log('No Division-02 data found');
    return;
  }

  // Get yesterday's data from Supabase
  const yesterdayData = await getYesterdayData();

  // Build message with daily comparison
  let reportLines = [];
  areaReports.forEach(area => {
    const todayQty = parseInt(area.collectedQty) || 0;
    const yesterdayQty = yesterdayData[area.name] || 0;
    const qtyDiff = todayQty - yesterdayQty;
    
    // Determine comparison indicator
    let comparisonText = '';
    if (yesterdayQty === 0) {
      comparisonText = '(First day data)';
    } else if (qtyDiff > 0) {
      comparisonText = `(↑ +${formatNumber(qtyDiff)} from yesterday)`;
    } else if (qtyDiff < 0) {
      comparisonText = `(↓ ${formatNumber(qtyDiff)} from yesterday)`;
    } else {
      comparisonText = `(→ Same as yesterday)`;
    }

    const overdueIndicator = area.overdueChange > 0 ? '🔴' : '🟢';
    const overdueSign = area.overdueChange > 0 ? '+' : '';
    
    reportLines.push(
      `<b>${area.name}</b>\nCard: ${formatNumber(area.collectedQty)} ${comparisonText}\nQty: ${area.qtyPercent}% | Amt: ${area.amtPercent}% | ${overdueIndicator} Change: ${overdueSign}${formatNumber(area.overdueChange)}`
    );
  });

  const message = `
📊 <b>DIVISION-02 REPORT</b>

📅 ${new Date().toLocaleDateString('en-GB')} | ⏰ ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}

${reportLines.join('\n\n')}

━━━━━━━━━━━━━━━━━━━━
<i>Collection Analytics By Reza</i>
  `.trim();

  await sendTelegramMessage(message);

  // Note: Data is manually saved to Supabase by user
};

/**
 * Send combined notification (usage tracking + Tangail report + Division-02 report)
 * @param {Array} areaWiseData - The area-wise data
 * @returns {Promise<void>}
 */
export const sendUploadNotification = async (areaWiseData) => {
  // Track usage
  await trackFileUpload();
  
  // Send Tangail report if data exists
  await sendTangailReport(areaWiseData);
  
  // Send Division-02 report
  await sendDivision02Report(areaWiseData);
};
