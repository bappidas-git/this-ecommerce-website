import { useCallback, useMemo, useState } from 'react';
import { matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Container from '../common/Container.jsx';
import Eyebrow from '../common/Eyebrow.jsx';
import AppButton from '../common/AppButton/AppButton.jsx';
import AccountSidebar from './AccountSidebar.jsx';
import AccountTabs from './AccountTabs.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { queueToast } from '../../utils/toastQueue.js';
import { PATHS } from '../../routes/paths.js';
import styles from './AccountLayout.module.css';

const ACCOUNT_LINKS = [
  { to: PATHS.account.profile, label: 'Profile' },
  { to: PATHS.account.orders, label: 'Orders' },
  { to: PATHS.account.addresses, label: 'Addresses' },
  { to: PATHS.account.wishlist, label: 'Wishlist' },
  { to: PATHS.account.password, label: 'Password' },
  { to: PATHS.account.preferences, label: 'Preferences' },
];

const SECTION_TITLES = {
  [PATHS.account.profile]: 'Profile',
  [PATHS.account.orders]: 'Orders',
  [PATHS.account.addresses]: 'Addresses',
  [PATHS.account.wishlist]: 'Wishlist',
  [PATHS.account.password]: 'Password',
  [PATHS.account.preferences]: 'Preferences',
};

const ORDER_DETAIL_PATTERN = '/account/orders/:id';

function deriveDefaultTitle(pathname) {
  if (matchPath(ORDER_DETAIL_PATTERN, pathname)) return 'Order details';
  return SECTION_TITLES[pathname] || 'Account';
}

function formatMemberSince(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [override, setOverride] = useState(null);

  const setSection = useCallback((next) => {
    setOverride(next ? { ...next } : null);
  }, []);

  const outletContext = useMemo(() => ({ setSection }), [setSection]);

  const firstName = user?.firstName || user?.first_name || 'there';
  const memberSince = formatMemberSince(user?.createdAt || user?.created_at);
  const defaultTitle = deriveDefaultTitle(location.pathname);
  const title = override?.title || defaultTitle;
  const descriptor = override?.descriptor || null;

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      queueToast({ variant: 'info', message: "You've signed out" });
      navigate(PATHS.home);
    }
  }, [logout, navigate]);

  return (
    <div className={styles.shell}>
      <Container maxWidth="lg" gutter>
        <header className={styles.greeting}>
          <div className={styles.greetingText}>
            <h1 className={styles.welcome}>
              Welcome, <span className={styles.welcomeName}>{firstName}</span>
            </h1>
            {memberSince ? (
              <p className={styles.memberSince}>Member since {memberSince}</p>
            ) : null}
          </div>
          <div className={styles.greetingActions}>
            <AppButton
              variant="ghost"
              size="small"
              onClick={handleSignOut}
              className={styles.signOut}
            >
              Sign out
            </AppButton>
          </div>
        </header>

        <div className={styles.mobileTabs}>
          <AccountTabs links={ACCOUNT_LINKS} />
        </div>

        <div className={styles.grid}>
          <div className={styles.sidebarCol}>
            <AccountSidebar links={ACCOUNT_LINKS} />
          </div>

          <section className={styles.contentCol} aria-labelledby="account-section-title">
            <div className={styles.content}>
              <header className={styles.sectionHead}>
                <Eyebrow color="muted">My account</Eyebrow>
                <h2 id="account-section-title" className={styles.sectionTitle}>
                  {title}
                </h2>
                {descriptor ? <p className={styles.descriptor}>{descriptor}</p> : null}
              </header>
              <div className={styles.outlet}>
                <Outlet context={outletContext} />
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

export default AccountLayout;
