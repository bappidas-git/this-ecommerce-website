import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';

import styles from './ProductsBulkBar.module.css';

function ProductsBulkBar({
  count,
  canWrite,
  categories = [],
  onArchive,
  onUnarchive,
  onSetCategory,
  onDelete,
  onClear,
}) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          className={styles.root}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0.6, 0.2, 1] }}
          role="region"
          aria-label="Bulk actions"
        >
          <div className={styles.left}>
            <span className={styles.count}>{count} selected</span>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={onClear}
              aria-label="Clear selection"
            >
              Clear
            </button>
          </div>

          <div className={styles.actions}>
            {canWrite ? (
              <>
                <AppButton
                  variant="ghost"
                  size="small"
                  icon={<ArchiveRoundedIcon fontSize="small" />}
                  onClick={onArchive}
                >
                  Archive
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="small"
                  icon={<UnarchiveRoundedIcon fontSize="small" />}
                  onClick={onUnarchive}
                >
                  Unarchive
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="small"
                  icon={<CategoryRoundedIcon fontSize="small" />}
                  onClick={(e) => setAnchor(e.currentTarget)}
                >
                  Set category…
                </AppButton>
                <Menu
                  anchorEl={anchor}
                  open={open}
                  onClose={() => setAnchor(null)}
                  MenuListProps={{ dense: true }}
                >
                  {categories.length === 0 ? (
                    <MenuItem disabled>No categories</MenuItem>
                  ) : (
                    categories.map((c) => (
                      <MenuItem
                        key={c.id}
                        onClick={() => {
                          setAnchor(null);
                          onSetCategory?.(c.id);
                        }}
                      >
                        {c.name}
                      </MenuItem>
                    ))
                  )}
                </Menu>
                <AppButton
                  variant="danger"
                  size="small"
                  icon={<DeleteOutlineRoundedIcon fontSize="small" />}
                  onClick={onDelete}
                >
                  Delete
                </AppButton>
              </>
            ) : (
              <span className={styles.viewerHint}>
                Read-only access — destructive actions are disabled.
              </span>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ProductsBulkBar;
