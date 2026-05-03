import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUI } from '../../../context/UIContext.jsx';
import useAuth from '../../../hooks/useAuth.js';
import categories from '../../../data/categories.js';
import styles from './MobileNavDrawer.module.css';

const PRIMARY_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/new-arrivals', label: 'New Arrivals' },
  { to: '/bestsellers', label: 'Bestsellers' },
  { to: '/story', label: 'Story' },
  { to: '/journal', label: 'Journal' },
];

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CloseIcon() {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SocialIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (name === 'instagram') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'pinterest') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M11 7.5c2.5-.5 5 1 5 3.5s-2 4-4 3.5L11 18" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M22 5.8a8.5 8.5 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.6 1A4.2 4.2 0 0 0 11.5 9a11.9 11.9 0 0 1-8.6-4.4 4.2 4.2 0 0 0 1.3 5.6 4.2 4.2 0 0 1-1.9-.5v.1a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 3.9 2.9A8.4 8.4 0 0 1 2 18.5 11.9 11.9 0 0 0 8.4 20c7.7 0 11.9-6.4 11.9-11.9v-.5A8.5 8.5 0 0 0 22 5.8z" />
    </svg>
  );
}

export default function MobileNavDrawer() {
  const { isMobileNavOpen, closeMobileNav } = useUI();
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const panelRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const t = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (isMobileNavOpen) closeMobileNav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  useEffect(() => {
    function onResize() {
      if (window.matchMedia('(min-width: 900px)').matches && isMobileNavOpen) {
        closeMobileNav();
      }
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMobileNavOpen, closeMobileNav]);

  useEffect(() => {
    if (!isMobileNavOpen) return undefined;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeMobileNav();
        return;
      }
      if (e.key !== 'Tab') return;

      const root = panelRef.current;
      if (!root) return;
      const focusable = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );
      if (focusable.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen, closeMobileNav]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchValue('');
    closeMobileNav();
  }

  function handleSignOut() {
    signOut();
    closeMobileNav();
    navigate('/');
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${isMobileNavOpen ? styles.backdropOpen : ''}`}
        onClick={closeMobileNav}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        id="mobile-nav-drawer"
        className={`${styles.panel} ${isMobileNavOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!isMobileNavOpen}
        tabIndex={-1}
        {...(!isMobileNavOpen && { inert: '' })}
      >
        <div className={styles.topBar}>
          <Link to="/" className={styles.wordmark}>
            THIS
          </Link>
          <button
            type="button"
            className={styles.iconButton}
            onClick={closeMobileNav}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.body}>
          <form className={styles.searchForm} onSubmit={handleSearchSubmit} role="search">
            <label className={styles.searchField}>
              <span className="visually-hidden" style={{ position: 'absolute', left: -9999 }}>
                Search
              </span>
              <SearchIcon className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="search"
                name="q"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search vases, candles, mirrors…"
                className={styles.searchInput}
                autoComplete="off"
              />
            </label>
          </form>

          <nav className={styles.section} aria-label="Primary">
            <ul className={styles.linkList}>
              {PRIMARY_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.section}>
            <p className={styles.eyebrow}>Browse</p>
            <button
              type="button"
              className={styles.accordionTrigger}
              aria-expanded={categoriesOpen}
              aria-controls="mobile-nav-categories"
              onClick={() => setCategoriesOpen((v) => !v)}
            >
              Browse by category
              <ChevronIcon
                className={`${styles.chevron} ${categoriesOpen ? styles.chevronOpen : ''}`}
              />
            </button>
            <div
              id="mobile-nav-categories"
              className={`${styles.accordionPanel} ${
                categoriesOpen ? styles.accordionPanelOpen : ''
              }`}
            >
              <ul className={styles.subList}>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/category/${c.slug}`} className={styles.subLink}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.accountBlock}>
            <p className={styles.eyebrow}>Account</p>
            {isAuthenticated ? (
              <>
                <p className={styles.userName}>{user?.name || 'Welcome back'}</p>
                <ul className={styles.linkList} style={{ marginTop: 8 }}>
                  <li>
                    <Link to="/account" className={styles.link}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/account/orders" className={styles.link}>
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/account/wishlist" className={styles.link}>
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <button type="button" className={styles.signOutBtn} onClick={handleSignOut}>
                      Sign out
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <div className={styles.accountActions}>
                <Link to="/login" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Sign in
                </Link>
                <Link to="/register" className={`${styles.btn} ${styles.btnGhost}`}>
                  Create account
                </Link>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <p className={styles.eyebrow} style={{ padding: 0 }}>
              Follow
            </p>
            <div className={styles.socialRow}>
              <a
                className={styles.socialLink}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <SocialIcon name="instagram" />
              </a>
              <a
                className={styles.socialLink}
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
              >
                <SocialIcon name="pinterest" />
              </a>
              <a
                className={styles.socialLink}
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <SocialIcon name="twitter" />
              </a>
            </div>
            <p className={styles.footerNote}>Designed in Dubai · EN · AED</p>
          </div>
        </div>
      </aside>
    </>
  );
}
