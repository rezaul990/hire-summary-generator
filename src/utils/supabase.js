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
