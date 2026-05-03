import { Link, Outlet } from 'react-router-dom';
import { Lock as LockIcon } from 'lucide-react';
import { PATHS } from '../../routes/paths.js';
import styles from './CheckoutLayout.module.css';

function CheckoutLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header} role="banner">
        <div className={styles.headerInner}>
          <Link to={PATHS.home} className={styles.brand} aria-label="THIS Interiors home">
            THIS Interiors
          </Link>
          <span className={styles.secure} aria-label="Secure checkout">
            <LockIcon size={14} aria-hidden />
            Secure checkout
          </span>
          <Link to={PATHS.cart} className={styles.back}>
            Back to cart
          </Link>
        </div>
      </header>
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer} role="contentinfo">
        <span>&copy; {new Date().getFullYear()} THIS Interiors</span>
        <span className={styles.dot} aria-hidden>
          &middot;
        </span>
        <Link to={PATHS.privacy} className={styles.footerLink}>
          Privacy
        </Link>
        <Link to={PATHS.terms} className={styles.footerLink}>
          Terms
        </Link>
      </footer>
    </div>
  );
}

export default CheckoutLayout;
