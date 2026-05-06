import { AnimatePresence, motion } from 'framer-motion';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import useOnlineStatus from '../../hooks/useOnlineStatus.js';
import styles from './OfflineBanner.module.css';

function OfflineBanner() {
  const { online } = useOnlineStatus();

  return (
    <AnimatePresence initial={false}>
      {!online ? (
        <motion.div
          key="offline-banner"
          className={styles.banner}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.2, 0.6, 0.2, 1] }}
        >
          <WifiOffOutlinedIcon className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>
            You&rsquo;re offline. Some actions may not work.
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default OfflineBanner;
