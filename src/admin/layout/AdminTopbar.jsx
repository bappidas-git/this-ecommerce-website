import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import {
  Menu as MenuIcon,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  LogOut,
  UserCircle2,
} from 'lucide-react';

import { PATHS } from '../../routes/paths.js';
import { useAdminUI } from '../context/AdminUIContext.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import styles from './AdminTopbar.module.css';

const ROLE_LABEL = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};

function getInitials(name) {
  if (!name) return 'TI';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TI';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || 'TI';
}

function avatarUrl(name) {
  const initials = encodeURIComponent(getInitials(name));
  return `https://placehold.co/64x64/B8924F/F7F3ED?text=${initials}&font=inter`;
}

function Breadcrumbs({ items }) {
  if (!items?.length) return null;
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <Fragment key={`${item.label}-${idx}`}>
              <li className={styles.breadcrumbItem}>
                {isLast || !item.to ? (
                  <span
                    className={[
                      styles.breadcrumbText,
                      isLast ? styles.breadcrumbCurrent : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.to} className={styles.breadcrumbLink}>
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className={styles.breadcrumbSep}>
                  <ChevronRight size={14} strokeWidth={1.75} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

function NotificationBell() {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        className={styles.iconBtn}
        aria-label="Notifications"
        size="small"
      >
        <Bell size={18} strokeWidth={1.75} />
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: styles.popover } }}
      >
        <div className={styles.popoverInner}>
          <p className={styles.popoverTitle}>Notifications</p>
          <p className={styles.popoverEmpty}>All caught up.</p>
        </div>
      </Popover>
    </>
  );
}

function SearchInput() {
  return (
    <div className={styles.search}>
      <Search size={16} strokeWidth={1.75} aria-hidden="true" />
      <InputBase
        placeholder="Search admin…"
        className={styles.searchInput}
        inputProps={{ 'aria-label': 'Search admin' }}
        // future: open command palette
      />
      <span className={styles.searchKbd} aria-hidden="true">⌘K</span>
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const name = user?.name || user?.email || 'Admin';
  const role = user?.role || 'viewer';

  async function handleSignOut() {
    setAnchor(null);
    try {
      await logout();
    } finally {
      navigate(PATHS.admin.login, { replace: true });
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.userBtn}
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img
          src={avatarUrl(name)}
          alt=""
          className={styles.avatar}
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
        />
        <span className={styles.userMeta}>
          <span className={styles.userName}>{name}</span>
          <span className={styles.rolePill}>{ROLE_LABEL[role] ?? role}</span>
        </span>
        <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <Menu
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: styles.userMenu } }}
        MenuListProps={{ dense: true }}
      >
        <div className={styles.userMenuHeader}>
          <span className={styles.userMenuName}>{name}</span>
          {user?.email && (
            <span className={styles.userMenuEmail}>{user.email}</span>
          )}
        </div>
        <Divider className={styles.menuDivider} />
        <MenuItem onClick={() => setAnchor(null)} className={styles.menuItem}>
          <UserCircle2 size={16} strokeWidth={1.75} />
          <span>Profile</span>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            window.open(PATHS.home, '_blank', 'noopener,noreferrer');
          }}
          className={styles.menuItem}
        >
          <ExternalLink size={16} strokeWidth={1.75} />
          <span>Switch to storefront</span>
        </MenuItem>
        <Divider className={styles.menuDivider} />
        <MenuItem onClick={handleSignOut} className={styles.menuItem}>
          <LogOut size={16} strokeWidth={1.75} />
          <span>Sign out</span>
        </MenuItem>
      </Menu>
    </>
  );
}

function AdminTopbar() {
  const { breadcrumbs, openMobileSidebar } = useAdminUI();
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 4);
        ticking.current = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[styles.topbar, scrolled ? styles.topbarScrolled : '']
        .filter(Boolean)
        .join(' ')}
      role="banner"
    >
      <div className={styles.left}>
        <IconButton
          onClick={openMobileSidebar}
          aria-label="Open navigation"
          className={[styles.iconBtn, styles.hamburger].join(' ')}
          size="small"
        >
          <MenuIcon size={20} strokeWidth={1.75} />
        </IconButton>
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className={styles.right}>
        <div className={styles.searchSlot}>
          <SearchInput />
        </div>
        <NotificationBell />
        <span className={styles.divider} aria-hidden="true" />
        <UserMenu />
      </div>
    </header>
  );
}

export default AdminTopbar;
