import { useCallback, useEffect, useRef, useState } from 'react';

const hasWindow = typeof window !== 'undefined';

function prefersReducedMotion() {
  if (!hasWindow || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useCarousel({ length = 0, autoplay = 0, paused = false } = {}) {
  const [index, setIndex] = useState(0);
  const lengthRef = useRef(length);

  useEffect(() => {
    lengthRef.current = length;
    if (length === 0) {
      setIndex(0);
      return;
    }
    setIndex((current) => (current >= length ? 0 : current));
  }, [length]);

  const set = useCallback((i) => {
    const total = lengthRef.current;
    if (!total) return;
    const next = ((i % total) + total) % total;
    setIndex(next);
  }, []);

  const next = useCallback(() => {
    const total = lengthRef.current;
    if (!total) return;
    setIndex((current) => (current + 1) % total);
  }, []);

  const prev = useCallback(() => {
    const total = lengthRef.current;
    if (!total) return;
    setIndex((current) => (current - 1 + total) % total);
  }, []);

  useEffect(() => {
    if (!autoplay || paused || length <= 1) return undefined;
    if (prefersReducedMotion()) return undefined;
    let rafId = 0;
    let last = performance.now();
    const tick = (now) => {
      if (now - last >= autoplay) {
        setIndex((current) => (current + 1) % lengthRef.current);
        last = now;
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [autoplay, paused, length]);

  return { index, set, next, prev };
}

export default useCarousel;
