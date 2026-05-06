import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import Loader from '../../../components/common/Loader/Loader.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { useCart } from '../../../context/CartContext.jsx';
import { useCheckout } from '../../../context/CheckoutContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { formatCurrency } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './CheckoutReviewPage.module.css';

const PLACEHOLDER = 'https://placehold.co/96x120/E5DED2/4A453E?text=item';

const PAYMENT_LABELS = {
  card: 'Card',
  cod: 'Cash on Delivery',
  bankTransfer: 'Bank transfer',
};

function fullName(address) {
  if (!address) return '';
  if (address.fullName) return String(address.fullName).trim();
  return [address.firstName, address.lastName].filter(Boolean).join(' ').trim();
}

function formatAddressLines(address) {
  if (!address) return [];
  return [
    fullName(address),
    address.line1,
    address.line2,
    [address.city, address.emirate].filter(Boolean).join(', '),
    address.country === 'AE' ? 'United Arab Emirates' : address.country,
    address.phone,
    address.email,
  ].filter(Boolean);
}

function paymentDisplay(payment) {
  if (!payment) return { label: 'Not selected', detail: null };
  if (payment.method === 'card') {
    const brand = payment.brand
      ? String(payment.brand).charAt(0).toUpperCase() + String(payment.brand).slice(1)
      : 'Card';
    const last4 = payment.last4 || '••••';
    return {
      label: `${brand} •••• ${last4}`,
      detail: payment.cardName || null,
    };
  }
  return {
    label: PAYMENT_LABELS[payment.method] || payment.method || 'Payment',
    detail: null,
  };
}

function ReviewCard({ title, editTo, editLabel = 'Edit', children }) {
  return (
    <section className={styles.card} aria-labelledby={`card-${title}`}>
      <header className={styles.cardHeader}>
        <h2 id={`card-${title}`} className={styles.cardTitle}>
          {title}
        </h2>
        {editTo ? (
          <Link to={editTo} className={styles.editLink}>
            {editLabel}
          </Link>
        ) : null}
      </header>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

function CheckoutReviewPage() {
  const checkout = useCheckout();
  const { state: cartState, clear: clearCart, clearCoupon } = useCart();
  const toast = useToast();

  const [agreed, setAgreed] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const currency = cartState.items[0]?.currency || 'AED';

  const handlePlaceOrder = useCallback(async () => {
    setSubmitError(null);
    try {
      await checkout.placeOrder({ cartState, clearCart });
    } catch (err) {
      const message =
        err?.message || 'Could not place your order. Please try again.';
      setSubmitError(message);
      toast.error(message);
    }
  }, [checkout, cartState, clearCart, toast]);

  const payment = paymentDisplay(checkout.payment);
  const billing = checkout.billingSameAsShipping
    ? null
    : checkout.billingAddress;

  return (
    <>
      <Seo title="Checkout — Review | THIS Interiors" noindex />

      <div className={styles.page}>
        <header className={styles.sectionHeader}>
          <span className={styles.kicker}>Take a final look before we begin.</span>
          <h1 className={styles.title}>Review your order</h1>
        </header>

        {submitError ? (
          <div className={styles.errorBanner} role="alert">
            {submitError}
          </div>
        ) : null}

        <ReviewCard title="Items" editTo={PATHS.cart} editLabel="Edit cart">
          {cartState.items.length === 0 ? (
            <p className={styles.muted}>Your bag is empty.</p>
          ) : (
            <ul className={styles.items}>
              {cartState.items.map((item) => (
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
          )}
        </ReviewCard>

        <ReviewCard title="Delivery address" editTo={PATHS.checkoutAddress}>
          {checkout.address ? (
            <address className={styles.address}>
              {formatAddressLines(checkout.address).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          ) : (
            <p className={styles.muted}>No delivery address selected.</p>
          )}
        </ReviewCard>

        <ReviewCard title="Billing address" editTo={PATHS.checkoutAddress}>
          {checkout.billingSameAsShipping || !billing ? (
            <p className={styles.sameAs}>Same as delivery</p>
          ) : (
            <address className={styles.address}>
              {formatAddressLines(billing).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          )}
        </ReviewCard>

        <ReviewCard title="Payment" editTo={PATHS.checkoutPayment}>
          <p className={styles.paymentLabel}>{payment.label}</p>
          {payment.detail ? (
            <p className={styles.muted}>{payment.detail}</p>
          ) : null}
        </ReviewCard>

        {checkout.notes ? (
          <ReviewCard title="Notes" editTo={PATHS.checkoutPayment}>
            <p className={styles.notes}>{checkout.notes}</p>
          </ReviewCard>
        ) : null}

        {cartState.couponCode ? (
          <ReviewCard title="Coupon">
            <div className={styles.couponRow}>
              <div>
                <p className={styles.paymentLabel}>{cartState.couponCode}</p>
                {cartState.discount > 0 ? (
                  <p className={styles.muted}>
                    {`−${formatCurrency(cartState.discount, currency)} off`}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => clearCoupon()}
                disabled={checkout.isPlacingOrder}
              >
                Remove
              </button>
            </div>
          </ReviewCard>
        ) : null}

        <div className={styles.terms}>
          <AppCheckbox
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={checkout.isPlacingOrder}
            label={
              <span>
                I agree to the{' '}
                <Link to={PATHS.terms} className={styles.termsLink}>
                  Terms
                </Link>{' '}
                and{' '}
                <Link to={PATHS.privacy} className={styles.termsLink}>
                  Privacy Policy
                </Link>
                .
              </span>
            }
          />
        </div>

        <div className={styles.footer}>
          <AppButton
            variant="ghost"
            to={PATHS.checkoutPayment}
            className={styles.ghostBtn}
            disabled={checkout.isPlacingOrder}
          >
            Back to payment
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handlePlaceOrder}
            disabled={!agreed || cartState.items.length === 0}
            loading={checkout.isPlacingOrder}
            className={styles.primaryBtn}
          >
            {checkout.isPlacingOrder ? 'Placing order…' : 'Place order'}
          </AppButton>
        </div>

        {checkout.isPlacingOrder ? (
          <div className={styles.loaderOverlay} aria-hidden>
            <Loader label="Placing order…" />
          </div>
        ) : null}
      </div>
    </>
  );
}

export default CheckoutReviewPage;
