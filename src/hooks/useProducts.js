import { useEffect, useRef, useState } from 'react';
import productService from '../api/services/productService.js';

const SORT_TOKENS = {
  newest: '-createdAt',
  oldest: 'createdAt',
  bestselling: '-reviewCount',
  popular: '-rating',
  'price-asc': 'price',
  'price-desc': '-price',
};

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

const resolveParams = (params) => {
  const out = { ...(params || {}) };
  if (out.sort && SORT_TOKENS[out.sort]) {
    out.sort = SORT_TOKENS[out.sort];
  }
  return out;
};

export function useProducts(params = {}) {
  const resolved = resolveParams(params);
  const key = buildKey(resolved);
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
      promise = productService
        .list(resolved)
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

export default useProducts;
