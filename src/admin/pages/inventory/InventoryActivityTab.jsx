import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';

import { PATHS } from '../../../routes/paths.js';
import { formatDate } from '../../../utils/format.js';
import {
  INVENTORY_REASON_LABELS,
  INVENTORY_REASON_OPTIONS,
} from '../../features/inventory/inventoryStatus.js';
import useInventoryActivity from '../../features/inventory/useInventoryActivity.js';

import styles from './InventoryActivityTab.module.css';

const PAGE_SIZE_OPTIONS = [25, 50, 100];
const SEARCH_DEBOUNCE_MS = 250;

const REASON_FILTER_OPTIONS = [
  { value: '', label: 'All reasons' },
  ...INVENTORY_REASON_OPTIONS,
  { value: 'manual_adjustment', label: 'Manual adjustment' },
  { value: 'return', label: 'Return' },
  { value: 'order_fulfillment', label: 'Order fulfillment' },
];

function NoRowsOverlay() {
  return (
    <div className={styles.overlay}>
      <EmptyState
        icon={<HistoryRoundedIcon fontSize="large" />}
        title="No activity yet"
        description="Stock changes and adjustments will appear here."
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

function InventoryActivityTab() {
  const [q, setQ] = useState('');
  const [localQ, setLocalQ] = useState('');
  const [reason, setReason] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  useEffect(() => {
    if (localQ === q) return undefined;
    const id = setTimeout(() => {
      setQ(localQ);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const params = useMemo(
    () => ({
      q: q || undefined,
      reason: reason || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      perPage,
    }),
    [q, reason, from, to, page, perPage],
  );

  const { items, meta, error, isLoading, refetch } = useInventoryActivity(params);

  const columns = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: 'When',
        width: 140,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{formatDate(row.createdAt, 'dd MMM yyyy HH:mm')}</span>
        ),
      },
      {
        field: 'productName',
        headerName: 'Product',
        flex: 1.4,
        minWidth: 200,
        renderCell: ({ row }) =>
          row.productSlug ? (
            <Link
              component={RouterLink}
              to={PATHS.product(row.productSlug)}
              className={styles.nameLink}
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              {row.productName || `#${row.productId}`}
            </Link>
          ) : (
            <span>{row.productName || `#${row.productId}`}</span>
          ),
      },
      {
        field: 'delta',
        headerName: 'Delta',
        width: 110,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => {
          const value = Number(row.delta) || 0;
          const isPositive = value > 0;
          const Icon = isPositive ? TrendingUpRoundedIcon : TrendingDownRoundedIcon;
          const cls = [
            styles.delta,
            isPositive ? styles.deltaUp : styles.deltaDown,
          ].join(' ');
          return (
            <span className={cls}>
              <Icon fontSize="inherit" />
              {isPositive ? `+${value}` : value}
            </span>
          );
        },
      },
      {
        field: 'reason',
        headerName: 'Reason',
        width: 160,
        renderCell: ({ row }) => (
          <span className={styles.muted}>
            {INVENTORY_REASON_LABELS[row.reason] || row.reason || '—'}
          </span>
        ),
      },
      {
        field: 'note',
        headerName: 'Note',
        flex: 1.2,
        minWidth: 180,
        renderCell: ({ row }) => {
          const text = row.note || '';
          if (!text) return <span className={styles.muted}>—</span>;
          return (
            <Tooltip title={text} placement="top" arrow enterDelay={200}>
              <span className={styles.note}>{text}</span>
            </Tooltip>
          );
        },
      },
      {
        field: 'userName',
        headerName: 'User',
        width: 140,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{row.userName || '—'}</span>
        ),
      },
    ],
    [],
  );

  const total = Number(meta?.total) || items.length;
  const paginationModel = { page: Math.max(0, page - 1), pageSize: perPage };
  const onPaginationModelChange = (next) => {
    setPage(next.page + 1);
    setPerPage(next.pageSize);
  };

  return (
    <section>
      <div className={styles.toolbar} role="search" aria-label="Filter activity">
        <div className={styles.searchCell}>
          <AppTextField
            aria-label="Search activity"
            placeholder="Search product, SKU, or note…"
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
                      setQ('');
                    }}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </div>

        <div className={styles.filterCell}>
          <AppSelect
            label="Reason"
            size="small"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setPage(1);
            }}
            options={REASON_FILTER_OPTIONS}
          />
        </div>

        <div className={styles.filterCell}>
          <AppTextField
            label="From"
            size="small"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
          />
        </div>

        <div className={styles.filterCell}>
          <AppTextField
            label="To"
            size="small"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </div>

      <div className={styles.gridWrap} data-admin-grid-wrap>
        {error && !isLoading ? (
          <div className={styles.errorWrap}>
            <ErrorState
              title="Could not load activity"
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
          rowHeight={56}
          columnHeaderHeight={48}
          disableRowSelectionOnClick
          paginationMode="server"
          rowCount={total}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          slots={{
            noRowsOverlay: NoRowsOverlay,
            loadingOverlay: LoadingOverlay,
          }}
          slotProps={{ loadingOverlay: { variant: 'linear-progress' } }}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.paper',
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
    </section>
  );
}

export default InventoryActivityTab;
