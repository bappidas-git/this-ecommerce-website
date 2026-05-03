import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QuantityStepper from '../../../components/common/QuantityStepper/QuantityStepper.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import { formatCurrency } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';
import styles from './CartItemsTable.module.css';

const UNDO_WINDOW_MS = 4000;

function CartItemRow({ item, onUpdateQty, onRemove, onMoveToWishlist }) {
  const [pendingRemoval, setPendingRemoval] = useState(false);
  const removalTimer = useRef(null);

  useEffect(
    () => () => {
      if (removalTimer.current) clearTimeout(removalTimer.current);
    },
    [],
  );

  const handleRemoveClick = (event) => {
    event.preventDefault();
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

  const handleMoveToWishlistClick = (event) => {
    event.preventDefault();
    onMoveToWishlist?.(item);
  };

  const productHref = item.slug ? PATHS.product(item.slug) : '#';
  const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);

  return (
    <motion.li
      className={styles.row}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <RouterLink
        to={productHref}
        className={styles.imageLink}
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
      </RouterLink>

      <div className={styles.info}>
        <RouterLink to={productHref} className={styles.name}>
          {item.name}
        </RouterLink>
        {item.attributes ? (
          <p className={styles.attributes}>{item.attributes}</p>
        ) : null}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionLink}
            onClick={handleMoveToWishlistClick}
          >
            Move to wishlist
          </button>
          <span className={styles.actionDivider} aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            className={styles.actionLink}
            onClick={handleRemoveClick}
          >
            Remove
          </button>
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
                Undo
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className={styles.quantity}>
        <QuantityStepper
          value={item.qty}
          min={1}
          max={typeof item.stock === 'number' ? item.stock : undefined}
          size="small"
          onChange={(next) => onUpdateQty?.(item.productId, next)}
          ariaLabel={`Quantity for ${item.name}`}
        />
      </div>

      <div className={styles.price}>
        <span className={styles.lineTotal}>
          {formatCurrency(lineTotal, item.currency)}
        </span>
        <span className={styles.unitPrice}>
          {formatCurrency(item.price, item.currency)} each
        </span>
      </div>
    </motion.li>
  );
}

function CartItemsTable({ items, onUpdateQty, onRemove, onMoveToWishlist }) {
  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <EmptyState
          title="Your bag is empty."
          description="Begin with a piece you'll keep for years."
          cta={
            <AppButton variant="primary" to={PATHS.shop}>
              Browse the collection
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <div className={styles.headerRow} aria-hidden="true">
        <span className={styles.colItem}>Item</span>
        <span className={styles.colQty}>Quantity</span>
        <span className={styles.colPrice}>Total</span>
      </div>
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              onUpdateQty={onUpdateQty}
              onRemove={onRemove}
              onMoveToWishlist={onMoveToWishlist}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export default CartItemsTable;
