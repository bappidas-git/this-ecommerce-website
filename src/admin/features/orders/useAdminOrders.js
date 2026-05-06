import { useCallback, useEffect, useRef, useState } from 'react';
import { adminOrderService } from '../../../api/services/admin/adminOrderService.js';

export default function useAdminOrders(params) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 25, stats: null });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(
    async (silent = false) => {
      const id = ++requestIdRef.current;
      if (!silent) setIsLoading(true);
      try {
        const result = await adminOrderService.list(params);
        if (id !== requestIdRef.current) return;
        setItems(Array.isArray(result?.items) ? result.items : []);
        setMeta(result?.meta || { total: 0, page: 1, perPage: 25, stats: null });
        setError(null);
      } catch (err) {
        if (id !== requestIdRef.current) return;
        setError(err);
      } finally {
        if (id === requestIdRef.current) setIsLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [JSON.stringify(params)],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const patchLocal = useCallback((id, patch) => {
    setItems((prev) =>
      prev.map((row) =>
        String(row.id) === String(id) ? { ...row, ...patch } : row,
      ),
    );
  }, []);

  return {
    items,
    meta,
    error,
    isLoading,
    refetch,
    patchLocal,
  };
}
