import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format.js';
import { adminCouponService } from '../../../api/services/admin/adminCouponService.js';
import { adminCategoryService } from '../../../api/services/admin/adminCategoryService.js';
import { adminProductService } from '../../../api/services/admin/adminProductService.js';

import useAdminCoupons from '../../features/coupons/useAdminCoupons.js';
import computeCouponStatus, {
  COUPON_STATUS_LABEL,
  COUPON_STATUS_TONE,
} from '../../utils/computeCouponStatus.js';
import CouponFormDialog from './CouponFormDialog.jsx';

import styles from './CouponsListPage.module.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const SEARCH_DEBOUNCE_MS = 250;

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'expired', label: 'Expired' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'out_of_uses', label: 'Out of uses' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'percent', label: 'Percent' },
  { value: 'fixed', label: 'Fixed' },
];

const SCOPE_LABEL = {
  all: 'All',
  categories: 'Categories',
  products: 'Products',
};

function NoRowsOverlay() {
  return (
    <div className={styles.overlay}>
      <EmptyState
        icon={<LocalOfferOutlinedIcon fontSize="large" />}
        title="No coupons match"
        description="Try adjusting filters or create your first coupon."
      />
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className={styles.loadingOverlay}>
      <LinearProgress />
    </div>
  );
}

function CouponStatusPill({ coupon }) {
  const status = coupon.status || computeCouponStatus(coupon);
  const tone = COUPON_STATUS_TONE[status] || 'muted';
  const label = COUPON_STATUS_LABEL[status] || status;
  return <StatusPill status={status} label={label} className={styles[`tone_${tone}`]} />;
}

