import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import productService from '../api/services/productService.js';

// Map storefront sort tokens to the field/order strings the API understands.
// `featured` is intentionally absent — we omit the sort param and let the
// server fall back to its default ordering.
const SORT_TOKENS = {
  newest: '-createdAt',
  oldest: 'createdAt',
  bestselling: '-reviewCount',
  rating: '-rating',
  popular: '-rating',
  price_asc: 'price',
  price_desc: '-price',
  // Hyphenated aliases for backwards compatibility with older URLs.
  'price-asc': 'price',
  'price-desc': '-price',
};

const FILTER_DEBOUNCE_MS = 250;

const isEmpty = (v) =>
  v === null ||
  v === undefined ||
  v === '' ||
  (Array.isArray(v) && v.length === 0);

const buildKey = (params) => {
  const entries = Object.entries(params || {})
    .filter(([, v]) => !isEmpty(v))
    .map(([k, v]) => [k, Array.isArray(v) ? [...v].sort() : v])
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
};

const resolveParams = (params) => {
  const out = { ...(params || {}) };
  if (out.sort && SORT_TOKENS[out.sort]) {
    out.sort = SORT_TOKENS[out.sort];
  } else if (out.sort === 'featured') {
    delete out.sort;
  }
  return out;
};

const isAbortError = (err) =>
  err?.name === 'CanceledError' ||
  err?.name === 'AbortError' ||
  err?.code === 'ERR_CANCELED' ||
  err?.original?.name === 'CanceledError' ||
  err?.original?.code === 'ERR_CANCELED';

// Detect whether the only thing that changed between two param snapshots is
// `page` and/or `sort`. Those interactions skip the debounce so they feel
// snappy; everything else (e.g. typing in the search box, ticking a chip)
// goes through the 250ms debounce window.
const isOnlyPageOrSortChange = (prev, next) => {
  if (!prev) return false;
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const k of keys) {
    if (k === 'page' || k === 'sort') continue;
    if (JSON.stringify(prev[k]) !== JSON.stringify(next[k])) return false;
  }
  return JSON.stringify(prev) !== JSON.stringify(next);
};

const cache = new Map();

export function useProducts(params = {}) {
  const resolved = useMemo(() => resolveParams(params), [params]);
  const key = useMemo(() => buildKey(resolved), [resolved]);

  const cached = cache.get(key);

  const [items, setItems] = useState(cached?.items ?? []);
  const [meta, setMeta] = useState(cached?.meta ?? {});
  const [isLoading, setIsLoading] = useState(!cached);
  const [isFetching, setIsFetching] = useState(!cached);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const reqIdRef = useRef(0);
  const prevParamsRef = useRef(null);
  const resolvedRef = useRef(resolved);
  const keyRef = useRef(key);

  resolvedRef.current = resolved;
  keyRef.current = key;

  useEffect(
    () => () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const performFetch = useCallback((paramsForFetch, currentKey) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const reqId = ++reqIdRef.current;
    setIsFetching(true);
    setError(null);

    productService
      .list(paramsForFetch, { signal: ctrl.signal })
      .then((result) => {
        if (!mountedRef.current || reqId !== reqIdRef.current) return;
        cache.set(currentKey, result);
        setItems(result.items ?? []);
        setMeta(result.meta ?? {});
        setIsLoading(false);
        setIsFetching(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        if (!mountedRef.current || reqId !== reqIdRef.current) return;
        setError(err);
        setIsLoading(false);
        setIsFetching(false);
      });
  }, []);

  useEffect(() => {
    const currentResolved = resolvedRef.current;
    const hit = cache.get(key);
    if (hit) {
      setItems(hit.items ?? []);
      setMeta(hit.meta ?? {});
      setIsLoading(false);
      setIsFetching(false);
      setError(null);
      prevParamsRef.current = currentResolved;
      return undefined;
    }

    const skipDebounce =
      prevParamsRef.current === null ||
      isOnlyPageOrSortChange(prevParamsRef.current, currentResolved);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setIsFetching(true);

    if (skipDebounce) {
      performFetch(currentResolved, key);
    } else {
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        performFetch(resolvedRef.current, keyRef.current);
      }, FILTER_DEBOUNCE_MS);
    }

    prevParamsRef.current = currentResolved;

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [key, performFetch]);

  const refetch = useCallback(() => {
    cache.delete(keyRef.current);
    performFetch(resolvedRef.current, keyRef.current);
  }, [performFetch]);

  return {
    items,
    meta,
    isLoading,
    isFetching,
    isError: Boolean(error),
    error,
    refetch,
  };
}

export default useProducts;
