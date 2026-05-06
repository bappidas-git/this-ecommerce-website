import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { PATHS } from '../../../routes/paths.js';
import { formatCurrency, formatDate } from '../../../utils/format.js';
import { adminOrderService } from '../../../api/services/admin/adminOrderService.js';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_PILL,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_PILL,
} from '../../features/orders/orderStatus.js';
import { isTerminal, nextStatuses } from '../../utils/orderStateMachine.js';

import StatusWorkflow from './StatusWorkflow.jsx';
import InternalNotesTimeline from './InternalNotesTimeline.jsx';

import styles from './OrderDetailPage.module.css';

function fmtAddress(addr) {
  if (!addr) return null;
  const name = [addr.firstName, addr.lastName].filter(Boolean).join(' ');
  return [
    name,
    addr.line1,
    addr.line2,
    [addr.city, addr.emirate].filter(Boolean).join(', '),
    addr.country === 'AE' ? 'United Arab Emirates' : addr.country,
    addr.phone,
  ].filter(Boolean);
}

function MarkPaidDialog({ open, onClose, onSubmit, order, isSaving }) {
  const [reference, setReference] = useState('');
  useEffect(() => {
    if (open) setReference('');
  }, [open]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Mark order as paid?"
      description={
        order
          ? `Confirm payment was received for ${order.number} (${formatCurrency(
              order.total,
              order.currency,
            )}).`
          : ''
      }
      actions={(
        <>
          <AppButton variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => onSubmit({ reference: reference.trim() })}
            loading={isSaving}
          >
            Mark as paid
          </AppButton>
        </>
      )}
    >
      <AppTextField
        label="Reference number"
        placeholder="Bank transfer ref, receipt #, etc."
        value={reference}
        onChange={(e) => setReference(e.target.value.slice(0, 64))}
        optional
      />
    </AppDialog>
  );
}

function RefundDialog({ open, onClose, onSubmit, order, isSaving }) {
  const total = Number(order?.total) || 0;
  const already = Number(order?.refundedAmount) || 0;
  const remaining = Math.max(0, Math.round((total - already) * 100) / 100);
  const [type, setType] = useState('full');
  const [amount, setAmount] = useState(String(remaining));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setType('full');
      setAmount(String(remaining));
      setReason('');
      setError('');
    }
  }, [open, remaining]);

  const handleTypeChange = (next) => {
    setType(next);
    if (next === 'full') setAmount(String(remaining));
  };

  const handleSubmit = () => {
    const value = type === 'full' ? remaining : Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a refund amount greater than zero');
      return;
    }
    if (value > remaining + 0.001) {
      setError(`Cannot exceed remaining ${formatCurrency(remaining, order?.currency)}`);
      return;
    }
    onSubmit({ amount: value, reason: reason.trim() });
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Issue refund"
      description={
        order
          ? `Total ${formatCurrency(total, order.currency)} • already refunded ${formatCurrency(
              already,
              order.currency,
            )}`
          : ''
      }
      actions={(
        <>
          <AppButton variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton variant="danger" onClick={handleSubmit} loading={isSaving}>
            Refund
          </AppButton>
        </>
      )}
    >
      <div className={styles.refundOptions}>
        <label className={styles.refundOption}>
          <input
            type="radio"
            name="refund-type"
            value="full"
            checked={type === 'full'}
            onChange={() => handleTypeChange('full')}
          />
          <span>Full refund — {formatCurrency(remaining, order?.currency)}</span>
        </label>
        <label className={styles.refundOption}>
          <input
            type="radio"
            name="refund-type"
            value="partial"
            checked={type === 'partial'}
            onChange={() => handleTypeChange('partial')}
          />
          <span>Partial refund</span>
        </label>
      </div>
      {type === 'partial' ? (
        <AppTextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (error) setError('');
          }}
          inputProps={{ min: 0, max: remaining, step: '0.01' }}
        />
      ) : null}
      <AppTextField
        label="Reason"
        multiline
        minRows={2}
        maxRows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value.slice(0, 280))}
        helperText={`${reason.length}/280`}
        optional
      />
      {error ? <p className={styles.dialogError}>{error}</p> : null}
    </AppDialog>
  );
}

