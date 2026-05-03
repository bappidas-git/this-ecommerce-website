import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import QuantityStepper from '../../common/QuantityStepper/QuantityStepper.jsx';
import { formatCurrency } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';
import styles from './MiniCartLine.module.css';

const UNDO_WINDOW_MS = 4000;

function MiniCartLine({ item, onUpdateQty, onRemove, onNavigate }) {
  const [pendingRemoval, setPendingRemoval] = useState(false);
  const removalTimer = useRef(null);
  const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);

  useEffect(
    () => () => {
      if (removalTimer.current) clearTimeout(removalTimer.current);
    },
    [],
  );

  const handleRemoveClick = () => {
    setPendingRemoval(true);
    if (removalTimer.current) clearTimeout(removalTimer.current);
    removalTimer.current = setTimeout(() => {
      onRemove?.(item.productId);
      removalTimer.current = null;
    }, UNDO_WINDOW_MS);
  };

  const handleUndoClick = () => {
    if (removalTimer.current) {
      clearTimeout(removalTimer.current);
      removalTimer.current = null;
    }
    setPendingRemoval(false);
  };

  const productHref = item.slug ? PATHS.product(item.slug) : '#';

  return (
    <motion.li
      className={styles.root}
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <Link
        to={productHref}
        className={styles.imageLink}
        onClick={onNavigate}
        aria-label={item.name}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className={styles.image}
          />
        ) : (
          <span className={styles.imageFallback} aria-hidden="true">
            {item.name?.[0] || 'T'}
          </span>
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <Link
            to={productHref}
            className={styles.name}
            onClick={onNavigate}
          >
            {item.name}
          </Link>
          <span className={styles.price}>
            {formatCurrency(lineTotal, item.currency)}
          </span>
        </div>

        <div className={styles.bottomRow}>
          <QuantityStepper
            value={item.qty}
            min={1}
            max={typeof item.stock === 'number' ? item.stock : undefined}
            size="small"
            onChange={(next) => onUpdateQty?.(item.productId, next)}
            ariaLabel={`Quantity for ${item.name}`}
          />
          <IconButton
            type="button"
            size="small"
            aria-label={`Remove ${item.name}`}
            onClick={handleRemoveClick}
            className={styles.removeButton}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </div>

        <AnimatePresence initial={false}>
          {pendingRemoval ? (
            <motion.div
              key="undo"
              className={styles.undoBar}
              role="status"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={styles.undoText}>Removed.</span>
              <button
                type="button"
                className={styles.undoButton}
                onClick={handleUndoClick}
              >
                <UndoIcon fontSize="inherit" aria-hidden="true" />
                Undo
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

export default MiniCartLine;
