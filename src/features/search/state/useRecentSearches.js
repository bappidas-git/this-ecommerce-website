import { useCallback, useEffect, useState } from 'react';
import {
  RECENT_SEARCHES_KEY,
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from './recentSearches.js';

export function useRecentSearches() {
  const [items, setItems] = useState(() => getRecentSearches());

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key && event.key !== RECENT_SEARCHES_KEY) return;
      setItems(getRecentSearches());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((q) => {
    const next = addRecentSearch(q);
    setItems(next);
    return next;
  }, []);

  const clear = useCallback(() => {
    const next = clearRecentSearches();
    setItems(next);
    return next;
  }, []);

  return { items, add, clear };
}

export default useRecentSearches;
