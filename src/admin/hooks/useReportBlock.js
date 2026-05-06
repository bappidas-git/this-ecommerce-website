import { useCallback, useEffect, useRef, useState } from 'react';
import {
  adminReportService,
  buildReportParams,
} from '../../api/services/admin/adminReportService.js';

/**
 * Fetches a single report block. When `comparePrevious` is true it also
 * pulls the prior-period dataset so the UI can render deltas/overlays.
 *
 * `name` must match a method on `adminReportService`
 * (salesOverTime, salesByCategory, topProducts, topCustomers,
 *  couponPerformance, inventoryTurnover).
 */
export default function useReportBlock({
  name,
  range,
  previousRange,
  comparePrevious = false,
  extraParams,
  enabled = true,
}) {
  const [data, setData] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetcher = adminReportService[name];

  const startKey = range?.start ? new Date(range.start).toISOString() : '';
  const endKey = range?.end ? new Date(range.end).toISOString() : '';
  const prevStartKey = previousRange?.start
    ? new Date(previousRange.start).toISOString()
    : '';
  const prevEndKey = previousRange?.end
    ? new Date(previousRange.end).toISOString()
    : '';
  const extraKey = extraParams ? JSON.stringify(extraParams) : '';

  const load = useCallback(async () => {
    if (!enabled || typeof fetcher !== 'function' || !range?.start || !range?.end) {
      return;
    }
    const id = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const baseParams = buildReportParams({
        start: range.start,
        end: range.end,
        comparePrevious,
        ...extraParams,
      });
      const currentPromise = fetcher(baseParams);

      const previousPromise =
        comparePrevious && previousRange?.start && previousRange?.end
          ? fetcher(
              buildReportParams({
                start: previousRange.start,
                end: previousRange.end,
                comparePrevious: false,
                ...extraParams,
              }),
            )
          : Promise.resolve(null);

      const [currentValue, previousValue] = await Promise.all([
        currentPromise,
        previousPromise.catch(() => null),
      ]);

      if (id !== requestIdRef.current) return;
      setData(currentValue ?? null);
      setPrevious(previousValue ?? null);
      setError(null);
    } catch (err) {
      if (id !== requestIdRef.current) return;
      setError(err);
    } finally {
      if (id === requestIdRef.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    name,
    enabled,
    startKey,
    endKey,
    prevStartKey,
    prevEndKey,
    comparePrevious,
    extraKey,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const refetch = useCallback(() => load(), [load]);

  return { data, previous, error, isLoading, refetch };
}
