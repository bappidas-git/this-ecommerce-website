import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminUserService } from '../../../api/services/admin/adminUserService.js';

export default function useAdminUsers() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async (silent = false) => {
    const id = ++requestIdRef.current;
    if (!silent) setIsLoading(true);
    try {
      const result = await adminUserService.list();
      if (id !== requestIdRef.current) return;
      setItems(Array.isArray(result?.items) ? result.items : []);
      setMeta(result?.meta || { total: 0 });
      setError(null);
    } catch (err) {
      if (id !== requestIdRef.current) return;
      setError(err);
    } finally {
      if (id === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const counts = useMemo(() => {
    const result = { admin: 0, manager: 0, viewer: 0, activeAdmins: 0 };
    for (const u of items) {
      if (u.role in result) result[u.role] += 1;
      if (u.role === 'admin' && !u.isDisabled) result.activeAdmins += 1;
    }
    return result;
  }, [items]);

  const invite = useCallback(
    async (payload) => {
      const result = await adminUserService.invite(payload);
      await refetch();
      return result;
    },
    [refetch],
  );

  const update = useCallback(
    async (id, payload) => {
      const next = await adminUserService.update(id, payload);
      setItems((prev) => prev.map((u) => (u.id === next.id ? next : u)));
      return next;
    },
    [],
  );

  const setDisabled = useCallback(async (id, isDisabled) => {
    const next = await adminUserService.setDisabled(id, isDisabled);
    setItems((prev) => prev.map((u) => (u.id === next.id ? next : u)));
    return next;
  }, []);

  const remove = useCallback(async (id) => {
    await adminUserService.remove(id);
    setItems((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return {
    items,
    meta,
    error,
    isLoading,
    counts,
    refetch,
    invite,
    update,
    setDisabled,
    remove,
  };
}
