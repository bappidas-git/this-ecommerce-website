import { forwardRef, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PATHS } from '../../../routes/paths.js';
import styles from './MegaMenu.module.css';

const CATEGORIES = [
  { slug: 'vases', name: 'Vases' },
  { slug: 'lamps', name: 'Lamps' },
  { slug: 'cushions-throws', name: 'Cushions & Throws' },
  { slug: 'wall-art', name: 'Wall Art' },
  { slug: 'mirrors', name: 'Mirrors' },
  { slug: 'candles-diffusers', name: 'Candles & Diffusers' },
  { slug: 'planters', name: 'Planters' },
  { slug: 'table-accessories', name: 'Table Accessories' },
];

const EDITS = [
  { label: 'New arrivals', to: `${PATHS.shop}?sort=newest` },
  { label: 'Bestsellers', to: `${PATHS.shop}?sort=bestsellers` },
  { label: 'On sale', to: `${PATHS.shop}?on_sale=true` },
  { label: 'Limited editions', to: `${PATHS.shop}?tag=limited` },
];

const FEATURE_IMAGE =
  'https://placehold.co/720x540/E5DED2/1B1A17?text=Editor%27s+Edit&font=playfair';

const MegaMenu = forwardRef(function MegaMenu(
  { onClose, menuId, onMouseEnter, onMouseLeave },
  ref,
) {
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const focusable = node.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length) {
      focusable[0].focus({ preventScroll: true });
    }

    const handleKey = (event) => {
      if (event.key !== 'Tab') return;
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener('keydown', handleKey);
    return () => node.removeEventListener('keydown', handleKey);
  }, []);

  const setRefs = (node) => {
    containerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const handleNav = () => {
    if (onClose) onClose();
  };

  return (
    <motion.div
      id={menuId}
      ref={setRefs}
      className={styles.panel}
      role="menu"
      aria-label="Shop menu"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: [0.2, 0.6, 0.2, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.inner}>
        <div className={styles.column}>
          <p className={styles.heading}>Browse by category</p>
          <ul className={styles.list}>
            {CATEGORIES.map((cat) => (
              <li key={cat.slug} className={styles.item} role="none">
                <Link
                  to={PATHS.category(cat.slug)}
                  className={styles.link}
                  role="menuitem"
                  onClick={handleNav}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.column}>
          <p className={styles.heading}>Curated edits</p>
          <ul className={styles.listSingle}>
            {EDITS.map((edit) => (
              <li key={edit.label} className={styles.item} role="none">
                <Link
                  to={edit.to}
                  className={styles.link}
                  role="menuitem"
                  onClick={handleNav}
                >
                  {edit.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.column} ${styles.featureCardWrap}`}>
          <p className={styles.heading}>Editor&rsquo;s edit</p>
          <Link
            to={PATHS.shop}
            className={styles.featureCard}
            role="menuitem"
            onClick={handleNav}
          >
            <div
              className={styles.featureMedia}
              style={{ backgroundImage: `url(${FEATURE_IMAGE})` }}
              role="img"
              aria-label="Featured collection imagery"
            />
            <div className={styles.featureBody}>
              <span className={styles.featureEyebrow}>Spring 2026</span>
              <h3 className={styles.featureTitle}>Quiet objects, considered rooms.</h3>
              <span className={styles.featureCta}>Discover &rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
});

export default MegaMenu;