function CouponsListPage() {
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('coupons');

  useAdminBreadcrumbs([{ label: 'Sales' }, { label: 'Coupons' }]);

  const [filters, setFilters] = useState({
    q: '',
    status: '',
    type: '',
    page: 1,
    per_page: 25,
    sort_by: 'startsAt',
    sort_dir: 'desc',
  });
  const [localQ, setLocalQ] = useState('');

  useEffect(() => {
    if (localQ === filters.q) return undefined;
    const id = setTimeout(
      () => setFilters((s) => ({ ...s, q: localQ, page: 1 })),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const params = useMemo(
    () => ({
      page: filters.page,
      perPage: filters.per_page,
      sortBy: filters.sort_by,
      sortDir: filters.sort_dir,
      q: filters.q || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
    }),
    [filters],
  );

  const { items, meta, error, isLoading, refetch, setItems } = useAdminCoupons(params);
  const total = Number(meta?.total) || items.length;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingTargets, setLoadingTargets] = useState(false);

  const ensureTargetsLoaded = useCallback(async () => {
    if (categories.length && products.length) return;
    setLoadingTargets(true);
    try {
      const [cats, prods] = await Promise.all([
        adminCategoryService.list({ perPage: 500 }),
        adminProductService.list({ perPage: 500 }),
      ]);
      setCategories(Array.isArray(cats?.items) ? cats.items : []);
      setProducts(Array.isArray(prods?.items) ? prods.items : []);
    } catch (err) {
      toast.error(err?.message || 'Could not load targets.');
    } finally {
      setLoadingTargets(false);
    }
  }, [categories.length, products.length, toast]);

  const [dialog, setDialog] = useState(null); // { mode, coupon }
  const [menu, setMenu] = useState(null);
  const [deleteState, setDeleteState] = useState(null);

  const openCreate = useCallback(() => {
    if (!canWrite) return;
    ensureTargetsLoaded();
    setDialog({ mode: 'create', coupon: null });
  }, [canWrite, ensureTargetsLoaded]);

  const openEdit = useCallback(
    (coupon) => {
      ensureTargetsLoaded();
      setDialog({ mode: 'edit', coupon });
    },
    [ensureTargetsLoaded],
  );

  const closeDialog = useCallback(() => setDialog(null), []);

  const handleSubmit = useCallback(
    async (payload) => {
      if (dialog?.mode === 'create') {
        const created = await adminCouponService.create(payload);
        toast.success(`Coupon ${created?.code || ''} created.`);
        setDialog(null);
        refetch();
      } else if (dialog?.coupon?.id) {
        const updated = await adminCouponService.update(
          dialog.coupon.id,
          payload,
        );
        toast.success(`Coupon ${updated?.code || ''} updated.`);
        setItems((rows) =>
          rows.map((r) =>
            r.id === dialog.coupon.id
              ? { ...r, ...updated, status: computeCouponStatus({ ...r, ...updated }) }
              : r,
          ),
        );
        setDialog(null);
      }
    },
    [dialog, refetch, setItems, toast],
  );

  const handleToggleActive = useCallback(
    async (coupon) => {
      if (!canWrite) return;
      const next = !coupon.isActive;
      // Optimistic
      setItems((rows) =>
        rows.map((r) =>
          r.id === coupon.id
            ? { ...r, isActive: next, status: computeCouponStatus({ ...r, isActive: next }) }
            : r,
        ),
      );
      try {
        await adminCouponService.update(coupon.id, { isActive: next });
        toast.success(`Coupon ${coupon.code} ${next ? 'enabled' : 'disabled'}.`);
      } catch (err) {
        // Revert
        setItems((rows) =>
          rows.map((r) =>
            r.id === coupon.id
              ? { ...r, isActive: !next, status: computeCouponStatus({ ...r, isActive: !next }) }
              : r,
          ),
        );
        toast.error(err?.message || 'Could not update coupon.');
      }
    },
    [canWrite, setItems, toast],
  );

  const openDelete = useCallback((coupon) => {
    setDeleteState({ coupon, deleting: false });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteState?.coupon) return;
    setDeleteState((s) => ({ ...s, deleting: true }));
    const id = deleteState.coupon.id;
    try {
      await adminCouponService.remove(id);
      setItems((rows) => rows.filter((r) => r.id !== id));
      toast.success(`Deleted “${deleteState.coupon.code}”.`);
      setDeleteState(null);
    } catch (err) {
      toast.error(err?.message || 'Could not delete coupon.');
      setDeleteState((s) => (s ? { ...s, deleting: false } : s));
    }
  }, [deleteState, setItems, toast]);

  const columns = useMemo(
    () => [
      {
        field: 'code',
        headerName: 'Code',
        flex: 1,
        minWidth: 160,
        renderCell: ({ row }) => (
          <span className={styles.codeMono}>{row.code}</span>
        ),
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 110,
        renderCell: ({ row }) => (
          <span className={styles.muted}>
            {row.type === 'percent' ? 'Percent' : 'Fixed'}
          </span>
        ),
      },
      {
        field: 'value',
        headerName: 'Value',
        width: 120,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <span className={styles.totalMono}>
            {row.type === 'percent'
              ? `${row.value}%`
              : formatCurrency(row.value)}
          </span>
        ),
      },
      {
        field: 'appliesTo',
        headerName: 'Scope',
        width: 130,
        renderCell: ({ row }) => (
          <span className={styles.muted}>
            {SCOPE_LABEL[row.appliesTo] || 'All'}
            {row.appliesTo !== 'all' && row.targetIds?.length
              ? ` (${row.targetIds.length})`
              : ''}
          </span>
        ),
      },
      {
        field: 'startsAt',
        headerName: 'Starts',
        width: 130,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{formatDate(row.startsAt)}</span>
        ),
      },
      {
        field: 'endsAt',
        headerName: 'Ends',
        width: 130,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{formatDate(row.endsAt)}</span>
        ),
      },
      {
        field: 'redeemedCount',
        headerName: 'Used / Max',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <span className={styles.mono}>
            {formatNumber(row.redeemedCount || 0)} /{' '}
            {row.maxRedemptions && row.maxRedemptions < 999999
              ? formatNumber(row.maxRedemptions)
              : '∞'}
          </span>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        sortable: false,
        renderCell: ({ row }) => <CouponStatusPill coupon={row} />,
      },
      {
        field: '__actions',
        headerName: '',
        width: 70,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Tooltip title="More actions" placement="top" arrow>
            <IconButton
              size="small"
              aria-label={`Actions for ${row.code}`}
              className={styles.iconBtn}
              onClick={(e) => setMenu({ row, anchorEl: e.currentTarget })}
            >
              <MoreVertRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  const paginationModel = {
    page: Math.max(0, (filters.page || 1) - 1),
    pageSize: filters.per_page,
  };

  const sortModel = filters.sort_by
    ? [{ field: filters.sort_by, sort: filters.sort_dir === 'asc' ? 'asc' : 'desc' }]
    : [];

  const onPaginationModelChange = (next) =>
    setFilters((s) => ({ ...s, page: next.page + 1, per_page: next.pageSize }));

  const onSortModelChange = (next) => {
    if (!next || next.length === 0) {
      setFilters((s) => ({ ...s, sort_by: 'startsAt', sort_dir: 'desc', page: 1 }));
      return;
    }
    const [first] = next;
    setFilters((s) => ({
      ...s,
      sort_by: first.field,
      sort_dir: first.sort === 'asc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const hasActiveFilters = Boolean(
    filters.q || filters.status || filters.type,
  );
  const resetFilters = () => {
    setLocalQ('');
    setFilters((s) => ({ ...s, q: '', status: '', type: '', page: 1 }));
  };

  const closeMenu = () => setMenu(null);
  const menuRow = menu?.row;

  return (
    <>
      <Seo title="Coupons | Admin" noindex />
      <AdminPageHeader
        eyebrow="Sales"
        title="Coupons"
        description="Create promo codes, schedule them, and target specific products."
        actions={
          canWrite ? (
            <AppButton
              variant="primary"
              size="small"
              icon={<AddRoundedIcon fontSize="small" />}
              onClick={openCreate}
            >
              New coupon
            </AppButton>
          ) : null
        }
      />

      <div className={styles.toolbar} role="search" aria-label="Filter coupons">
        <div className={styles.searchCell}>
          <AppTextField
            aria-label="Search coupons by code"
            placeholder="Search by code…"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: localQ ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear search"
                    size="small"
                    edge="end"
                    onClick={() => setLocalQ('')}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </div>

        <div className={styles.selectCell}>
          <AppSelect
            label="Status"
            size="small"
            value={filters.status}
            onChange={(e) =>
              setFilters((s) => ({ ...s, status: e.target.value, page: 1 }))
            }
            options={STATUS_OPTIONS}
          />
        </div>

        <div className={styles.selectCell}>
          <AppSelect
            label="Type"
            size="small"
            value={filters.type}
            onChange={(e) =>
              setFilters((s) => ({ ...s, type: e.target.value, page: 1 }))
            }
            options={TYPE_OPTIONS}
          />
        </div>

        {hasActiveFilters ? (
          <button type="button" className={styles.resetBtn} onClick={resetFilters}>
            Clear filters
          </button>
        ) : null}
      </div>

      <div className={styles.gridWrap}>
        {error && !isLoading ? (
          <div className={styles.errorWrap}>
            <ErrorState
              title="Could not load coupons"
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
            loadingOverlay: LoadingOverlay,
          }}
          slotProps={{
            loadingOverlay: { variant: 'linear-progress' },
          }}
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
            '& .MuiDataGrid-cell': { borderColor: 'divider' },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
            },
          }}
        />
      </div>

      <Menu
        open={Boolean(menu)}
        anchorEl={menu?.anchorEl || null}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menuRow) openEdit(menuRow);
            closeMenu();
          }}
        >
          <EditOutlinedIcon fontSize="small" className={styles.menuIcon} />
          Edit
        </MenuItem>
        {canWrite ? (
          <MenuItem
            onClick={() => {
              if (menuRow) handleToggleActive(menuRow);
              closeMenu();
            }}
          >
            {menuRow?.isActive ? (
              <ToggleOffOutlinedIcon fontSize="small" className={styles.menuIcon} />
            ) : (
              <ToggleOnOutlinedIcon fontSize="small" className={styles.menuIcon} />
            )}
            {menuRow?.isActive ? 'Disable' : 'Enable'}
          </MenuItem>
        ) : null}
        {canWrite ? (
          <MenuItem
            onClick={() => {
              if (menuRow) openDelete(menuRow);
              closeMenu();
            }}
          >
            <DeleteOutlineRoundedIcon fontSize="small" className={styles.menuIcon} />
            Delete
          </MenuItem>
        ) : null}
      </Menu>

      {dialog ? (
        <CouponFormDialog
          open
          mode={dialog.mode}
          coupon={dialog.coupon}
          categories={categories}
          products={products}
          loadingTargets={loadingTargets}
          disabled={!canWrite}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />
      ) : null}

      <AppDialog
        open={Boolean(deleteState)}
        onClose={deleteState?.deleting ? undefined : () => setDeleteState(null)}
        title="Delete coupon?"
        description="This action cannot be undone."
        size="sm"
        actions={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setDeleteState(null)}
              disabled={deleteState?.deleting}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="danger"
              onClick={confirmDelete}
              loading={deleteState?.deleting}
            >
              Delete
            </AppButton>
          </>
        }
      >
        <p>
          You are about to permanently delete{' '}
          <strong>{deleteState?.coupon?.code}</strong>.
        </p>
        {deleteState?.coupon?.redeemedCount > 0 ? (
          <p className={styles.warnText}>
            Heads up — this coupon has already been redeemed{' '}
            {formatNumber(deleteState.coupon.redeemedCount)} time
            {deleteState.coupon.redeemedCount === 1 ? '' : 's'}. Existing orders
            will keep the discount, but the code will no longer be available.
          </p>
        ) : null}
      </AppDialog>
    </>
  );
}

export default CouponsListPage;
