import { useEffect, useRef, useState } from 'react';
import productService from '../../../api/services/productService.js';

const isAbortError = (err) =>
  err?.name === 'CanceledError' ||
  err?.name === 'AbortError' ||
  err?.code === 'ERR_CANCELED';

let cachedItems = null;

export function useOnSaleRail({ enabled = true, limit = 4 } = {}) {
  const [items, setItems] = useState(cachedItems ?? []);
  const [isLoading, setIsLoading] = useState(!cachedItems && enabled);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    if (cachedItems) {
      setItems(cachedItems);
      setIsLoading(false);
      return undefined;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsLoading(true);
    productService
      .list({ onSale: true, perPage: limit, page: 1 }, { signal: ctrl.signal })
      .then((result) => {
        cachedItems = result.items ?? [];
        setItems(cachedItems);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setIsLoading(false);
      });
    return () => ctrl.abort();
  }, [enabled, limit]);

  return { items, isLoading };
}

export default useOnSaleRail;
