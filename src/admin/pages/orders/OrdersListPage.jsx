import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { PATHS } from '../../../routes/paths.js';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format.js';
import { adminOrderService } from '../../../api/services/admin/adminOrderService.js';

import useOrdersUrlState from '../../features/orders/useOrdersUrlState.js';
import useAdminOrders from '../../features/orders/useAdminOrders.js';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_PILL,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_PILL,
  nextStatusesFor,
} from '../../features/orders/orderStatus.js';

import OrdersStats from './OrdersStats.jsx';
import OrdersToolbar from './OrdersToolbar.jsx';
import QuickStatusPopover from './QuickStatusPopover.jsx';

import styles from './OrdersListPage.module.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function buildServiceParams(state) {
  const params = {
    page: state.page,
    perPage: state.per_page,
    sortBy: state.sort_by,
    sortDir: state.sort_dir,
  };
  if (state.q) params.q = state.q;
  if (state.status) params.status = state.status;
  if (state.payment_method) params.paymentMethod = state.payment_method;
  if (state.payment_status) params.paymentStatus = state.payment_status;
  if (state.from) params.from = state.from;
  if (state.to) params.to = state.to;
  return params;
}

function NoRowsOverlay() {
  return (
    <div className={styles.overlay}>
      <EmptyState
        icon={<ReceiptLongOutlinedIcon fontSize="large" />}
        title="No orders match"
        description="Try adjusting filters or clearing search."
      />
    </div>
  );
}

function buildErrorOverlay(onRetry, message) {
  return function GridErrorOverlay() {
    return (
      <div className={styles.overlay}>
        <ErrorState
          title="Could not load orders"
          description={message || 'Please try again.'}
          onRetry={onRetry}
        />
      </div>
    );
  };
}

