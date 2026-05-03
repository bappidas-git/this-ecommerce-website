import { Link } from 'react-router-dom';
import { PATHS } from '../../routes/paths.js';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link to={PATHS.home} className={styles.brand} aria-label="THIS Interiors home">
          THIS Interiors
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link to={PATHS.shop} className={styles.navLink}>
            Shop
          </Link>
          <Link to={PATHS.about} className={styles.navLink}>
            About
          </Link>
          <Link to={PATHS.contact} className={styles.navLink}>
            Contact
          </Link>
        </nav>
        <div className={styles.actions}>
          <Link to={PATHS.search} className={styles.action}>
            Search
          </Link>
          <Link to={PATHS.account.root} className={styles.action}>
            Account
          </Link>
          <Link to={PATHS.cart} className={styles.action}>
            Cart
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
