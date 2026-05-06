import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppIconButton from '../../../components/common/AppIconButton/AppIconButton.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import Loader from '../../../components/common/Loader/Loader.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { readLastOrder } from '../../../context/CheckoutContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import orderService from '../../../api/services/orderService.js';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { nameField, passwordField } from '../../../utils/validators.js';
import { formatCurrency } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './CheckoutConfirmationPage.module.css';

const PLACEHOLDER = 'https://placehold.co/96x120/E5DED2/4A453E?text=item';

const PAYMENT_LABELS = {
  card: 'Card',
  cod: 'Cash on Delivery',
  bankTransfer: 'Bank transfer',
  bank_transfer: 'Bank transfer',
};

const registerSchema = yup.object({
  firstName: nameField({ label: 'first name', min: 2, max: 40 }),
  password: passwordField({ min: 8 }).max(72, 'Please keep your password under 72 characters.'),
});

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

function paymentLabel(method) {
  if (!method) return 'Unknown';
  return PAYMENT_LABELS[method] || String(method).replace(/_/g, ' ');
}

function pickEmail(order) {
  return (
    order?.contactEmail ||
    order?.email ||
    order?.shippingAddress?.email ||
    order?.billingAddress?.email ||
    ''
  );
}

function pickFirstName(order, user) {
  if (user?.firstName) return user.firstName;
  const ship = order?.shippingAddress;
  if (ship?.firstName) return ship.firstName;
  if (ship?.fullName) return String(ship.fullName).split(' ')[0];
  return 'friend';
}

function CheckoutConfirmationPage() {
  const { id } = useParams();
  const { user, isAuthenticated, register: registerUser } = useAuth();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  // Re-fetch on mount; fall back to a sessionStorage cache so refresh and
  // guest views work without a server-side guest fetch endpoint.
  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setForbidden(false);

    orderService
      .getById(id, { signal: ctrl.signal })
      .then((data) => {
        if (cancelled) return;
        setOrder(data || null);
      })
      .catch((err) => {
        if (cancelled || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          return;
        }
        const cached = readLastOrder(id);
        if (cached) {
          setOrder(cached);
          return;
        }
        if (err?.status === 403 || err?.status === 401 || err?.status === 404) {
          setForbidden(true);
          return;
        }
        setLoadError(getApiErrorMessage(err) || 'Could not load this order.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [id]);

  const currency = order?.currency || 'AED';
  const orderNumber = order?.number || (order?.id != null ? `#${order.id}` : '');

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader label="Loading your order…" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <>
        <Seo title="Order not found | THIS Interiors" noindex />
        <EmptyState
          icon={<ReceiptLongRoundedIcon fontSize="large" />}
          title="We can't find this order."
          description="It may belong to a different account, or the link is no longer valid."
          cta={
            <AppButton variant="primary" to={PATHS.home}>
              Back to home
            </AppButton>
          }
        />
      </>
    );
  }

  if (loadError || !order) {
    return (
      <>
        <Seo title="Order | THIS Interiors" noindex />
        <EmptyState
          icon={<ReceiptLongRoundedIcon fontSize="large" />}
          title="Something went sideways."
          description={loadError || 'We could not load this order. Please try again.'}
          cta={
            <AppButton variant="primary" to={PATHS.home}>
              Back to home
            </AppButton>
          }
        />
      </>
    );
  }

  return (
    <ConfirmationView
      order={order}
      orderNumber={orderNumber}
      currency={currency}
      user={user}
      isAuthenticated={isAuthenticated}
      registerUser={registerUser}
      toast={toast}
      setOrder={setOrder}
    />
  );
}

function ConfirmationView({
  order,
  orderNumber,
  currency,
  user,
  isAuthenticated,
  registerUser,
  toast,
  setOrder,
}) {
  const firstName = pickFirstName(order, user);
  const email = pickEmail(order);

  return (
    <>
      <Seo
        title={`Thank you, ${firstName} | THIS Interiors`}
        noindex
      />

      <div className={styles.page}>
        <Hero firstName={firstName} />

        <OrderNumberRow orderNumber={orderNumber} toast={toast} />

        <div className={styles.grid}>
          <ItemsSummary order={order} currency={currency} />
          <DetailsColumn order={order} />
        </div>

        <NextStepsStrip />

        <div className={styles.actions}>
          <AppButton variant="primary" to={PATHS.shop} className={styles.cta}>
            Continue shopping
          </AppButton>
          {isAuthenticated && order?.id != null ? (
            <AppButton
              variant="ghost"
              to={PATHS.account.orderDetail(order.id)}
              className={styles.ghostCta}
            >
              View order details
            </AppButton>
          ) : null}
        </div>

        {!isAuthenticated && email ? (
          <GuestCreateAccount
            email={email}
            orderId={order?.id}
            registerUser={registerUser}
            toast={toast}
            onLinked={(updated) => {
              if (updated) setOrder(updated);
            }}
          />
        ) : null}
      </div>
    </>
  );
}

function Hero({ firstName }) {
  return (
    <header className={styles.hero}>
      <span className={styles.successBadge} aria-hidden>
        <CheckCircleRoundedIcon fontSize="small" />
        Order confirmed
      </span>
      <h1 className={styles.heroTitle}>{`Thank you, ${firstName}.`}</h1>
      <p className={styles.heroSub}>Your pieces are being prepared.</p>
    </header>
  );
}

function OrderNumberRow({ orderNumber, toast }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!orderNumber) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderNumber);
      } else if (typeof document !== 'undefined') {
        const el = document.createElement('textarea');
        el.value = orderNumber;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      toast.success('Order number copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select and copy manually.');
    }
  }, [orderNumber, toast]);

  return (
    <div className={styles.orderRow}>
      <span className={styles.orderLabel}>Order number</span>
      <div className={styles.orderNumberWrap}>
        <span className={styles.orderNumber}>{orderNumber}</span>
        <AppIconButton
          aria-label="Copy order number"
          onClick={handleCopy}
          size="small"
          tooltip={copied ? 'Copied' : 'Copy'}
        >
          <ContentCopyRoundedIcon fontSize="small" />
        </AppIconButton>
      </div>
    </div>
  );
}

