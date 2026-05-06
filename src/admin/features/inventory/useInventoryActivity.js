import { useCallback, useEffect, useRef, useState } from 'react';
import { adminInventoryService } from '../../../api/services/admin/adminInventoryService.js';

export default function useInventoryActivity(params) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 25 });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async (silent = false) => {
    const id = ++requestIdRef.current;
    if (!silent) setIsLoading(true);
    try {
      const result = await adminInventoryService.activity(params);
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

  return { items, meta, error, isLoading, refetch };
}
