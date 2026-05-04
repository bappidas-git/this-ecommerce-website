import { useEffect, useRef, useState } from 'react';
import productService from '../api/services/productService.js';

const cache = new Map();

const isAbortError = (err) =>
  err?.name === 'CanceledError' ||
  err?.name === 'AbortError' ||
  err?.code === 'ERR_CANCELED';

export function useProduct(slug) {
  const cached = slug ? cache.get(slug) : null;
  const [data, setData] = useState(cached || null);
  const [isLoading, setIsLoading] = useState(!cached && Boolean(slug));
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    const hit = cache.get(slug);
    if (hit) {
      setData(hit);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    productService
      .getBySlug(slug, { signal: controller.signal })
      .then((product) => {
        if (!mountedRef.current) return;
        cache.set(slug, product);
        setData(product);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        if (!mountedRef.current) return;
        setError(err);
        setData(null);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  const status = error?.response?.status ?? error?.status;
  // The service returns `null` for 404; treat any explicit-null payload as
  // not-found so the page can render the friendly state instead of crashing.
  const isNotFound = status === 404 || (!isLoading && !error && Boolean(slug) && data === null);

  return {
    data,
    isLoading,
    isError: Boolean(error),
    isNotFound,
    error,
  };
}

export default useProduct;
