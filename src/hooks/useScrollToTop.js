import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll the window to the top whenever the pathname changes.
 *
 * - Skips when the navigation includes a hash (so in-page anchors work).
 * - Skips the initial mount (preserves browser-restored scroll position).
 * - Respects `prefers-reduced-motion` by using `behavior: 'auto'` there.
 */
export default function useScrollToTop() {
  const { pathname, hash } = useLocation();
  const lastPathnameRef = useRef(pathname);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;

    if (hash) return;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
}
