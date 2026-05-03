import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../../../context/UIContext.jsx';
import styles from './Header.module.css';

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

export default function Header() {
  const { isMobileNavOpen, openMobileNav } = useUI();
  const hamburgerRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (wasOpenRef.current && !isMobileNavOpen) {
      hamburgerRef.current?.focus();
    }
    wasOpenRef.current = isMobileNavOpen;
  }, [isMobileNavOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            ref={hamburgerRef}
            type="button"
            className={`${styles.iconButton} ${styles.hamburger}`}
            onClick={openMobileNav}
            aria-label="Open navigation"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav-drawer"
          >
            <MenuIcon />
          </button>
        </div>
        <Link to="/" className={styles.wordmark}>
          THIS
        </Link>
        <div className={styles.right} />
      </div>
    </header>
  );
}
