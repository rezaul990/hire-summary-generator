// Supabase Configuration
const SUPABASE_URL = 'https://nseykgyfbakvthrymuoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZXlrZ3lmYmFrdnRocnltdW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDU3MjksImV4cCI6MjA5MjQyMTcyOX0.zXkjvZb02qXCPl9nDSl-M64mfpOswhBsKFp_phZcOzA';

/**
 * Save today's Division-02 data to Supabase as yesterday's data
 * @param {Array} areaReports - Array of area data with name and collectedQty
 * @returns {Promise<boolean>} - Success status
 */
export const saveTodayData = async (areaReports) => {
  try {
    // Save as yesterday's date for tomorrow's comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const records = areaReports.map(area => ({
      date: yesterdayStr,
      area_name: area.name,
      collected_qty: parseInt(area.collectedQty) || 0,
    }));

    const response = await fetch(`${SUPABASE_URL}/rest/v1/division02_daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(records),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to save data to Supabase:', error);
    return false;
  }
};

/**
 * Get yesterday's Division-02 data from Supabase
 * @returns {Promise<Object>} - Object with area names as keys and collected_qty as values
 */
export const getYesterdayData = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/division02_daily?date=eq.${yesterdayStr}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    
    // Convert array to object for easy lookup
    const yesterdayData = {};
    data.forEach(record => {
      yesterdayData[record.area_name] = record.collected_qty;
    });

    return yesterdayData;
  } catch (error) {
    console.error('Failed to fetch yesterday data from Supabase:', error);
    return {};
  }
};

/**
 * Save Tangail plaza data to Supabase as yesterday's data
 * @param {Array} plazaReports - Array of plaza data with name and collectedQty
 * @returns {Promise<boolean>} - Success status
 */
export const saveTangailPlazaData = async (plazaReports) => {
  try {
    // Save as yesterday's date for tomorrow's comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const records = plazaReports.map(plaza => ({
      date: yesterdayStr,
      plaza_name: plaza.name,
      collected_qty: parseInt(plaza.collectedQty) || 0,
    }));

    const response = await fetch(`${SUPABASE_URL}/rest/v1/tangail_plaza_daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(records),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to save Tangail plaza data to Supabase:', error);
    return false;
  }
};

/**
 * Get yesterday's Tangail plaza data from Supabase
 * @returns {Promise<Object>} - Object with plaza names as keys and collected_qty as values
 */
export const getYesterdayTangailPlazaData = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tangail_plaza_daily?date=eq.${yesterdayStr}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    
    // Convert array to object for easy lookup
    const yesterdayData = {};
    data.forEach(record => {
      yesterdayData[record.plaza_name] = record.collected_qty;
    });

    return yesterdayData;
  } catch (error) {
    console.error('Failed to fetch yesterday Tangail plaza data from Supabase:', error);
    return {};
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ALL-AREA universal plaza daily collection
// Table: all_plaza_daily
//   date          DATE        (YYYY-MM-DD)
//   area_name     TEXT
//   plaza_name    TEXT
//   collected_qty INTEGER
//   PRIMARY KEY (date, area_name, plaza_name)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save all-area plaza collection data to Supabase.
 * Call this on every file upload so that tomorrow's upload can compare.
 *
 * @param {Array<{area: string, plaza: string, collectedQty: number}>} plazaRecords
 * @returns {Promise<boolean>}
 */
export const saveAllPlazaDailyCollection = async (plazaRecords) => {
  if (!plazaRecords || plazaRecords.length === 0) return false;

  try {
    // Always store as yesterday's date so that tomorrow's upload fetch
    // (which queries yesterday) finds this data immediately.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

    // Step 1: Delete ALL existing rows for yesterday — full replacement.
    const deleteResp = await fetch(
      `${SUPABASE_URL}/rest/v1/all_plaza_daily?date=eq.${yesterdayStr}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
      }
    );

    if (!deleteResp.ok) {
      const text = await deleteResp.text();
      console.error('saveAllPlazaDailyCollection delete error:', text);
      return false;
    }

    // Step 2: Insert fresh records with yesterday's date.
    const records = plazaRecords.map(p => ({
      date: yesterdayStr,
      area_name: p.area,
      plaza_name: p.plaza,
      collected_qty: parseInt(p.collectedQty) || 0,
    }));

    const insertResp = await fetch(
      `${SUPABASE_URL}/rest/v1/all_plaza_daily`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(records),
      }
    );

    if (!insertResp.ok) {
      const text = await insertResp.text();
      console.error('saveAllPlazaDailyCollection insert error:', text);
    }
    return insertResp.ok;
  } catch (error) {
    console.error('Failed to save all-plaza daily data:', error);
    return false;
  }
};

/**
 * Fetch yesterday's all-area plaza collection from Supabase.
 * Returns a nested lookup: { [areaName]: { [plazaName]: collectedQty } }
 *
 * @returns {Promise<Object>}
 */
export const getYesterdayAllPlazaCollection = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/all_plaza_daily?date=eq.${yesterdayStr}&select=area_name,plaza_name,collected_qty`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) return {};

    const data = await response.json();

    // Build nested lookup  { area -> { plaza -> qty } }
    const result = {};
    data.forEach(record => {
      if (!result[record.area_name]) result[record.area_name] = {};
      result[record.area_name][record.plaza_name] = record.collected_qty;
    });
    return result;
  } catch (error) {
    console.error('Failed to fetch yesterday all-plaza data:', error);
    return {};
  }
};

/**
 * Convenience flat-lookup version for a single area.
 * Returns { [plazaName]: collectedQty } — mirrors getYesterdayTangailPlazaData shape.
 *
 * @param {string} areaName
 * @returns {Promise<Object>}
 */
export const getYesterdayPlazaCollectionForArea = async (areaName) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const encoded = encodeURIComponent(areaName);
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/all_plaza_daily?date=eq.${yesterdayStr}&area_name=eq.${encoded}&select=plaza_name,collected_qty`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) return {};

    const data = await response.json();
    const result = {};
    data.forEach(record => {
      result[record.plaza_name] = record.collected_qty;
    });
    return result;
  } catch (error) {
    console.error(`Failed to fetch yesterday plaza data for area "${areaName}":`, error);
    return {};
  }
};
