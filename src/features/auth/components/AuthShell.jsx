import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { PATHS } from '../../../routes/paths.js';
import styles from './AuthShell.module.css';

const DEFAULT_IMAGE =
  'https://placehold.co/1200x1600/1F4034/F7F3ED?text=THIS+Interiors&font=cormorant';

function AuthShell({
  imageSrc = DEFAULT_IMAGE,
  imageAlt = 'THIS Interiors editorial',
  children,
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.media} aria-hidden="true">
        <img src={imageSrc} alt={imageAlt} className={styles.mediaImg} />
      </aside>

      <motion.section
        className={styles.formColumn}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.2, 0.6, 0.2, 1] }}
      >
        <header className={styles.brand}>
          <Link to={PATHS.home} aria-label="THIS Interiors home" className={styles.brandLink}>
            THIS Interiors
          </Link>
        </header>

        <div className={styles.formInner}>
          <div className={styles.formInnerContent}>{children}</div>
        </div>

        <p className={styles.footnote}>Designed in Dubai • English</p>
      </motion.section>
    </div>
  );
}

export default AuthShell;
