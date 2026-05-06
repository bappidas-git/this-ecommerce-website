import { useEffect, useState } from 'react';
import axios from 'axios';
import { orderService } from '../api/services/index.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function useHasPurchased(productId) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState({
    isLoading: false,
    hasPurchased: false,
    isError: false,
  });

  useEffect(() => {
    if (!productId || !isAuthenticated) {
      setState({ isLoading: false, hasPurchased: false, isError: false });
      return undefined;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    orderService
      .hasPurchased({ productId }, { signal: controller.signal })
      .then((data) => {
        setState({
          isLoading: false,
          hasPurchased: Boolean(data?.hasPurchased),
          isError: false,
        });
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setState({ isLoading: false, hasPurchased: false, isError: true });
      });
    return () => controller.abort();
  }, [productId, isAuthenticated]);

  return state;
}
