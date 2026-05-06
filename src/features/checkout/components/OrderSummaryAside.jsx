import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../../context/CartContext.jsx';
import CouponInput from '../../cart/components/CouponInput.jsx';
import { formatCurrency } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';
import styles from './OrderSummaryAside.module.css';

const PLACEHOLDER = 'https://placehold.co/112x144/E5DED2/4A453E?text=item';

function SummaryRow({ label, value, accent }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd className={accent ? styles.discount : ''}>{value}</dd>
    </div>
  );
}

function OrderSummaryAside({ variant = 'aside' }) {
  const { state, setCoupon, clearCoupon } = useCart();
  const { pathname } = useLocation();
  const isReview = pathname.includes('/review') || pathname.includes('/confirmation');
  const currency = state.items[0]?.currency || 'AED';

  return (
    <aside
      className={`${styles.root} ${variant === 'sheet' ? styles.sheet : styles.aside}`}
      aria-label="Order summary"
    >
      <header className={styles.header}>
        <h2 className={styles.title}>Order summary</h2>
        <span className={styles.count}>
          {state.items.length} {state.items.length === 1 ? 'item' : 'items'}
        </span>
      </header>

      <ul className={styles.items}>
        {state.items.map((item) => (
          <li key={item.productId} className={styles.item}>
            <img
              src={item.image || PLACEHOLDER}
              alt=""
              width={56}
              height={72}
              className={styles.thumb}
              loading="lazy"
            />
            <div className={styles.itemMeta}>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemQty}>Qty {item.qty}</p>
            </div>
            <span className={styles.itemPrice}>
              {formatCurrency(item.price * item.qty, item.currency || currency)}
            </span>
          </li>
        ))}
      </ul>

      <CouponInput
        couponCode={state.couponCode}
        subtotal={state.subtotal}
        items={state.items}
        onApply={setCoupon}
        onClear={clearCoupon}
      />

      <dl className={styles.totals}>
        <SummaryRow
          label="Subtotal"
          value={formatCurrency(state.subtotal, currency)}
        />
        {state.discount > 0 ? (
          <SummaryRow
            label="Discount"
            value={`−${formatCurrency(state.discount, currency)}`}
            accent
          />
        ) : null}
        {state.tax > 0 ? (
          <SummaryRow label="Tax" value={formatCurrency(state.tax, currency)} />
        ) : null}
        <div className={`${styles.row} ${styles.totalRow}`}>
          <dt>Total</dt>
          <dd>{formatCurrency(state.total, currency)}</dd>
        </div>
      </dl>

      {!isReview ? (
        <Link to={PATHS.cart} className={styles.editLink}>
          Edit cart
        </Link>
      ) : null}
    </aside>
  );
}

export default OrderSummaryAside;
