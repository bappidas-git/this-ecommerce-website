import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useCart } from '../../../context/CartContext.jsx';
import { formatCurrency } from '../../../utils/format.js';
import OrderSummaryAside from './OrderSummaryAside.jsx';
import styles from './MobileOrderBar.module.css';

function MobileOrderBar({ continueLabel = 'Continue', onContinue, disabled }) {
  const { state } = useCart();
  const [open, setOpen] = useState(false);
  const currency = state.items[0]?.currency || 'AED';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {open ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close summary"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={`${styles.sheet} ${open ? styles.sheetOpen : ''}`}
        role="dialog"
        aria-label="Order summary"
        aria-hidden={!open}
      >
        <div className={styles.handle} aria-hidden />
        <OrderSummaryAside variant="sheet" />
      </div>

      <div className={styles.bar} role="region" aria-label="Order total">
        <button
          type="button"
          className={styles.totalButton}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="checkout-mobile-summary"
        >
          <span className={styles.totalLabel}>Order total</span>
          <span className={styles.totalValue}>
            {formatCurrency(state.total, currency)}
          </span>
          <ChevronUp
            size={16}
            aria-hidden
            className={`${styles.chev} ${open ? styles.chevOpen : ''}`}
          />
        </button>
        {onContinue ? (
          <button
            type="button"
            className={styles.continue}
            onClick={onContinue}
            disabled={disabled}
          >
            {continueLabel}
          </button>
        ) : null}
      </div>
    </>
  );
}

export default MobileOrderBar;
