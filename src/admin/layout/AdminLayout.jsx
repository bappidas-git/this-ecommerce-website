import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

import { adminTheme } from '../../theme/index.js';
import {
  AdminAuthProvider,
  useAdminAuth,
} from '../context/AdminAuthContext.jsx';
import { AdminUIProvider, useAdminUI } from '../context/AdminUIContext.jsx';
import useSessionExpiredHandler from '../../hooks/useSessionExpiredHandler.js';
import useScrollToTop from '../../hooks/useScrollToTop.js';

import ErrorBoundary from '../../components/common/ErrorBoundary.jsx';

import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';

import styles from './AdminLayout.module.css';
import '../styles/admin-overrides.css';

function AdminMinWidthNotice() {
  return (
    <div className="admin-min-width-gate" role="alert">
      <div className="admin-min-width-gate__card">
        <h1 className="admin-min-width-gate__title">Use a tablet or larger</h1>
        <p className="admin-min-width-gate__body">
          The THIS Interiors admin panel is designed for screens 900&nbsp;px and wider.
          Please rotate your device to landscape, or open the admin from a tablet or
          desktop browser.
        </p>
        <span className="admin-min-width-gate__hint">min‑width 900px</span>
      </div>
    </div>
  );
}

function AdminShell() {
  const adminAuth = useAdminAuth();
  const { isSidebarCollapsed, isMobileSidebarOpen, closeMobileSidebar } = useAdminUI();
  const location = useLocation();

  useSessionExpiredHandler({ scope: 'admin', logout: adminAuth?.logout });
  useScrollToTop();

  // Close mobile drawer on route change
  useEffect(() => {
    if (isMobileSidebarOpen) closeMobileSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <AdminMinWidthNotice />
      <div
        className={[
          styles.shell,
          styles.shellGated,
          isSidebarCollapsed ? styles.shellCollapsed : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <AdminSidebar />
        <div className={styles.body}>
          <AdminTopbar />
          <main id="main" className={styles.main}>
            <Container maxWidth="xl" className={styles.container}>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </Container>
          </main>
        </div>
      </div>
    </>
  );
}

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminUIProvider>
        <ThemeProvider theme={adminTheme}>
          <CssBaseline />
          <AdminShell />
        </ThemeProvider>
      </AdminUIProvider>
    </AdminAuthProvider>
  );
}

export default AdminLayout;
