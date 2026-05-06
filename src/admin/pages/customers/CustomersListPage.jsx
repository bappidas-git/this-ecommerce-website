import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppSwitch from '../../../components/common/AppSwitch/AppSwitch.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { PATHS } from '../../../routes/paths.js';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format.js';

import useCustomersUrlState, {
  SORT_PRESETS,
  presetValue,
} from '../../features/customers/useCustomersUrlState.js';
import useAdminCustomers from '../../features/customers/useAdminCustomers.js';

import styles from './CustomersListPage.module.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const SEARCH_DEBOUNCE_MS = 250;

function buildServiceParams(state) {
  const params = {
    page: state.page,
    perPage: state.per_page,
    sortBy: state.sort_by,
    sortDir: state.sort_dir,
  };
  if (state.q) params.q = state.q;
  if (state.has_orders === 'true' || state.has_orders === true) {
    params.hasOrders = true;
  }
  if (state.newsletter === 'true' || state.newsletter === true) {
    params.newsletter = true;
  }
  return params;
}

function NoRowsOverlay() {
  return (
    <div className={styles.overlay}>
      <EmptyState
        icon={<PeopleOutlineRoundedIcon fontSize="large" />}
        title="No customers match"
        description="Try adjusting filters or clearing search."
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

function buildErrorOverlay(onRetry, message) {
  return function GridErrorOverlay() {
    return (
      <div className={styles.overlay}>
        <ErrorState
          title="Could not load customers"
          description={message || 'Please try again.'}
          onRetry={onRetry}
        />
      </div>
    );
  };
}

function avatarUrl(customer) {
  if (customer?.avatar) return customer.avatar;
  const initials =
    `${(customer?.firstName || '')[0] || ''}${(customer?.lastName || '')[0] || ''}`.toUpperCase() ||
    'TI';
  return `https://placehold.co/64x64/B8924F/F7F3ED?text=${encodeURIComponent(
    initials,
  )}&font=playfair`;
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
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

function CustomersListPage() {
  const navigate = useNavigate();
  const toast = useToast();

  useAdminBreadcrumbs([{ label: 'People' }, { label: 'Customers' }]);

  const { state, update, reset } = useCustomersUrlState();
  const params = useMemo(() => buildServiceParams(state), [state]);
  const { items, meta, error, isLoading, refetch } = useAdminCustomers(params);

  const total = Number(meta?.total) || items.length;

  const [localQ, setLocalQ] = useState(state.q || '');
  useEffect(() => {
    setLocalQ(state.q || '');
  }, [state.q]);
  useEffect(() => {
    if (localQ === (state.q || '')) return undefined;
    const id = setTimeout(() => update({ q: localQ }, { resetPage: true }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const [menu, setMenu] = useState(null); // { row, anchorEl }
  const openMenu = (row, event) => setMenu({ row, anchorEl: event.currentTarget });
  const closeMenu = () => setMenu(null);

  const handleExport = useCallback(() => {
    const headers = [
      'name',
      'email',
      'joined_at',
      'orders_count',
      'lifetime_value',
      'last_order_at',
    ];
    const lines = [headers.join(',')];
    for (const r of items) {
      lines.push([
        csvCell(r.name),
        csvCell(r.email),
        csvCell(r.joinedAt),
        csvCell(r.ordersCount),
        csvCell(r.lifetimeValue),
        csvCell(r.lastOrderAt),
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    downloadBlob(blob, `customers-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Exported customers as CSV');
  }, [items, toast]);

  const onSortPreset = (event) => {
    const preset = SORT_PRESETS.find((p) => p.value === event.target.value);
    if (!preset) return;
    update({ sort_by: preset.sort_by, sort_dir: preset.sort_dir }, { resetPage: true });
  };

  const columns = useMemo(
    () => [
      {
        field: 'avatar',
        headerName: '',
        width: 64,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => (
          <img
            className={styles.avatar}
            src={avatarUrl(row)}
            alt=""
            width={36}
            height={36}
            loading="lazy"
          />
        ),
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1.1,
        minWidth: 180,
        renderCell: ({ row }) => (
          <Link
            component={RouterLink}
            to={PATHS.admin.customerDetail(row.id)}
            className={styles.nameLink}
            underline="hover"
          >
            {row.name}
          </Link>
        ),
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1.2,
        minWidth: 200,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{row.email}</span>
        ),
      },
      {
        field: 'joinedAt',
        headerName: 'Joined',
        width: 130,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{formatDate(row.joinedAt)}</span>
        ),
      },
      {
        field: 'ordersCount',
        headerName: 'Orders',
        width: 100,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <span className={styles.mono}>{formatNumber(row.ordersCount)}</span>
        ),
      },
      {
        field: 'lifetimeValue',
        headerName: 'Lifetime value',
        width: 150,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <span className={styles.totalMono}>
            {formatCurrency(row.lifetimeValue, row.currency)}
          </span>
        ),
      },
      {
        field: 'lastSeenAt',
        headerName: 'Last seen',
        width: 130,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{formatDate(row.lastSeenAt)}</span>
        ),
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
              aria-label={`Actions for ${row.name}`}
              className={styles.iconBtn}
              onClick={(e) => openMenu(row, e)}
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
    page: Math.max(0, (state.page || 1) - 1),
    pageSize: state.per_page,
  };

  const sortModel = state.sort_by
    ? [{ field: state.sort_by, sort: state.sort_dir === 'asc' ? 'asc' : 'desc' }]
    : [];

  const onPaginationModelChange = (next) =>
    update({ page: next.page + 1, per_page: next.pageSize });

  const onSortModelChange = (next) => {
    if (!next || next.length === 0) {
      update({ sort_by: 'joinedAt', sort_dir: 'desc', page: 1 });
      return;
    }
    const [first] = next;
    update({
      sort_by: first.field,
      sort_dir: first.sort === 'asc' ? 'asc' : 'desc',
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(
    state.q || state.has_orders || state.newsletter,
  );

  const ErrorOverlay = useMemo(
    () => buildErrorOverlay(refetch, error?.message),
    [refetch, error?.message],
  );

  return (
    <>
      <Seo title="Customers | Admin" noindex />
      <AdminPageHeader
        eyebrow="People"
        title="Customers"
        description="Browse, segment, and manage the people who shop with us."
        actions={
          <div className={styles.headerActions}>
            <AppButton
              variant="ghost"
              size="small"
              icon={<FileDownloadRoundedIcon fontSize="small" />}
              onClick={handleExport}
            >
              Export CSV
            </AppButton>
          </div>
        }
      />

      <div className={styles.toolbar} role="search" aria-label="Filter customers">
        <div className={styles.searchCell}>
          <AppTextField
            aria-label="Search customers"
            placeholder="Search by name or email…"
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
                    onClick={() => {
                      setLocalQ('');
                      update({ q: '' }, { resetPage: true });
                    }}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </div>

        <div className={styles.toggleCell}>
          <AppSwitch
            label="Has orders"
            checked={state.has_orders === 'true' || state.has_orders === true}
            onChange={(e) =>
              update(
                { has_orders: e.target.checked ? 'true' : '' },
                { resetPage: true },
              )
            }
          />
        </div>

        <div className={styles.toggleCell}>
          <AppSwitch
            label="Newsletter subscribers"
            checked={state.newsletter === 'true' || state.newsletter === true}
            onChange={(e) =>
              update(
                { newsletter: e.target.checked ? 'true' : '' },
                { resetPage: true },
              )
            }
          />
        </div>

        <div className={styles.sortCell}>
          <AppSelect
            label="Sort by"
            size="small"
            value={presetValue(state)}
            onChange={onSortPreset}
            options={SORT_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
          />
        </div>

        {hasActiveFilters ? (
          <button type="button" className={styles.resetBtn} onClick={reset}>
            Clear filters
          </button>
        ) : null}
      </div>

      <div className={styles.gridWrap}>
        {error && !isLoading ? (
          <div className={styles.errorWrap}>
            <ErrorState
              title="Could not load customers"
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
            if (menu?.row) navigate(PATHS.admin.customerDetail(menu.row.id));
            closeMenu();
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" className={styles.menuIcon} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu?.row?.email) {
              window.location.href = `mailto:${menu.row.email}`;
            }
            closeMenu();
          }}
        >
          <EmailOutlinedIcon fontSize="small" className={styles.menuIcon} />
          Email
        </MenuItem>
      </Menu>
    </>
  );
}

export default CustomersListPage;
