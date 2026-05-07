import { useEffect, useState } from 'react';
import styles from './ResponsiveBadge.module.css';

const BREAKPOINTS = [
  { label: 'xs', max: 359 },
  { label: 'sm', max: 599 },
  { label: 'md', max: 899 },
  { label: 'lg', max: 1199 },
  { label: 'xl', max: 1535 },
  { label: '2xl', max: Infinity },
];

function labelFor(width) {
  return BREAKPOINTS.find((bp) => width <= bp.max)?.label || 'xs';
}

function ResponsiveBadge() {
  const [size, setSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 0,
    h: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div
      className={styles.badge}
      role="status"
      aria-live="off"
      aria-label={`Viewport ${size.w} by ${size.h}`}
      data-testid="responsive-badge"
    >
      <span className={styles.dot} aria-hidden="true" />
      <span>{labelFor(size.w)}</span>
      <span className={styles.size}>
        {size.w}×{size.h}
      </span>
    </div>
  );
}

export default ResponsiveBadge;
