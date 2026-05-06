import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import Rating from '../../../components/common/Rating/Rating.jsx';
import AddressCard from '../../../features/account/components/AddressCard.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { PATHS } from '../../../routes/paths.js';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format.js';
import { adminCustomerService } from '../../../api/services/admin/adminCustomerService.js';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_PILL,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_PILL,
} from '../../features/orders/orderStatus.js';

import CustomerNotesTimeline from './CustomerNotesTimeline.jsx';
import styles from './CustomerDetailPage.module.css';

const REVIEW_STATUS_PILL = {
  pending: 'pending',
  published: 'completed',
  rejected: 'cancelled',
  hidden: 'cancelled',
};

const REVIEW_STATUS_LABEL = {
  pending: 'Pending',
  published: 'Published',
  rejected: 'Rejected',
  hidden: 'Hidden',
};

function avatarUrl(customer) {
  if (customer?.avatar) return customer.avatar;
  const initials =
    `${(customer?.firstName || '')[0] || ''}${(customer?.lastName || '')[0] || ''}`.toUpperCase() ||
    'TI';
  return `https://placehold.co/200x200/B8924F/F7F3ED?text=${encodeURIComponent(
    initials,
  )}&font=playfair`;
}

function StatCard({ label, value }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function DisableDialog({ open, onClose, onConfirm, customer, isSaving }) {
  if (!customer) return null;
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Disable this account?"
      description="The customer will no longer be able to sign in. You can re-enable the account later."
      actions={
        <>
          <AppButton variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton variant="danger" onClick={onConfirm} loading={isSaving}>
            Disable account
          </AppButton>
        </>
      }
    >
      <p className={styles.confirmText}>
        You&apos;re about to disable <strong>{customer.name}</strong>{' '}
        ({customer.email}).
      </p>
    </AppDialog>
  );
}

function OrdersTab({ orders }) {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        field: 'number',
        headerName: 'Number',
        width: 160,
        renderCell: ({ row }) => (
          <Link
            component={RouterLink}
            to={PATHS.admin.orderDetail(row.id)}
            className={styles.numberLink}
            underline="hover"
          >
            {row.number}
          </Link>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Date',
        width: 130,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{formatDate(row.createdAt)}</span>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: ({ row }) => (
          <StatusPill
            status={ORDER_STATUS_PILL[row.status] || row.status}
            label={ORDER_STATUS_LABELS[row.status] || row.status}
          />
        ),
      },
      {
        field: 'paymentStatus',
        headerName: 'Payment',
        width: 130,
        renderCell: ({ row }) => (
          <StatusPill
            status={PAYMENT_STATUS_PILL[row.paymentStatus] || 'pending'}
            label={PAYMENT_STATUS_LABELS[row.paymentStatus] || row.paymentStatus}
          />
        ),
      },
      {
        field: 'itemsCount',
        headerName: 'Items',
        width: 90,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <span className={styles.mono}>{formatNumber(row.itemsCount)}</span>
        ),
      },
      {
        field: 'total',
        headerName: 'Total',
        flex: 1,
        minWidth: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <span className={styles.totalMono}>
            {formatCurrency(row.total, row.currency)}
          </span>
        ),
      },
    ],
    [],
  );

  if (!orders.length) {
    return (
      <EmptyState
        icon={<ReceiptLongOutlinedIcon fontSize="large" />}
        title="No orders yet"
        description="When this customer places an order, it will appear here."
      />
    );
  }

  return (
    <div className={styles.gridWrap}>
      <DataGrid
        rows={orders}
        columns={columns}
        getRowId={(r) => r.id}
        rowHeight={56}
        columnHeaderHeight={48}
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        onRowClick={({ row }) => navigate(PATHS.admin.orderDetail(row.id))}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          '& .MuiDataGrid-row': { cursor: 'pointer' },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(184, 146, 79, 0.04)',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.default',
            borderBottom: '1px solid #243030',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontSize: '0.6875rem',
            color: 'text.secondary',
          },
          '& .MuiDataGrid-cell': { borderColor: 'divider' },
        }}
      />
    </div>
  );
}

