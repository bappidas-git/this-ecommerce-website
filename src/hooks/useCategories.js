import { useEffect, useRef, useState } from 'react';
import categoryService from '../api/services/categoryService.js';

const cache = {
  byKey: new Map(),
  inflight: new Map(),
};

const buildKey = (params) => {
  const entries = Object.entries(params || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
};

export function useCategories(params = {}) {
  const key = buildKey(params);
  const cached = cache.byKey.get(key);

  const [items, setItems] = useState(cached?.items ?? []);
  const [meta, setMeta] = useState(cached?.meta ?? {});
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const hit = cache.byKey.get(key);
    if (hit) {
      setItems(hit.items);
      setMeta(hit.meta);
      setIsLoading(false);
      setError(null);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    setError(null);

    let promise = cache.inflight.get(key);
    if (!promise) {
      promise = categoryService
        .list(params)
        .then((result) => {
          cache.byKey.set(key, result);
          return result;
        })
        .finally(() => {
          cache.inflight.delete(key);
        });
      cache.inflight.set(key, promise);
    }

    promise
      .then((result) => {
        if (!active || !mounted.current) return;
        setItems(result.items ?? []);
        setMeta(result.meta ?? {});
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active || !mounted.current) return;
        setError(err);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [key]);

  return { items, meta, isLoading, error };
}

export default useCategories;
