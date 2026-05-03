import { Link } from 'react-router-dom';
import { PATHS } from '../../../routes/paths.js';
import styles from './Logo.module.css';

function Logo({ label = 'THIS Interiors' }) {
  return (
    <Link to={PATHS.home} className={styles.logo} aria-label={`${label} home`}>
      {label}
    </Link>
  );
}

export default Logo;