function AddressesTab({ addresses }) {
  if (!addresses.length) {
    return (
      <EmptyState
        icon={<HomeWorkOutlinedIcon fontSize="large" />}
        title="No saved addresses"
        description="Customers can add and manage addresses from their account."
      />
    );
  }
  return (
    <div className={styles.addressGrid}>
      {addresses.map((addr) => (
        <AddressCard key={addr.id} address={addr} readOnly />
      ))}
    </div>
  );
}

function ReviewsTab({ reviews }) {
  if (!reviews.length) {
    return (
      <EmptyState
        icon={<StarOutlineRoundedIcon fontSize="large" />}
        title="No reviews yet"
        description="Reviews this customer leaves will appear here."
      />
    );
  }
  return (
    <ul className={styles.reviewList}>
      {reviews.map((r) => (
        <li key={r.id} className={styles.reviewItem}>
          <header className={styles.reviewHead}>
            <div className={styles.reviewProduct}>
              {r.productSlug ? (
                <RouterLink
                  to={PATHS.product(r.productSlug)}
                  className={styles.reviewProductLink}
                >
                  {r.productName || 'Product'}
                </RouterLink>
              ) : (
                <span>{r.productName || 'Product'}</span>
              )}
              <Rating value={r.rating} size="sm" />
            </div>
            <div className={styles.reviewMeta}>
              <StatusPill
                status={REVIEW_STATUS_PILL[r.status] || 'pending'}
                label={REVIEW_STATUS_LABEL[r.status] || r.status}
              />
              <span className={styles.reviewDate}>{formatDate(r.createdAt)}</span>
            </div>
          </header>
          {r.title ? <h3 className={styles.reviewTitle}>{r.title}</h3> : null}
          {r.body ? <p className={styles.reviewBody}>{r.body}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('customers');

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState('orders');
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  useAdminBreadcrumbs(
    customer
      ? [
          { label: 'People' },
          { label: 'Customers', to: PATHS.admin.customers },
          { label: customer.name },
        ]
      : [
          { label: 'People' },
          { label: 'Customers', to: PATHS.admin.customers },
          { label: 'Customer' },
        ],
  );

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await adminCustomerService.getById(id);
      setCustomer(data || null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleAddNote = useCallback(
    async ({ body }) => {
      if (!customer) return;
      setIsNoteSaving(true);
      const previous = customer;
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        ...customer,
        notes: [
          {
            id: tempId,
            body,
            author: { id: null, name: 'You', role: 'admin' },
            createdAt: new Date().toISOString(),
          },
          ...(customer.notes || []),
        ],
      };
      setCustomer(optimistic);
      try {
        const updated = await adminCustomerService.addNote(customer.id, { body });
        setCustomer(updated);
        toast.success('Note added');
      } catch (err) {
        setCustomer(previous);
        toast.error(err?.message || 'Could not add note');
        throw err;
      } finally {
        setIsNoteSaving(false);
      }
    },
    [customer, toast],
  );

  const handleSendReset = useCallback(async () => {
    if (!customer) return;
    setIsResetting(true);
    try {
      await adminCustomerService.sendPasswordReset(customer.id);
      toast.success(`Password reset sent to ${customer.email}`);
    } catch (err) {
      toast.error(err?.message || 'Could not send password reset');
    } finally {
      setIsResetting(false);
    }
  }, [customer, toast]);

  const handleDisable = useCallback(async () => {
    if (!customer) return;
    setIsDisabling(true);
    try {
      const updated = await adminCustomerService.disable(customer.id, {
        disabled: true,
      });
      setCustomer(updated);
      toast.success('Account disabled');
      setShowDisable(false);
    } catch (err) {
      toast.error(err?.message || 'Could not disable account');
    } finally {
      setIsDisabling(false);
    }
  }, [customer, toast]);

  if (isLoading && !customer) {
    return (
      <>
        <Seo title="Customer | Admin" noindex />
        <div className={styles.loadingWrap}>
          <LinearProgress />
        </div>
      </>
    );
  }

  if (loadError && !customer) {
    return (
      <>
        <Seo title="Customer | Admin" noindex />
        <ErrorState
          title="Could not load customer"
          description={loadError?.message || 'Please try again.'}
          onRetry={fetchCustomer}
        />
      </>
    );
  }

  if (!customer) {
    return (
      <>
        <Seo title="Customer | Admin" noindex />
        <EmptyState
          title="Customer not found"
          description="They may have been removed or you may not have access."
          cta={
            <AppButton variant="ghost" onClick={() => navigate(PATHS.admin.customers)}>
              Back to customers
            </AppButton>
          }
        />
      </>
    );
  }

  const stats = customer.stats || {};

  return (
    <>
      <Seo title={`${customer.name} | Customers | Admin`} noindex />
      <AdminPageHeader eyebrow="People" title="Customer" />

      <section className={styles.hero} aria-label="Customer profile">
        <img
          className={styles.heroAvatar}
          src={avatarUrl(customer)}
          alt=""
          width={64}
          height={64}
        />
        <div className={styles.heroText}>
          <div className={styles.heroLine}>
            <h1 className={styles.heroName}>{customer.name}</h1>
            <span className={styles.rolePill}>Customer</span>
            {customer.disabled ? (
              <span className={styles.disabledPill}>Disabled</span>
            ) : null}
          </div>
          <p className={styles.heroEmail}>
            <a href={`mailto:${customer.email}`}>{customer.email}</a>
          </p>
          <p className={styles.heroJoined}>
            Joined {formatDate(customer.joinedAt)}
            {customer.phone ? ` • ${customer.phone}` : ''}
          </p>
        </div>
        {canWrite ? (
          <div className={styles.heroActions}>
            <AppButton
              variant="ghost"
              size="small"
              icon={<LockResetRoundedIcon fontSize="small" />}
              onClick={handleSendReset}
              loading={isResetting}
            >
              Send password reset
            </AppButton>
            <AppButton
              variant="ghost"
              size="small"
              icon={<BlockRoundedIcon fontSize="small" />}
              onClick={() => setShowDisable(true)}
              disabled={customer.disabled}
              className={styles.disableBtn}
            >
              {customer.disabled ? 'Account disabled' : 'Disable account'}
            </AppButton>
          </div>
        ) : null}
      </section>

      <section className={styles.statRow} aria-label="Customer summary">
        <StatCard
          label="Lifetime value"
          value={formatCurrency(stats.lifetimeValue, customer.currency)}
        />
        <StatCard label="Orders" value={formatNumber(stats.ordersCount || 0)} />
        <StatCard
          label="Average order"
          value={formatCurrency(stats.aov, customer.currency)}
        />
        <StatCard
          label="Last order"
          value={stats.lastOrderAt ? formatDate(stats.lastOrderAt) : '—'}
        />
      </section>

      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        className={styles.tabs}
        aria-label="Customer details"
        TabIndicatorProps={{ className: styles.tabIndicator }}
      >
        <Tab
          value="orders"
          label={`Orders (${(customer.orders || []).length})`}
          className={styles.tab}
        />
        <Tab
          value="addresses"
          label={`Addresses (${(customer.addresses || []).length})`}
          className={styles.tab}
        />
        <Tab
          value="reviews"
          label={`Reviews (${(customer.reviews || []).length})`}
          className={styles.tab}
        />
        <Tab
          value="notes"
          label={`Notes (${(customer.notes || []).length})`}
          className={styles.tab}
        />
      </Tabs>

      <div className={styles.tabPanel} role="tabpanel">
        {tab === 'orders' ? <OrdersTab orders={customer.orders || []} /> : null}
        {tab === 'addresses' ? (
          <AddressesTab addresses={customer.addresses || []} />
        ) : null}
        {tab === 'reviews' ? <ReviewsTab reviews={customer.reviews || []} /> : null}
        {tab === 'notes' ? (
          <CustomerNotesTimeline
            notes={customer.notes || []}
            canWrite={canWrite}
            onAdd={handleAddNote}
            isSaving={isNoteSaving}
          />
        ) : null}
      </div>

      <DisableDialog
        open={showDisable}
        onClose={() => !isDisabling && setShowDisable(false)}
        onConfirm={handleDisable}
        customer={customer}
        isSaving={isDisabling}
      />
    </>
  );
}

export default CustomerDetailPage;
