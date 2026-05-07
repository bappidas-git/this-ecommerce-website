import { useEffect, useState } from 'react';

/**
 * Delays flipping a loading flag to `true` until `delay` ms have elapsed.
 * Prevents skeleton flashes for fast requests. Resolves immediately to `false`
 * when loading ends (so the UI does not linger on a stale skeleton).
 *
 * @param {boolean} isLoading
 * @param {number} delay milliseconds before showing the skeleton (default 120)
 * @returns {boolean}
 */
export default function useDeferredLoading(isLoading, delay = 120) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShow(false);
      return undefined;
    }
    const id = setTimeout(() => setShow(true), Math.max(0, delay));
    return () => clearTimeout(id);
  }, [isLoading, delay]);

  return show && isLoading;
}
