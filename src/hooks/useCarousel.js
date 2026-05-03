import { useCallback, useEffect, useRef, useState } from 'react';

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
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % lengthRef.current);
    }, autoplay);
    return () => window.clearInterval(id);
  }, [autoplay, paused, length]);

  return { index, set, next, prev };
}

export default useCarousel;
