// Save data to localStorage with timestamp
export const saveDailyData = (data) => {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `walton_data_${today}`;
  localStorage.setItem(storageKey, JSON.stringify(data));
  localStorage.setItem('walton_last_date', today);
};

// Get yesterday's data
export const getPreviousDayData = () => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayDate = yesterday.toISOString().split('T')[0];
  const storageKey = `walton_data_${yesterdayDate}`;
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : null;
};

// Get all stored dates
export const getStoredDates = () => {
  const dates = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('walton_data_')) {
      dates.push(key.replace('walton_data_', ''));
    }
  }
  return dates.sort().reverse();
};

// Get data for specific date
export const getDataForDate = (date) => {
  const storageKey = `walton_data_${date}`;
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : null;
};
