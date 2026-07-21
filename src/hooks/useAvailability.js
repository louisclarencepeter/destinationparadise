import { useEffect, useState } from 'react';
import { fetchMonthAvailability } from '../lib/storeApi.js';

/**
 * Loads one month of departure availability for a store experience.
 *
 * @param {string} experienceId
 * @param {string} monthIso 'YYYY-MM'
 * @returns {{ loading: boolean, days: Record<string, {date: string, bookable: boolean, times: {time: string, seats: number}[]}> | null, error: Error | null }}
 */
export function useAvailability(experienceId, monthIso) {
  const [state, setState] = useState(
    /** @type {{ loading: boolean, days: Record<string, any> | null, error: Error | null }} */ (
      { loading: true, days: null, error: null }
    ),
  );

  useEffect(() => {
    if (!experienceId || !monthIso) return undefined;
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    const [year, month] = monthIso.split('-').map(Number);
    fetchMonthAvailability(experienceId, year, month)
      .then((result) => {
        if (active) setState({ loading: false, days: result.days, error: null });
      })
      .catch((error) => {
        if (active) setState({ loading: false, days: null, error });
      });
    return () => {
      active = false;
    };
  }, [experienceId, monthIso]);

  return state;
}
