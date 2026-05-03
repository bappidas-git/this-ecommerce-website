import { NavLink, Outlet } from 'react-router-dom';
import Section from '../common/Section.jsx';
import Container from '../common/Container.jsx';
import Eyebrow from '../common/Eyebrow.jsx';
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

function navClass({ isActive }) {
  return [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ');
}

function AccountLayout() {
  return (
    <Section tone="cream">
      <Container gutter>
        <div className={styles.head}>
          <Eyebrow color="brass">Your account</Eyebrow>
          <h1 className={styles.heading}>Account</h1>
        </div>
        <div className={styles.grid}>
          <aside className={styles.sidebar} aria-label="Account navigation">
            <nav className={styles.nav}>
              {ACCOUNT_LINKS.map((item) => (
                <NavLink key={item.to} to={item.to} className={navClass} end>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className={styles.content}>
            <Outlet />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default AccountLayout;
