import { useCallback, useEffect, useRef, useState } from 'react';
import { adminReportService } from '../../api/services/admin/adminReportService.js';

export default function useAdminDashboard({ start, end, lowStockThreshold = 5 }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!start || !end) return;
      const id = ++requestIdRef.current;
      if (!silent) setIsLoading(true);
      else setIsRefetching(true);
      try {
        const result = await adminReportService.dashboard({
          start,
          end,
          lowStockThreshold,
        });
        if (id !== requestIdRef.current) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (id !== requestIdRef.current) return;
        setError(err);
      } finally {
        if (id === requestIdRef.current) {
          setIsLoading(false);
          setIsRefetching(false);
        }
      }
    },
    [start, end, lowStockThreshold],
  );

  useEffect(() => {
    fetchData(Boolean(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, error, isLoading, isRefetching, refetch };
}
