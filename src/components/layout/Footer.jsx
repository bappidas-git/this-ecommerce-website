import { Link } from 'react-router-dom';
import { PATHS } from '../../routes/paths.js';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <p className={styles.brand}>THIS Interiors</p>
          <p className={styles.tagline}>Considered objects for a calm Dubai home.</p>
        </div>
        <nav className={styles.linkCol} aria-label="Footer">
          <Link to={PATHS.about} className={styles.link}>
            About
          </Link>
          <Link to={PATHS.contact} className={styles.link}>
            Contact
          </Link>
          <Link to={PATHS.faq} className={styles.link}>
            FAQ
          </Link>
        </nav>
        <nav className={styles.linkCol} aria-label="Policies">
          <Link to={PATHS.shippingReturns} className={styles.link}>
            Shipping & Returns
          </Link>
          <Link to={PATHS.privacy} className={styles.link}>
            Privacy
          </Link>
          <Link to={PATHS.terms} className={styles.link}>
            Terms
          </Link>
        </nav>
      </div>
      <div className={styles.legal}>
        <span>&copy; {new Date().getFullYear()} THIS Interiors</span>
      </div>
    </footer>
  );
}

export default Footer;
