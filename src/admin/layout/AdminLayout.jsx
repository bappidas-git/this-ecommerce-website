import { NavLink, Outlet, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme } from '../../theme/index.js';
import { PATHS } from '../../routes/paths.js';
import styles from './AdminLayout.module.css';

const ADMIN_NAV = [
  { to: PATHS.admin.dashboard, label: 'Dashboard', end: true },
  { to: PATHS.admin.products, label: 'Products' },
  { to: PATHS.admin.categories, label: 'Categories' },
  { to: PATHS.admin.inventory, label: 'Inventory' },
  { to: PATHS.admin.orders, label: 'Orders' },
  { to: PATHS.admin.customers, label: 'Customers' },
  { to: PATHS.admin.reviews, label: 'Reviews' },
  { to: PATHS.admin.coupons, label: 'Coupons' },
  { to: PATHS.admin.reports, label: 'Reports' },
  { to: PATHS.admin.users, label: 'Users' },
  { to: PATHS.admin.settings, label: 'Settings' },
];

function navClass({ isActive }) {
  return [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ');
}

function AdminLayout() {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="Admin navigation">
          <Link to={PATHS.admin.root} className={styles.brand}>
            THIS Admin
          </Link>
          <nav className={styles.nav}>
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className={styles.body}>
          <header className={styles.topbar} role="banner">
            <span className={styles.topbarTitle}>Admin</span>
            <div className={styles.topbarActions}>
              <Link to={PATHS.home} className={styles.topbarLink}>
                View site
              </Link>
            </div>
          </header>
          <main id="main" className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default AdminLayout;
