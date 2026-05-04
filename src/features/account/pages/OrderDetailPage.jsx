import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';

import useAccountSection from '../hooks/useAccountSection.js';
import StatusPill from '../components/StatusPill.jsx';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { useToast } from '../../../context/ToastContext.jsx';
import { useCart } from '../../../context/CartContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import orderService from '../../../api/services/orderService.js';
import { formatCurrency, formatDate } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './OrderDetailPage.module.css';

const CANCELLABLE_STATUSES = new Set(['pending', 'confirmed']);

const PAYMENT_LABELS = {
  card: 'Card',
  cod: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
  apple_pay: 'Apple Pay',
};

function paymentLabel(method) {
  if (!method) return 'Unknown';
  return PAYMENT_LABELS[method] || method.replace(/_/g, ' ');
}

function formatAddress(address) {
  if (!address) return null;
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ');
  const lines = [
    name,
    address.line1,
    address.line2,
    [address.city, address.emirate].filter(Boolean).join(', '),
    address.country === 'AE' ? 'United Arab Emirates' : address.country,
    address.phone,
  ].filter(Boolean);
  return lines;
}

function ItemsListSkeleton() {
  return (
    <div className={styles.itemsCard} aria-busy="true">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className={styles.itemSkeleton}>
          <div className={styles.itemThumbSkeleton} />
          <div className={styles.itemLines}>
            <span className={`${styles.skBar} ${styles.skBarLg}`} />
            <span className={`${styles.skBar} ${styles.skBarMd}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <aside className={styles.summaryCard} aria-busy="true">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className={styles.summaryRow}>
          <span className={`${styles.skBar} ${styles.skBarMd}`} />
          <span className={`${styles.skBar} ${styles.skBarSm}`} />
        </div>
      ))}
    </aside>
  );
}

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { addItem } = useCart();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  const sectionTitle = order?.number ? `Order ${order.number}` : 'Order details';
  useAccountSection({
    title: sectionTitle,
    descriptor: 'Review the items, addresses, and payment for this order.',
  });

  const fetchOrder = useCallback(
    async (signal) => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await orderService.getById(id, { signal });
        setOrder(data || null);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setLoadError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    fetchOrder(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchOrder]);

  const itemCount = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  }, [order]);

  const canCancel = order && CANCELLABLE_STATUSES.has(order.status);
  const currency = order?.currency || 'AED';

  const handleReorder = useCallback(async () => {
    if (!order || reordering) return;
    setReordering(true);
    try {
      const result = await orderService.reorder(order.id);
      const added = Array.isArray(result?.items) ? result.items : [];
      const skipped = Array.isArray(result?.skipped) ? result.skipped : [];

      for (const item of added) {
        addItem(
          {
            productId: item.productId,
            id: item.productId,
            slug: item.slug,
            name: item.name,
            image: item.image,
            price: item.price,
            currency: item.currency || currency,
            stock: item.stock,
          },
          item.qty,
        );
      }

      const addedCount = added.length;
      const skippedCount = skipped.length;
      let message;
      if (addedCount === 0 && skippedCount > 0) {
        message =
          'These pieces are no longer available. Nothing was added to your bag.';
      } else if (addedCount > 0 && skippedCount === 0) {
        message = `Added ${addedCount} ${
          addedCount === 1 ? 'piece' : 'pieces'
        } to your bag.`;
      } else {
        message = `Added ${addedCount} of ${
          addedCount + skippedCount
        } pieces — the rest are no longer available.`;
      }

      if (addedCount === 0) {
        toast.warning(message);
      } else {
        toast.success(message);
      }

      if (addedCount > 0) {
        navigate(PATHS.cart);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Could not reorder these items.');
    } finally {
      setReordering(false);
    }
  }, [order, reordering, addItem, currency, toast, navigate]);

  const openCancel = () => setConfirmCancel(true);
  const closeCancel = () => {
    if (cancelling) return;
    setConfirmCancel(false);
  };

  const handleCancel = useCallback(async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancel(order.id);
      setOrder((prev) => (prev ? { ...prev, ...(updated || {}) } : prev));
      toast.success('Order cancelled.');
      setConfirmCancel(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Could not cancel this order.');
    } finally {
      setCancelling(false);
    }
  }, [order, toast]);

  if (isLoading) {
    return (
      <>
        <Seo title="Order details | THIS Interiors" noindex />
        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <ItemsListSkeleton />
          </div>
          <div className={styles.sideCol}>
            <SummarySkeleton />
          </div>
        </div>
      </>
    );
  }

  if (loadError || !order) {
    return (
      <>
        <Seo title="Order details | THIS Interiors" noindex />
        <EmptyState
          icon={<SearchOffRoundedIcon fontSize="large" />}
          title="We couldn't find this order."
          description="It may have been removed or you may not have access."
          cta={
            <AppButton variant="primary" to={PATHS.account.orders}>
              Back to orders
            </AppButton>
          }
        />
      </>
    );
  }

  const shippingLines = formatAddress(order.shippingAddress);
  const billingLines = formatAddress(order.billingAddress);
  const cardLast4 = order.paymentMethod === 'card' ? order.cardLast4 : null;
  const isPaid = order.paymentStatus === 'paid';

  return (
    <>
      <Seo title={`Order ${order.number} | THIS Interiors`} noindex />

      <header className={styles.detailHeader}>
        <div className={styles.detailBack}>
          <Link to={PATHS.account.orders} className={styles.backLink}>
            <ArrowBackRoundedIcon fontSize="small" aria-hidden /> All orders
          </Link>
        </div>
        <div className={styles.detailTitleRow}>
          <div>
            <h2 className={styles.title}>Order {order.number}</h2>
            <p className={styles.subtitle}>
              {formatDate(order.createdAt)} · {itemCount}{' '}
              {itemCount === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
          <StatusPill status={order.status} />
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <section
            className={styles.itemsCard}
            aria-label="Items in this order"
          >
            {(order.items || []).map((item, idx) => {
              const lineTotal =
                Number(item.lineTotal) ||
                Number(item.unitPrice) * Number(item.quantity || 1);
              return (
                <article
                  key={`${item.productId}-${idx}`}
                  className={styles.itemRow}
                >
                  <div className={styles.itemThumb}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : null}
                  </div>
                  <div className={styles.itemBody}>
                    <h3 className={styles.itemName}>
                      {item.slug ? (
                        <Link
                          to={PATHS.product(item.slug)}
                          className={styles.itemNameLink}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </h3>
                    <p className={styles.itemMeta}>
                      Qty {item.quantity}
                      {item.unitPrice ? (
                        <>
                          {' '}
                          ·{' '}
                          <span className={styles.unit}>
                            {formatCurrency(item.unitPrice, currency)} each
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className={styles.itemTotal}>
                    {formatCurrency(lineTotal, currency)}
                  </div>
                </article>
              );
            })}
          </section>

          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            className={styles.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              className={styles.accordionSummary}
            >
              <span className={styles.accordionTitle}>Shipping address</span>
            </AccordionSummary>
            <AccordionDetails>
              {shippingLines ? (
                <address className={styles.address}>
                  {shippingLines.map((line, idx) => (
                    <span key={idx}>{line}</span>
                  ))}
                </address>
              ) : (
                <p className={styles.muted}>No shipping address on file.</p>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            className={styles.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              className={styles.accordionSummary}
            >
              <span className={styles.accordionTitle}>Billing address</span>
            </AccordionSummary>
            <AccordionDetails>
              {billingLines ? (
                <address className={styles.address}>
                  {billingLines.map((line, idx) => (
                    <span key={idx}>{line}</span>
                  ))}
                </address>
              ) : (
                <p className={styles.muted}>Same as shipping address.</p>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            className={styles.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              className={styles.accordionSummary}
            >
              <span className={styles.accordionTitle}>Payment</span>
            </AccordionSummary>
            <AccordionDetails>
              <dl className={styles.paymentList}>
                <div className={styles.paymentRow}>
                  <dt>Method</dt>
                  <dd>{paymentLabel(order.paymentMethod)}</dd>
                </div>
                {cardLast4 ? (
                  <div className={styles.paymentRow}>
                    <dt>Card</dt>
                    <dd>•••• {cardLast4}</dd>
                  </div>
                ) : null}
                <div className={styles.paymentRow}>
                  <dt>Status</dt>
                  <dd>{isPaid ? 'Paid' : 'Unpaid'}</dd>
                </div>
              </dl>
            </AccordionDetails>
          </Accordion>
        </div>

        <aside className={styles.sideCol}>
          <section className={styles.summaryCard} aria-label="Order summary">
            <h3 className={styles.summaryTitle}>Summary</h3>
            <dl className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.subtotal, currency)}</dd>
              </div>
              {Number(order.discount) > 0 ? (
                <div className={styles.summaryRow}>
                  <dt>
                    Discount{order.couponCode ? ` (${order.couponCode})` : ''}
                  </dt>
                  <dd className={styles.discount}>
                    −{formatCurrency(order.discount, currency)}
                  </dd>
                </div>
              ) : null}
              <div className={styles.summaryRow}>
                <dt>Tax</dt>
                <dd>{formatCurrency(order.tax, currency)}</dd>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <dt>Total</dt>
                <dd className={styles.total}>
                  {formatCurrency(order.total, currency)}
                </dd>
              </div>
            </dl>

            <div className={styles.actions}>
              <AppButton
                variant="primary"
                onClick={handleReorder}
                loading={reordering}
                fullWidth
              >
                Reorder
              </AppButton>
              {canCancel ? (
                <AppButton
                  variant="ghost"
                  onClick={openCancel}
                  fullWidth
                  className={styles.cancelBtn}
                >
                  Cancel order
                </AppButton>
              ) : null}
              <AppButton
                variant="ghost"
                to={`${PATHS.contact}?orderNumber=${encodeURIComponent(order.number)}`}
                fullWidth
              >
                Need help?
              </AppButton>
            </div>
          </section>
        </aside>
      </div>

      <AppDialog
        open={confirmCancel}
        onClose={closeCancel}
        size="sm"
        title="Cancel this order?"
        description="This action cannot be undone. Stock for these pieces will be released."
        actions={
          <>
            <AppButton variant="ghost" onClick={closeCancel} disabled={cancelling}>
              Keep order
            </AppButton>
            <AppButton
              variant="danger"
              onClick={handleCancel}
              loading={cancelling}
            >
              Yes, cancel
            </AppButton>
          </>
        }
      >
        <p className={styles.confirmText}>
          You&apos;re about to cancel <strong>{order.number}</strong>.
        </p>
      </AppDialog>
    </>
  );
}

export default OrderDetailPage;