function LoadingOverlay() {
  return (
    <div className={styles.loadingOverlay}>
      <LinearProgress />
    </div>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function OrdersListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('orders');

  useAdminBreadcrumbs([{ label: 'Sales' }, { label: 'Orders' }]);

  const { state, update, reset } = useOrdersUrlState();
  const params = useMemo(() => buildServiceParams(state), [state]);
  const { items, meta, error, isLoading, refetch, patchLocal } = useAdminOrders(params);

  const [popover, setPopover] = useState(null); // { row, anchorEl }
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const stats = meta?.stats || null;
  const total = Number(meta?.total) || items.length;

  const hasDateRange = Boolean(state.from && state.to);
  const statsCaption = hasDateRange
    ? null
    : 'Today\'s figures use today\'s date — apply a date range to scope to a specific window.';

  const openPopover = (row, event) => {
    setPopover({ row, anchorEl: event.currentTarget });
  };
  const closePopover = () => setPopover(null);

  const handleStatusUpdate = useCallback(
    async (payload) => {
      const row = popover?.row;
      if (!row) return;
      const previous = { status: row.status, updatedAt: row.updatedAt };
      patchLocal(row.id, { status: payload.status });
      setIsUpdating(true);
      try {
        const updated = await adminOrderService.updateStatus(row.id, payload);
        if (updated) patchLocal(row.id, updated);
        toast.success(
          `Order ${row.number} → ${ORDER_STATUS_LABELS[payload.status] || payload.status}`,
        );
        closePopover();
        refetch();
      } catch (err) {
        patchLocal(row.id, previous);
        toast.error(err?.message || 'Could not update status');
      } finally {
        setIsUpdating(false);
      }
    },
    [popover, patchLocal, refetch, toast],
  );

  const exportCsv = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await adminOrderService.exportCsv(params);
      const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadBlob(blob, filename);
    } catch (err) {
      toast.error(err?.message || 'Could not export CSV');
    } finally {
      setIsExporting(false);
    }
  }, [params, toast]);

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
        field: 'customerName',
        headerName: 'Customer',
        flex: 1.2,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <div className={styles.customerCell}>
            <span className={styles.customerName}>
              {row.customerName || '—'}
            </span>
            <span className={styles.customerEmail}>
              {row.customerEmail || '—'}
            </span>
          </div>
        ),
      },
      {
        field: 'total',
        headerName: 'Total',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <span className={styles.totalMono}>
            {formatCurrency(row.total, row.currency)}
          </span>
        ),
      },
      {
        field: 'paymentStatus',
        headerName: 'Payment',
        width: 130,
        sortable: false,
        renderCell: ({ row }) => (
          <Tooltip
            title={PAYMENT_METHOD_LABELS[row.paymentMethod] || row.paymentMethod || ''}
            arrow
            placement="top"
          >
            <span>
              <StatusPill
                status={PAYMENT_STATUS_PILL[row.paymentStatus] || 'pending'}
                label={PAYMENT_STATUS_LABELS[row.paymentStatus] || row.paymentStatus}
              />
            </span>
          </Tooltip>
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
        field: '__actions',
        headerName: '',
        width: 110,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => {
          const canTransition = canWrite && nextStatusesFor(row.status).length > 0;
          return (
            <div className={styles.rowActions}>
              <Tooltip title="View order" placement="top" arrow>
                <IconButton
                  size="small"
                  aria-label={`View ${row.number}`}
                  className={styles.iconBtn}
                  onClick={() => navigate(PATHS.admin.orderDetail(row.id))}
                >
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {canTransition ? (
                <Tooltip title="Update status" placement="top" arrow>
                  <IconButton
                    size="small"
                    aria-label={`Update status for ${row.number}`}
                    className={styles.iconBtn}
                    onClick={(e) => openPopover(row, e)}
                  >
                    <SwapHorizRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
            </div>
          );
        },
      },
    ],
    [canWrite, navigate],
  );

  const paginationModel = {
    page: Math.max(0, (state.page || 1) - 1),
    pageSize: state.per_page,
  };

  const sortModel = state.sort_by
    ? [{ field: state.sort_by, sort: state.sort_dir === 'asc' ? 'asc' : 'desc' }]
    : [];

  const onPaginationModelChange = (next) => {
    update({ page: next.page + 1, per_page: next.pageSize });
  };

  const onSortModelChange = (next) => {
    if (!next || next.length === 0) {
      update({ sort_by: 'createdAt', sort_dir: 'desc', page: 1 });
      return;
    }
    const [first] = next;
    update({
      sort_by: first.field,
      sort_dir: first.sort === 'asc' ? 'asc' : 'desc',
      page: 1,
    });
  };

  const onSearch = (q) => update({ q }, { resetPage: true });
  const onStatus = (v) => update({ status: v }, { resetPage: true });
  const onPaymentMethod = (v) => update({ payment_method: v }, { resetPage: true });
  const onPaymentStatus = (v) => update({ payment_status: v }, { resetPage: true });
  const onDateRange = ({ from, to }) =>
    update({ from, to }, { resetPage: true });

  const hasActiveFilters = Boolean(
    state.q ||
      state.status ||
      state.payment_method ||
      state.payment_status ||
      state.from ||
      state.to,
  );

  const ErrorOverlay = useMemo(
    () => buildErrorOverlay(refetch, error?.message),
    [refetch, error?.message],
  );

  return (
    <>
      <Seo title="Orders | Admin" noindex />
      <AdminPageHeader
        eyebrow="Sales"
        title="Orders"
        description="Track, fulfil, and manage customer orders."
        actions={
          <div className={styles.headerActions}>
            <AppButton
              variant="ghost"
              size="small"
              icon={<FileDownloadRoundedIcon fontSize="small" />}
              onClick={exportCsv}
              loading={isExporting}
            >
              Export CSV
            </AppButton>
          </div>
        }
      />

      <OrdersStats stats={stats} isLoading={isLoading} caption={statsCaption} />

      <OrdersToolbar
        search={state.q}
        onSearch={onSearch}
        status={state.status}
        onStatus={onStatus}
        paymentMethod={state.payment_method}
        onPaymentMethod={onPaymentMethod}
        paymentStatus={state.payment_status}
        onPaymentStatus={onPaymentStatus}
        from={state.from}
        to={state.to}
        onDateRange={onDateRange}
        onReset={reset}
        hasActiveFilters={hasActiveFilters}
      />

      <div className={styles.gridWrap} data-admin-grid-wrap>
        {error && !isLoading ? (
          <div className={styles.errorWrap}>
            <ErrorState
              title="Could not load orders"
              description={error?.message || 'Please try again.'}
              onRetry={refetch}
            />
          </div>
        ) : null}
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(r) => r.id}
          loading={isLoading}
          rowHeight={64}
          columnHeaderHeight={48}
          disableRowSelectionOnClick
          paginationMode="server"
          sortingMode="server"
          rowCount={total}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          slots={{
            noRowsOverlay: NoRowsOverlay,
            errorOverlay: ErrorOverlay,
            loadingOverlay: LoadingOverlay,
          }}
          slotProps={{
            loadingOverlay: { variant: 'linear-progress' },
          }}
          error={error || undefined}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.paper',
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
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(184, 146, 79, 0.04)',
            },
            '& .MuiDataGrid-cell': {
              borderColor: 'divider',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
            },
          }}
        />
      </div>

      <QuickStatusPopover
        open={Boolean(popover)}
        anchorEl={popover?.anchorEl || null}
        onClose={closePopover}
        row={popover?.row}
        onSubmit={handleStatusUpdate}
        isSaving={isUpdating}
      />
    </>
  );
}

export default OrdersListPage;
