import { useEffect, useRef, useState } from 'react';
import productService from '../../../api/services/productService.js';
import categoryService from '../../../api/services/categoryService.js';

const DEBOUNCE_MS = 250;

const isAbortError = (err) =>
  err?.name === 'CanceledError' ||
  err?.name === 'AbortError' ||
  err?.code === 'ERR_CANCELED';

/**
 * Live search suggestions for the global SearchOverlay.
 *
 * Debounces the query 250ms and aborts any in-flight request when the query
 * changes (or the consumer unmounts). Returns up to 5 product matches and 3
 * category matches for the current query.
 */
export function useSearchSuggestions(query) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const q = String(query || '').trim();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (!q) {
      setProducts([]);
      setCategories([]);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    setIsLoading(true);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      Promise.all([
        productService
          .list({ q, perPage: 5, page: 1 }, { signal: ctrl.signal })
          .catch((err) => {
            if (isAbortError(err)) return null;
            throw err;
          }),
        categoryService
          .list({ q, perPage: 3 })
          .catch(() => ({ items: [] })),
      ])
        .then(([productsResult, categoriesResult]) => {
          if (!mountedRef.current || ctrl.signal.aborted) return;
          if (productsResult) setProducts(productsResult.items ?? []);
          const all = categoriesResult?.items ?? [];
          const lower = q.toLowerCase();
          const filtered = all
            .filter((c) => c?.name?.toLowerCase?.().includes(lower))
            .slice(0, 3);
          setCategories(filtered);
          setIsLoading(false);
          setError(null);
        })
        .catch((err) => {
          if (isAbortError(err)) return;
          if (!mountedRef.current) return;
          setError(err);
          setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  return { products, categories, isLoading, error };
}

export default useSearchSuggestions;
