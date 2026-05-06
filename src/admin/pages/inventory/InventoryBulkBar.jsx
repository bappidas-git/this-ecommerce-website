import { motion, AnimatePresence } from 'framer-motion';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';

import styles from './InventoryBulkBar.module.css';

function InventoryBulkBar({ count, isSaving, onSaveAll, onDiscard }) {
  const visible = Number(count) > 0;

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="bulk-bar"
          className={styles.root}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.2, 0.6, 0.2, 1] }}
          role="status"
          aria-live="polite"
        >
          <span className={styles.label}>
            <strong>{count}</strong>
            {count === 1 ? ' unsaved change' : ' unsaved changes'}
          </span>
          <div className={styles.actions}>
            <AppButton
              variant="ghost"
              size="small"
              icon={<RestartAltRoundedIcon fontSize="small" />}
              onClick={onDiscard}
              disabled={isSaving}
              className={styles.ghostBtn}
            >
              Discard
            </AppButton>
            <AppButton
              variant="primary"
              size="small"
              icon={<SaveRoundedIcon fontSize="small" />}
              onClick={onSaveAll}
              loading={isSaving}
              className={styles.primaryBtn}
            >
              Save all
            </AppButton>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default InventoryBulkBar;
