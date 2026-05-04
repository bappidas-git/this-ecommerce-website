import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Defense-in-depth: clear any stale body scroll lock left by a drawer/modal
// that unmounted before its exit transition (and cleanup) could finish.
export default function ScrollLockGuard() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, [pathname, search]);

  return null;
}
