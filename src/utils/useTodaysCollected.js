import { useState, useEffect } from 'react';
import {
  getYesterdayAllPlazaCollection,
  getYesterdayPlazaCollectionForArea,
} from './supabase';

/**
 * Fetch yesterday's plaza collection data for ALL areas.
 * Returns a nested map: { [areaName]: { [plazaName]: collectedQty } }
 *
 * Usage (all areas):
 *   const { data, loading } = useTodaysCollected();
 *   const yesterdayQty = data?.[row.Area]?.[row.Plaza] ?? 0;
 *   const todayCollected = row.Collected_Acc_Qty - yesterdayQty;
 */
export const useTodaysCollected = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getYesterdayAllPlazaCollection()
      .then(result => {
        if (!cancelled) setData(result || {});
      })
      .catch(() => {
        if (!cancelled) setData({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { data, loading };
};

/**
 * Fetch yesterday's plaza collection data for a SINGLE area.
 * Returns a flat map: { [plazaName]: collectedQty }
 *
 * Usage (one area):
 *   const { data, loading } = useTodaysCollectedForArea(userArea);
 *   const yesterdayQty = data?.[row.Plaza] ?? 0;
 *   const todayCollected = row.Collected_Acc_Qty - yesterdayQty;
 *
 * @param {string} areaName - The area name to fetch data for
 */
export const useTodaysCollectedForArea = (areaName) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!areaName) {
      setData({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getYesterdayPlazaCollectionForArea(areaName)
      .then(result => {
        if (!cancelled) setData(result || {});
      })
      .catch(() => {
        if (!cancelled) setData({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [areaName]);

  return { data, loading };
};

/**
 * Pure helper — compute today's collected qty for a single plaza row.
 * Returns a number (can be negative if yesterday was higher).
 *
 * @param {number} collectedAccQty - Current cumulative collected qty from Excel
 * @param {number} yesterdayQty    - Yesterday's stored collected qty
 * @returns {number}
 */
export const calcTodayCollected = (collectedAccQty, yesterdayQty) => {
  return (parseFloat(collectedAccQty) || 0) - (parseFloat(yesterdayQty) || 0);
};
