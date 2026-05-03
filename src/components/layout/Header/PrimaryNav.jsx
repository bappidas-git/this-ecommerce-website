import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PATHS } from '../../../routes/paths.js';
import MegaMenu from './MegaMenu.jsx';
import styles from './PrimaryNav.module.css';

const NAV_ITEMS = [
  { id: 'shop', label: 'Shop', to: PATHS.shop, hasMega: true },
  { id: 'new', label: 'New Arrivals', to: `${PATHS.shop}?sort=newest` },
  { id: 'best', label: 'Bestsellers', to: `${PATHS.shop}?sort=bestsellers` },
  { id: 'story', label: 'Story', to: PATHS.about },
  { id: 'journal', label: 'Journal', to: PATHS.faq },
];

function PrimaryNav() {
  const [openId, setOpenId] = useState(null);
  const location = useLocation();
  const wrapperRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    setOpenId(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!openId) return undefined;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpenId(null);
      }
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpenId(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openId]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const open = (id) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenId(id);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenId(null), 120);
  };

  const toggle = (id) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <nav
      className={styles.nav}
      aria-label="Primary"
      ref={wrapperRef}
      onMouseLeave={scheduleClose}
    >
      {NAV_ITEMS.map((item) => {
        if (item.hasMega) {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={styles.item}
              onMouseEnter={() => open(item.id)}
            >
              <button
                type="button"
                className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={`mega-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                {item.label}
              </button>
              <AnimatePresence>
                {isOpen ? (
                  <MegaMenu
                    menuId={`mega-${item.id}`}
                    onClose={() => setOpenId(null)}
                    onMouseEnter={() => open(item.id)}
                    onMouseLeave={scheduleClose}
                  />
                ) : null}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <div key={item.id} className={styles.item}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
              end={item.to === PATHS.home}
            >
              {item.label}
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
}

export default PrimaryNav;
