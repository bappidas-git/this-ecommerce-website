import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './AccountTabs.module.css';

function pillClass({ isActive }) {
  return [styles.pill, isActive ? styles.pillActive : ''].filter(Boolean).join(' ');
}

function AccountTabs({ links }) {
  const scrollerRef = useRef(null);
  const activeRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const node = activeRef.current;
    const scroller = scrollerRef.current;
    if (!node || !scroller) return;

    const nodeLeft = node.offsetLeft;
    const nodeRight = nodeLeft + node.offsetWidth;
    const viewLeft = scroller.scrollLeft;
    const viewRight = viewLeft + scroller.clientWidth;
    const margin = 16;

    if (nodeLeft < viewLeft + margin) {
      scroller.scrollTo({ left: Math.max(0, nodeLeft - margin), behavior: 'smooth' });
    } else if (nodeRight > viewRight - margin) {
      scroller.scrollTo({
        left: nodeRight - scroller.clientWidth + margin,
        behavior: 'smooth',
      });
    }
  }, [location.pathname]);

  return (
    <nav
      className={styles.tabs}
      aria-label="Account navigation"
      ref={scrollerRef}
    >
      <ul className={styles.list}>
        {links.map((item) => (
          <li key={item.to} className={styles.item}>
            <NavLink
              to={item.to}
              end
              className={pillClass}
              ref={(el) => {
                if (!el) return;
                if (location.pathname === item.to) {
                  activeRef.current = el;
                }
              }}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default AccountTabs;
