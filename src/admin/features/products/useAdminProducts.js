import { useCallback, useEffect, useRef, useState } from 'react';
import { adminProductService } from '../../../api/services/admin/adminProductService.js';

export default function useAdminProducts(params) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 25 });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async (silent = false) => {
    const id = ++requestIdRef.current;
    if (!silent) setIsLoading(true);
    try {
      const result = await adminProductService.list(params);
      if (id !== requestIdRef.current) return;
      setItems(Array.isArray(result?.items) ? result.items : []);
      setMeta(result?.meta || { total: 0, page: 1, perPage: 25 });
      setError(null);
    } catch (err) {
      if (id !== requestIdRef.current) return;
      setError(err);
    } finally {
      if (id === requestIdRef.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const removeLocal = useCallback((ids) => {
    const set = new Set(ids.map((id) => String(id)));
    setItems((prev) => prev.filter((p) => !set.has(String(p.id))));
  }, []);

  const restoreLocal = useCallback((rows) => {
    setItems((prev) => {
      const existing = new Set(prev.map((p) => String(p.id)));
      const additions = rows.filter((r) => !existing.has(String(r.id)));
      return [...additions, ...prev];
    });
  }, []);

  return {
    items,
    meta,
    error,
    isLoading,
    refetch,
    setItems,
    removeLocal,
    restoreLocal,
  };
}
