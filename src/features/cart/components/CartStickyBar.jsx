import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import { formatCurrency } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';
import styles from './CartStickyBar.module.css';

function CartStickyBar({ summaryRef, total, currency, itemCount }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = summaryRef?.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show when the summary card has scrolled past the viewport.
        const passedSummary =
          !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        setVisible(passedSummary);
      },
      { threshold: 0, rootMargin: '0px 0px 0px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [summaryRef]);

  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={styles.bar}
          role="region"
          aria-label="Cart summary"
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.totalCol}>
            <span className={styles.label}>Total</span>
            <span className={styles.value}>
              {formatCurrency(total, currency)}
            </span>
          </div>
          <AppButton
            variant="primary"
            to={PATHS.checkout}
            className={styles.checkoutButton}
          >
            Checkout
          </AppButton>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CartStickyBar;
