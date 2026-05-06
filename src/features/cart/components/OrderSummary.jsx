import { Link as RouterLink } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import CouponInput from './CouponInput.jsx';
import { formatCurrency } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';
import styles from './OrderSummary.module.css';

const FREE_SHIPPING_THRESHOLD = 500;

function OrderSummary({
  subtotal,
  discount,
  tax,
  total,
  currency,
  itemCount,
  couponCode,
  cartItems,
  onApplyCoupon,
  onClearCoupon,
  disabled = false,
}) {
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const qualifiesForFreeShipping = remainingForFreeShipping <= 0 && subtotal > 0;

  return (
    <aside className={styles.root} aria-label="Order summary">
      <h2 className={styles.title}>Order summary</h2>

      <CouponInput
        couponCode={couponCode}
        subtotal={subtotal}
        items={cartItems}
        onApply={onApplyCoupon}
        onClear={onClearCoupon}
      />

      <dl className={styles.lines}>
        <div className={styles.line}>
          <dt>Subtotal</dt>
          <dd>{formatCurrency(subtotal, currency)}</dd>
        </div>
        {discount > 0 ? (
          <div className={styles.line}>
            <dt>Discount</dt>
            <dd className={styles.discount}>
              −{formatCurrency(discount, currency)}
            </dd>
          </div>
        ) : null}
        {tax > 0 ? (
          <div className={styles.line}>
            <dt>Tax</dt>
            <dd>{formatCurrency(tax, currency)}</dd>
          </div>
        ) : null}
        <div className={`${styles.line} ${styles.totalLine}`}>
          <dt>Estimated total</dt>
          <dd>{formatCurrency(total, currency)}</dd>
        </div>
      </dl>

      <p
        className={[
          styles.shippingHint,
          qualifiesForFreeShipping ? styles.shippingHintMet : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {qualifiesForFreeShipping
          ? 'You qualify for free shipping.'
          : `Free shipping on orders over ${formatCurrency(
              FREE_SHIPPING_THRESHOLD,
              currency,
            )}.`}
      </p>

      <AppButton
        variant="primary"
        fullWidth
        to={PATHS.checkout}
        disabled={disabled || itemCount === 0}
        className={styles.checkoutButton}
      >
        Checkout
      </AppButton>

      <RouterLink to={PATHS.shop} className={styles.continueLink}>
        Continue shopping
      </RouterLink>

      <ul className={styles.trustStrip}>
        <li className={styles.trustItem}>
          <LockOutlinedIcon className={styles.trustIcon} aria-hidden="true" />
          <span>Secure payments</span>
        </li>
        <li className={styles.trustItem}>
          <LoopIcon className={styles.trustIcon} aria-hidden="true" />
          <span>Free returns within 14 days</span>
        </li>
        <li className={styles.trustItem}>
          <SupportAgentOutlinedIcon className={styles.trustIcon} aria-hidden="true" />
          <span>Lifetime studio support</span>
        </li>
      </ul>
    </aside>
  );
}

export default OrderSummary;