function ItemsSummary({ order, currency }) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return (
    <section className={styles.card} aria-labelledby="confirm-items">
      <h2 id="confirm-items" className={styles.cardTitle}>
        Order summary
      </h2>
      <ul className={styles.items}>
        {items.map((item) => {
          const qty = item.quantity ?? item.qty ?? 1;
          const lineTotal = item.lineTotal ?? (Number(item.unitPrice ?? item.price) || 0) * qty;
          return (
            <li key={item.productId || item.sku || item.name} className={styles.item}>
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
                <p className={styles.itemQty}>Qty {qty}</p>
              </div>
              <span className={styles.itemPrice}>
                {formatCurrency(lineTotal, currency)}
              </span>
            </li>
          );
        })}
      </ul>

      <dl className={styles.totals}>
        <Row label="Subtotal" value={formatCurrency(order.subtotal || 0, currency)} />
        {order.discount > 0 ? (
          <Row
            label={order.couponCode ? `Discount (${order.couponCode})` : 'Discount'}
            value={`−${formatCurrency(order.discount, currency)}`}
            accent
          />
        ) : null}
        {order.tax > 0 ? (
          <Row label="Tax" value={formatCurrency(order.tax, currency)} />
        ) : null}
        <Row
          label="Total"
          value={formatCurrency(order.total || 0, currency)}
          isTotal
        />
      </dl>
    </section>
  );
}

function Row({ label, value, accent, isTotal }) {
  return (
    <div className={`${styles.row} ${isTotal ? styles.totalRow : ''}`}>
      <dt>{label}</dt>
      <dd className={accent ? styles.discount : ''}>{value}</dd>
    </div>
  );
}