function CancelDialog({ open, onClose, onSubmit, order, isSaving }) {
  const [note, setNote] = useState('');
  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Cancel this order?"
      description="Stock for items will be restored. This cannot be undone."
      actions={(
        <>
          <AppButton variant="ghost" onClick={onClose} disabled={isSaving}>
            Keep order
          </AppButton>
          <AppButton
            variant="danger"
            onClick={() => onSubmit({ status: 'cancelled', note: note.trim() || null })}
            loading={isSaving}
          >
            Yes, cancel
          </AppButton>
        </>
      )}
    >
      <p className={styles.confirmText}>
        You&apos;re about to cancel <strong>{order?.number}</strong>.
      </p>
      <AppTextField
        label="Reason"
        multiline
        minRows={2}
        maxRows={4}
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 280))}
        helperText={`${note.length}/280`}
        optional
      />
    </AppDialog>
  );
}

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('orders');

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const [isStatusSaving, setIsStatusSaving] = useState(false);
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);
  const [isNoteSaving, setIsNoteSaving] = useState(false);

  useAdminBreadcrumbs(
    order
      ? [
          { label: 'Sales' },
          { label: 'Orders', to: PATHS.admin.orders },
          { label: `#${order.number}` },
        ]
      : [
          { label: 'Sales' },
          { label: 'Orders', to: PATHS.admin.orders },
          { label: 'Order' },
        ],
  );

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await adminOrderService.getById(id);
      setOrder(data || null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const itemCount = order?.itemsCount || 0;
  const currency = order?.currency || 'AED';

  const canMarkPaid = useMemo(() => {
    if (!order || !canWrite) return false;
    return (
      order.paymentStatus === 'pending' &&
      ['cod', 'bank_transfer'].includes(order.paymentMethod)
    );
  }, [order, canWrite]);

  const canRefund = canWrite && order && order.paymentStatus === 'paid';
  const canCancel = canWrite && order && !isTerminal(order.status) &&
    nextStatuses(order.status).includes('cancelled');

  const handleStatus = useCallback(
    async ({ status, note }) => {
      if (!order) return;
      const previous = order;
      setIsStatusSaving(true);
      try {
        const updated = await adminOrderService.updateStatus(order.id, {
          status,
          ...(note ? { note } : {}),
        });
        setOrder(updated);
        toast.success(`Status updated to ${ORDER_STATUS_LABELS[status] || status}`);
      } catch (err) {
        setOrder(previous);
        toast.error(err?.message || 'Could not update status');
        throw err;
      } finally {
        setIsStatusSaving(false);
      }
    },
    [order, toast],
  );

  const handleMarkPaid = useCallback(
    async (payload) => {
      if (!order) return;
      setIsPaymentSaving(true);
      const previous = order;
      setOrder({ ...order, paymentStatus: 'paid' });
      try {
        const updated = await adminOrderService.markPaid(order.id, payload);
        setOrder(updated);
        toast.success('Order marked as paid');
        setShowMarkPaid(false);
      } catch (err) {
        setOrder(previous);
        toast.error(err?.message || 'Could not mark as paid');
      } finally {
        setIsPaymentSaving(false);
      }
    },
    [order, toast],
  );

  const handleRefund = useCallback(
    async (payload) => {
      if (!order) return;
      setIsPaymentSaving(true);
      try {
        const updated = await adminOrderService.refund(order.id, payload);
        setOrder(updated);
        const isFull = updated.paymentStatus === 'refunded';
        toast.success(isFull ? 'Order fully refunded' : 'Partial refund issued');
        setShowRefund(false);
      } catch (err) {
        toast.error(err?.message || 'Could not issue refund');
      } finally {
        setIsPaymentSaving(false);
      }
    },
    [order, toast],
  );

  const handleCancel = useCallback(
    async (payload) => {
      if (!order) return;
      setIsStatusSaving(true);
      try {
        const updated = await adminOrderService.updateStatus(order.id, payload);
        setOrder(updated);
        toast.success('Order cancelled and stock restored');
        setShowCancel(false);
      } catch (err) {
        toast.error(err?.message || 'Could not cancel order');
      } finally {
        setIsStatusSaving(false);
      }
    },
    [order, toast],
  );

  const handleAddNote = useCallback(
    async ({ body, isInternal }) => {
      if (!order) return;
      setIsNoteSaving(true);
      const previous = order;
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        ...order,
        notes: [
          {
            id: tempId,
            body,
            isInternal,
            author: { id: null, name: 'You', role: 'admin' },
            createdAt: new Date().toISOString(),
          },
          ...(order.notes || []),
        ],
      };
      setOrder(optimistic);
      try {
        const updated = await adminOrderService.addNote(order.id, { body, isInternal });
        setOrder(updated);
        toast.success('Note added');
      } catch (err) {
        setOrder(previous);
        toast.error(err?.message || 'Could not add note');
        throw err;
      } finally {
        setIsNoteSaving(false);
      }
    },
    [order, toast],
  );

  if (isLoading && !order) {
    return (
      <>
        <Seo title="Order | Admin" noindex />
        <div className={styles.loadingWrap}>
          <LinearProgress />
        </div>
      </>
    );
  }

  if (loadError && !order) {
    return (
      <>
        <Seo title="Order | Admin" noindex />
        <ErrorState
          title="Could not load order"
          description={loadError?.message || 'Please try again.'}
          onRetry={fetchOrder}
        />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Seo title="Order | Admin" noindex />
        <EmptyState
          title="Order not found"
          description="It may have been removed or you may not have access."
          cta={
            <AppButton variant="ghost" onClick={() => navigate(PATHS.admin.orders)}>
              Back to orders
            </AppButton>
          }
        />
      </>
    );
  }

  const shippingLines = fmtAddress(order.shippingAddress);
  const billingLines = fmtAddress(order.billingAddress);
  const refundedAmount = Number(order.refundedAmount) || 0;

  return (
    <>
      <Seo title={`Order ${order.number} | Admin`} noindex />
      <AdminPageHeader
        eyebrow="Sales"
        title={`Order ${order.number}`}
        description={`${formatDate(order.createdAt)} • ${itemCount} ${
          itemCount === 1 ? 'piece' : 'pieces'
        } • ${formatCurrency(order.total, currency)}`}
        actions={
          <div className={styles.headerActions}>
            <StatusPill
              status={ORDER_STATUS_PILL[order.status] || order.status}
              label={ORDER_STATUS_LABELS[order.status] || order.status}
            />
            {canMarkPaid ? (
              <AppButton
                variant="primary"
                size="small"
                icon={<PaymentRoundedIcon fontSize="small" />}
                onClick={() => setShowMarkPaid(true)}
              >
                Mark as paid
              </AppButton>
            ) : null}
            {canRefund ? (
              <AppButton
                variant="secondary"
                size="small"
                icon={<ReplayRoundedIcon fontSize="small" />}
                onClick={() => setShowRefund(true)}
              >
                Refund
              </AppButton>
            ) : null}
            {canCancel ? (
              <AppButton
                variant="ghost"
                size="small"
                icon={<BlockRoundedIcon fontSize="small" />}
                onClick={() => setShowCancel(true)}
                className={styles.cancelBtn}
              >
                Cancel order
              </AppButton>
            ) : null}
          </div>
        }
      />

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <section className={styles.itemsCard} aria-label="Items in this order">
            <header className={styles.itemsHead}>
              <span className={styles.itemsHeadCol}>Item</span>
              <span className={styles.itemsHeadColRight}>Qty</span>
              <span className={styles.itemsHeadColRight}>Unit</span>
              <span className={styles.itemsHeadColRight}>Line total</span>
            </header>
            {(order.items || []).map((it, idx) => {
              const lineTotal = Number(it.lineTotal) ||
                Number(it.unitPrice) * Number(it.quantity || 1);
              return (
                <div key={`${it.productId}-${idx}`} className={styles.itemRow}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemThumb}>
                      {it.image ? <img src={it.image} alt="" loading="lazy" /> : null}
                    </div>
                    <div className={styles.itemTextCol}>
                      <span className={styles.itemName}>
                        {it.slug ? (
                          <RouterLink
                            to={PATHS.product(it.slug)}
                            className={styles.itemLink}
                          >
                            {it.name}
                          </RouterLink>
                        ) : (
                          it.name
                        )}
                      </span>
                      {it.sku ? (
                        <span className={styles.itemSku}>SKU {it.sku}</span>
                      ) : null}
                    </div>
                  </div>
                  <span className={styles.mono}>{it.quantity}</span>
                  <span className={styles.mono}>
                    {formatCurrency(it.unitPrice, currency)}
                  </span>
                  <span className={styles.monoStrong}>
                    {formatCurrency(lineTotal, currency)}
                  </span>
                </div>
              );
            })}
          </section>

          <Accordion
            disableGutters
            elevation={0}
            defaultExpanded
            className={styles.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              className={styles.accordionSummary}
            >
              <span className={styles.accordionTitle}>Shipping address</span>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionBody}>
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

          <Accordion disableGutters elevation={0} className={styles.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              className={styles.accordionSummary}
            >
              <span className={styles.accordionTitle}>Billing address</span>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionBody}>
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

          <Accordion disableGutters elevation={0} className={styles.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              className={styles.accordionSummary}
            >
              <span className={styles.accordionTitle}>Payment</span>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionBody}>
              <dl className={styles.paymentList}>
                <div className={styles.paymentRow}>
                  <dt>Method</dt>
                  <dd>{PAYMENT_METHOD_LABELS[order.paymentMethod] || '—'}</dd>
                </div>
                <div className={styles.paymentRow}>
                  <dt>Status</dt>
                  <dd>
                    <StatusPill
                      status={PAYMENT_STATUS_PILL[order.paymentStatus] || 'pending'}
                      label={PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                    />
                    {refundedAmount > 0 && order.paymentStatus !== 'refunded' ? (
                      <span className={styles.partialChip}>
                        −{formatCurrency(refundedAmount, currency)} refunded
                      </span>
                    ) : null}
                  </dd>
                </div>
                {order.transactionId ? (
                  <div className={styles.paymentRow}>
                    <dt>Transaction ID</dt>
                    <dd className={styles.mono}>{order.transactionId}</dd>
                  </div>
                ) : null}
                {order.paymentReference ? (
                  <div className={styles.paymentRow}>
                    <dt>Reference</dt>
                    <dd className={styles.mono}>{order.paymentReference}</dd>
                  </div>
                ) : null}
              </dl>
            </AccordionDetails>
          </Accordion>

          <InternalNotesTimeline
            notes={order.notes || []}
            canWrite={canWrite}
            onAdd={handleAddNote}
            isSaving={isNoteSaving}
          />
        </div>

        <aside className={styles.sideCol}>
          <StatusWorkflow
            status={order.status}
            history={order.statusHistory || []}
            canWrite={canWrite}
            onTransition={handleStatus}
            isWorking={isStatusSaving}
          />

          <section className={styles.totalsCard} aria-label="Totals">
            <header className={styles.totalsHead}>
              <p className={styles.eyebrow}>Totals</p>
              {order.couponCode ? (
                <Tooltip title="Coupon applied" arrow>
                  <span className={styles.couponChip}>{order.couponCode}</span>
                </Tooltip>
              ) : null}
            </header>
            <dl className={styles.totalsList}>
              <div className={styles.totalsRow}>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.subtotal, currency)}</dd>
              </div>
              {Number(order.discount) > 0 ? (
                <div className={styles.totalsRow}>
                  <dt>Discount</dt>
                  <dd className={styles.discount}>
                    −{formatCurrency(order.discount, currency)}
                  </dd>
                </div>
              ) : null}
              <div className={styles.totalsRow}>
                <dt>Tax</dt>
                <dd>{formatCurrency(order.tax, currency)}</dd>
              </div>
              <div className={[styles.totalsRow, styles.totalsTotal].join(' ')}>
                <dt>Total</dt>
                <dd>{formatCurrency(order.total, currency)}</dd>
              </div>
              {refundedAmount > 0 ? (
                <div className={styles.totalsRow}>
                  <dt>Refunded</dt>
                  <dd className={styles.discount}>
                    −{formatCurrency(refundedAmount, currency)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </aside>
      </div>

      <MarkPaidDialog
        open={showMarkPaid}
        onClose={() => !isPaymentSaving && setShowMarkPaid(false)}
        onSubmit={handleMarkPaid}
        order={order}
        isSaving={isPaymentSaving}
      />
      <RefundDialog
        open={showRefund}
        onClose={() => !isPaymentSaving && setShowRefund(false)}
        onSubmit={handleRefund}
        order={order}
        isSaving={isPaymentSaving}
      />
      <CancelDialog
        open={showCancel}
        onClose={() => !isStatusSaving && setShowCancel(false)}
        onSubmit={handleCancel}
        order={order}
        isSaving={isStatusSaving}
      />
    </>
  );
}

export default OrderDetailPage;
