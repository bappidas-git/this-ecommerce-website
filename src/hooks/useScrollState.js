import { useEffect, useRef, useState } from 'react';

export function useScrollState() {
  const [state, setState] = useState({ y: 0, dir: 'up' });
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset || 0;
        const delta = y - lastY.current;
        const dir = Math.abs(delta) < 2 ? state.dir : delta > 0 ? 'down' : 'up';
        lastY.current = y;
        setState((prev) => (prev.y === y && prev.dir === dir ? prev : { y, dir }));
        ticking.current = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

export default useScrollState;