function DetailsColumn({ order }) {
  const billingSame =
    !order.billingAddress ||
    JSON.stringify(order.billingAddress) === JSON.stringify(order.shippingAddress);

  return (
    <aside className={styles.detailsCol}>
      <section className={styles.card} aria-labelledby="confirm-shipping">
        <h2 id="confirm-shipping" className={styles.cardTitle}>
          Delivery address
        </h2>
        <address className={styles.address}>
          {formatAddressLines(order.shippingAddress).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
      </section>

      <section className={styles.card} aria-labelledby="confirm-billing">
        <h2 id="confirm-billing" className={styles.cardTitle}>
          Billing address
        </h2>
        {billingSame ? (
          <p className={styles.sameAs}>Same as delivery</p>
        ) : (
          <address className={styles.address}>
            {formatAddressLines(order.billingAddress).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
        )}
      </section>

      <section className={styles.card} aria-labelledby="confirm-payment">
        <h2 id="confirm-payment" className={styles.cardTitle}>
          Payment
        </h2>
        <p className={styles.paymentLabel}>{paymentLabel(order.paymentMethod)}</p>
      </section>
    </aside>
  );
}

function NextStepsStrip() {
  const steps = [
    { key: 'received', label: 'Order received', Icon: ReceiptLongRoundedIcon, active: true },
    { key: 'preparing', label: 'Being prepared', Icon: InventoryRoundedIcon, active: false },
    { key: 'ready', label: 'Ready', Icon: LocalShippingRoundedIcon, active: false },
  ];
  return (
    <section className={styles.nextStrip} aria-label="What's next">
      <h2 className={styles.nextTitle}>What&apos;s next</h2>
      <ol className={styles.nextSteps}>
        {steps.map((step) => (
          <li
            key={step.key}
            className={`${styles.nextStep} ${step.active ? styles.nextStepActive : ''}`}
          >
            <span className={styles.nextIcon} aria-hidden>
              <step.Icon fontSize="small" />
            </span>
            <span className={styles.nextLabel}>{step.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GuestCreateAccount({ email, orderId, registerUser, toast, onLinked }) {
  const methods = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { firstName: '', password: '' },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState(null);

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, ['firstName', 'password']);

  const onSubmit = useCallback(
    async (values) => {
      setServerError(null);
      try {
        await registerUser({
          firstName: values.firstName.trim(),
          lastName: '',
          email,
          password: values.password,
        });
        if (orderId != null) {
          try {
            await orderService.linkToUser(orderId);
          } catch {
            /* non-fatal — the order is still visible to the new account */
          }
        }
        toast.success(`Welcome to THIS Interiors, ${values.firstName.trim()}.`);
        setDone(true);
        if (typeof onLinked === 'function') onLinked(null);
      } catch (err) {
        if (err?.errors && typeof err.errors === 'object' && Object.keys(err.errors).length > 0) {
          onApiError(err);
          return;
        }
        const message =
          getApiErrorMessage(err) ||
          'Could not create your account. Please try again.';
        setServerError(message);
      }
    },
    [registerUser, email, orderId, toast, onLinked, onApiError],
  );

  if (done) {
    return (
      <section className={styles.guestCard}>
        <p className={styles.guestDone}>
          Your account is ready — we&apos;ve linked this order to it.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.guestCard} aria-labelledby="guest-cta">
      <header className={styles.guestHeader}>
        <h2 id="guest-cta" className={styles.guestTitle}>
          Save your details for next time
        </h2>
        <p className={styles.guestSub}>
          We&apos;ll save this order to your account so reordering is one tap.
        </p>
      </header>

      {serverError ? (
        <div className={styles.errorBanner} role="alert">
          {serverError}
        </div>
      ) : null}

      <FormProvider {...methods}>
        <form
          className={styles.guestForm}
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <AppTextField
            value={email}
            label="Email"
            type="email"
            disabled
            id="guest-email"
          />
          <AppTextField
            name="firstName"
            label="First name"
            autoComplete="given-name"
            required
            id="guest-firstName"
          />
          <AppTextField
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            id="guest-password"
            helperText="At least 8 characters."
          />
          <AppButton
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className={styles.guestSubmit}
          >
            Create account
          </AppButton>
        </form>
      </FormProvider>
    </section>
  );
}

export default CheckoutConfirmationPage;
