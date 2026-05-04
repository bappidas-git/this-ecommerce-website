import { useEffect, useRef, useState } from 'react';
import orderService from '../../../api/services/orderService.js';

const isAbortError = (err) =>
  err?.name === 'CanceledError' ||
  err?.name === 'AbortError' ||
  err?.code === 'ERR_CANCELED' ||
  err?.original?.name === 'CanceledError' ||
  err?.original?.code === 'ERR_CANCELED';

export default function useOrders(params) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reqIdRef = useRef(0);

  const key = JSON.stringify(params || {});

  useEffect(() => {
    const ctrl = new AbortController();
    const reqId = ++reqIdRef.current;
    setIsLoading(true);
    setError(null);

    orderService
      .list(params, { signal: ctrl.signal })
      .then((result) => {
        if (reqId !== reqIdRef.current) return;
        setItems(Array.isArray(result?.items) ? result.items : []);
        setMeta(result?.meta || {});
        setIsLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        if (reqId !== reqIdRef.current) return;
        setError(err);
        setIsLoading(false);
      });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { items, meta, isLoading, error };
}
