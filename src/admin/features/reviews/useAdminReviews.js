import { useCallback, useEffect, useRef, useState } from 'react';
import { adminReviewService } from '../../../api/services/admin/adminReviewService.js';

export default function useAdminReviews(params) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 25, counts: {} });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(
    async (silent = false) => {
      const id = ++requestIdRef.current;
      if (!silent) setIsLoading(true);
      try {
        const result = await adminReviewService.list(params);
        if (id !== requestIdRef.current) return;
        setItems(Array.isArray(result?.items) ? result.items : []);
        setMeta(result?.meta || { total: 0, page: 1, perPage: 25, counts: {} });
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
      prev.map((r) => (Number(r.id) === Number(id) ? { ...r, ...patch } : r)),
    );
  }, []);

  const removeLocal = useCallback((ids) => {
    const set = new Set(ids.map((n) => Number(n)));
    setItems((prev) => prev.filter((r) => !set.has(Number(r.id))));
  }, []);

  const replaceLocal = useCallback((nextItems) => {
    setItems(nextItems);
  }, []);

  return {
    items,
    meta,
    error,
    isLoading,
    refetch,
    patchLocal,
    removeLocal,
    replaceLocal,
  };
}
