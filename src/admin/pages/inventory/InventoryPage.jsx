import { useCallback, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { useCategories } from '../../../hooks/useCategories.js';
import { formatDate } from '../../../utils/format.js';
import { adminInventoryService } from '../../../api/services/admin/adminInventoryService.js';

import useAdminInventory from '../../features/inventory/useAdminInventory.js';
import {
  INVENTORY_STATUS_LABELS,
  INVENTORY_STATUS_PILL,
  deriveInventoryStatus,
} from '../../features/inventory/inventoryStatus.js';

import InventoryStats from './InventoryStats.jsx';
import InventoryToolbar from './InventoryToolbar.jsx';
import InventoryBulkBar from './InventoryBulkBar.jsx';
import AdjustStockPopover from './AdjustStockPopover.jsx';
import InventoryActivityTab from './InventoryActivityTab.jsx';

import styles from './InventoryPage.module.css';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const DEFAULT_FILTERS = {
  q: '',
  categoryId: '',
  status: '',
  sort: 'updatedAt:desc',
  page: 1,
  perPage: 25,
};

function NoRowsOverlay() {
  return (
    <div className={styles.overlay}>
      <EmptyState
        icon={<Inventory2OutlinedIcon fontSize="large" />}
        title="No products match"
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

function applyEdits(rows, edits) {
  if (!edits || Object.keys(edits).length === 0) return rows;
  return rows.map((row) => {
    const patch = edits[String(row.id)];
    if (!patch) return row;
    const merged = {
      ...row,
      ...(patch.stock !== undefined ? { stock: patch.stock } : {}),
      ...(patch.lowStockThreshold !== undefined
        ? { lowStockThreshold: patch.lowStockThreshold }
        : {}),
    };
    merged.status = deriveInventoryStatus(merged.stock, merged.lowStockThreshold);
    return merged;
  });
}

function InventoryPage() {
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('inventory');

  useAdminBreadcrumbs([{ label: 'Catalog' }, { label: 'Inventory' }]);

  const [tab, setTab] = useState('levels');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [edits, setEdits] = useState({});
  const [isSavingAll, setIsSavingAll] = useState(false);

  const [adjustState, setAdjustState] = useState(null); // { row, anchorEl }
  const [isAdjusting, setIsAdjusting] = useState(false);

  const apiRef = useGridApiRef();

  const [sortField, sortDir] = useMemo(() => {
    const [f, d] = (filters.sort || 'updatedAt:desc').split(':');
    return [f || 'updatedAt', d === 'asc' ? 'asc' : 'desc'];
  }, [filters.sort]);

  const params = useMemo(
    () => ({
      q: filters.q || undefined,
      categoryId: filters.categoryId || undefined,
      status: filters.status || undefined,
      sortBy: sortField,
      sortDir,
      page: filters.page,
      perPage: filters.perPage,
    }),
    [filters, sortField, sortDir],
  );

  const { items, meta, error, isLoading, refetch, patchLocal } = useAdminInventory(params);
  const { items: categories } = useCategories();

  const rows = useMemo(() => applyEdits(items, edits), [items, edits]);
  const stats = meta?.stats || { totalSkus: 0, out: 0, low: 0, healthy: 0 };
  const total = Number(meta?.total) || rows.length;
  const dirtyCount = Object.keys(edits).length;

  const updateFilter = (patch, { resetPage = false } = {}) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      page: resetPage ? 1 : prev.page,
    }));
  };

  const setRowEdit = useCallback((id, key, value) => {
    setEdits((prev) => {
      const next = { ...prev };
      const current = next[String(id)] || {};
      const item = items.find((r) => String(r.id) === String(id));
      const original = item ? Number(item[key]) : NaN;
      const numeric = Math.max(0, Math.floor(Number(value) || 0));
      if (Number.isFinite(original) && numeric === original) {
        const merged = { ...current };
        delete merged[key];
        if (Object.keys(merged).length === 0) delete next[String(id)];
        else next[String(id)] = merged;
      } else {
        next[String(id)] = { ...current, [key]: numeric };
      }
      return next;
    });
  }, [items]);

  const handleProcessRowUpdate = useCallback(
    (newRow, oldRow) => {
      if (!canWrite) return oldRow;
      if (newRow.stock !== oldRow.stock) {
        setRowEdit(newRow.id, 'stock', newRow.stock);
      }
      if (newRow.lowStockThreshold !== oldRow.lowStockThreshold) {
        setRowEdit(newRow.id, 'lowStockThreshold', newRow.lowStockThreshold);
      }
      return {
        ...newRow,
        status: deriveInventoryStatus(newRow.stock, newRow.lowStockThreshold),
      };
    },
    [canWrite, setRowEdit],
  );

  const discardEdits = () => setEdits({});

  const saveAll = useCallback(async () => {
    const ids = Object.keys(edits);
    if (ids.length === 0) return;
    setIsSavingAll(true);
    const itemsPayload = ids.map((id) => ({ productId: Number(id), ...edits[id] }));
    try {
      const result = await adminInventoryService.bulkUpdate(itemsPayload);
      const updated = Array.isArray(result?.updated) ? result.updated : [];
      const failures = Array.isArray(result?.failures) ? result.failures : [];
      for (const row of updated) {
        patchLocal(row.id, row);
      }
      const cleared = { ...edits };
      for (const row of updated) delete cleared[String(row.id)];
      setEdits(cleared);
      if (failures.length) {
        toast.error(
          `Saved ${updated.length} · ${failures.length} failed — please review and retry.`,
        );
      } else {
        toast.success(
          updated.length === 1
            ? 'Saved 1 change'
            : `Saved ${updated.length} changes`,
        );
      }
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Could not save changes');
    } finally {
      setIsSavingAll(false);
    }
  }, [edits, patchLocal, refetch, toast]);

  const openAdjust = (row, event) => {
    setAdjustState({ row, anchorEl: event.currentTarget });
  };
  const closeAdjust = () => setAdjustState(null);

  const submitAdjust = useCallback(
    async (payload) => {
      const row = adjustState?.row;
      if (!row) return;
      const previous = { stock: row.stock, status: row.status };
      const optimisticStock = Math.max(0, Number(row.stock || 0) + Number(payload.delta));
      patchLocal(row.id, {
        stock: optimisticStock,
        status: deriveInventoryStatus(optimisticStock, row.lowStockThreshold),
      });
      setIsAdjusting(true);
      try {
        const result = await adminInventoryService.adjust(row.id, payload);
        if (result?.row) patchLocal(row.id, result.row);
        toast.success('Stock adjusted');
        closeAdjust();
        refetch();
      } catch (err) {
        patchLocal(row.id, previous);
        toast.error(err?.message || 'Could not adjust stock');
      } finally {
        setIsAdjusting(false);
      }
    },
    [adjustState, patchLocal, refetch, toast],
  );

  const exportCsv = () => {
    const headers = [
      'id',
      'sku',
      'name',
      'category',
      'stock',
      'lowStockThreshold',
      'status',
      'updatedAt',
    ];
    const lines = [headers.join(',')];
    for (const r of rows) {
      const cells = [
        r.id,
        r.sku || '',
        `"${String(r.name || '').replace(/"/g, '""')}"`,
        `"${String(r.categoryName || '').replace(/"/g, '""')}"`,
        r.stock ?? '',
        r.lowStockThreshold ?? '',
        r.status || '',
        r.updatedAt || '',
      ];
      lines.push(cells.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(
    () => [
      {
        field: 'image',
        headerName: '',
        width: 64,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          const src =
            row.image ||
            'https://placehold.co/80x100/E5DED2/1B1A17?text=THIS&font=playfair';
          return (
            <img
              src={src}
              alt=""
              className={styles.thumb}
              loading="lazy"
              width={40}
              height={50}
            />
          );
        },
      },
      {
        field: 'name',
        headerName: 'Product',
        flex: 1.6,
        minWidth: 220,
        renderCell: ({ row }) => (
          <div className={styles.nameCell}>
            <span className={styles.nameText}>{row.name}</span>
            <span className={styles.sku}>{row.sku || '—'}</span>
          </div>
        ),
      },
      {
        field: 'categoryName',
        headerName: 'Category',
        width: 160,
        sortable: false,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{row.categoryName || '—'}</span>
        ),
      },
      {
        field: 'stock',
        headerName: 'Stock',
        width: 120,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        editable: canWrite,
        cellClassName: ({ id }) =>
          edits[String(id)]?.stock !== undefined ? styles.dirtyCell : '',
        renderCell: ({ row }) => (
          <span className={styles.mono}>{row.stock}</span>
        ),
      },
      {
        field: 'lowStockThreshold',
        headerName: 'Threshold',
        width: 130,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        editable: canWrite,
        cellClassName: ({ id }) =>
          edits[String(id)]?.lowStockThreshold !== undefined ? styles.dirtyCell : '',
        renderCell: ({ row }) => (
          <span className={styles.mono}>{row.lowStockThreshold}</span>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        sortable: false,
        renderCell: ({ row }) => (
          <StatusPill
            status={INVENTORY_STATUS_PILL[row.status] || 'pending'}
            label={INVENTORY_STATUS_LABELS[row.status] || row.status}
          />
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        width: 130,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{formatDate(row.updatedAt)}</span>
        ),
      },
      {
        field: '__actions',
        headerName: '',
        width: 96,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <div className={styles.rowActions}>
            {canWrite ? (
              <Tooltip title="Edit stock" placement="top" arrow>
                <IconButton
                  size="small"
                  aria-label="Edit stock"
                  onClick={() => {
                    apiRef.current?.startCellEditMode?.({ id: row.id, field: 'stock' });
                  }}
                  className={styles.iconBtn}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
            {canWrite ? (
              <Tooltip title="Adjust stock" placement="top" arrow>
                <IconButton
                  size="small"
                  aria-label="Adjust stock"
                  onClick={(e) => openAdjust(row, e)}
                  className={styles.iconBtn}
                >
                  <TuneRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
            <Tooltip title="View activity" placement="top" arrow>
              <IconButton
                size="small"
                aria-label="View activity"
                onClick={() => setTab('activity')}
                className={styles.iconBtn}
              >
                <HistoryRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        ),
      },
    ],
    [canWrite, edits, apiRef],
  );

  const sortModel = [{ field: sortField, sort: sortDir }];
  const onSortModelChange = (next) => {
    if (!next || next.length === 0) {
      updateFilter({ sort: 'updatedAt:desc' }, { resetPage: true });
      return;
    }
    const [first] = next;
    updateFilter(
      { sort: `${first.field}:${first.sort === 'asc' ? 'asc' : 'desc'}` },
      { resetPage: true },
    );
  };

  const paginationModel = {
    page: Math.max(0, (filters.page || 1) - 1),
    pageSize: filters.perPage,
  };
  const onPaginationModelChange = (next) =>
    updateFilter({ page: next.page + 1, perPage: next.pageSize });

  const hasActiveFilters = Boolean(
    filters.q || filters.categoryId || filters.status,
  );

  return (
    <>
      <Seo title="Inventory | Admin" noindex />
      <AdminPageHeader
        eyebrow="Catalog"
        title="Inventory"
        description="Track stock levels, adjust on the fly, and audit changes."
        actions={
          <div className={styles.headerActions}>
            <AppButton
              variant="ghost"
              size="small"
              icon={<FileDownloadRoundedIcon fontSize="small" />}
              onClick={exportCsv}
            >
              Export CSV
            </AppButton>
            <AppButton
              variant="ghost"
              size="small"
              icon={<RefreshRoundedIcon fontSize="small" />}
              onClick={() => refetch()}
            >
              Refresh
            </AppButton>
          </div>
        }
      />

      <Tabs
        value={tab}
        onChange={(_, next) => setTab(next)}
        className={styles.tabs}
        textColor="inherit"
        TabIndicatorProps={{ className: styles.tabsIndicator }}
        aria-label="Inventory tabs"
      >
        <Tab value="levels" label="Levels" className={styles.tab} />
        <Tab value="activity" label="Activity" className={styles.tab} />
      </Tabs>

      {tab === 'levels' ? (
        <section>
          <InventoryStats stats={stats} isLoading={isLoading} />

          <InventoryToolbar
            search={filters.q}
            onSearch={(q) => updateFilter({ q }, { resetPage: true })}
            categoryId={filters.categoryId}
            onCategoryId={(v) => updateFilter({ categoryId: v }, { resetPage: true })}
            status={filters.status}
            onStatus={(v) => updateFilter({ status: v }, { resetPage: true })}
            sort={filters.sort}
            onSort={(v) => updateFilter({ sort: v }, { resetPage: true })}
            categories={categories}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            hasActiveFilters={hasActiveFilters}
          />

          <InventoryBulkBar
            count={dirtyCount}
            isSaving={isSavingAll}
            onSaveAll={saveAll}
            onDiscard={discardEdits}
          />

          <div className={styles.gridWrap} data-admin-grid-wrap>
            {error && !isLoading ? (
              <div className={styles.errorWrap}>
                <ErrorState
                  title="Could not load inventory"
                  description={error?.message || 'Please try again.'}
                  onRetry={refetch}
                />
              </div>
            ) : null}
            <DataGrid
              apiRef={apiRef}
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id}
              loading={isLoading}
              rowHeight={72}
              columnHeaderHeight={48}
              disableRowSelectionOnClick
              processRowUpdate={handleProcessRowUpdate}
              onProcessRowUpdateError={(err) => {
                toast.error(err?.message || 'Could not edit row');
              }}
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
                '& .MuiDataGrid-cell--editing': {
                  boxShadow: 'inset 0 -2px 0 0 var(--color-brass, #B8924F)',
                  backgroundColor: 'rgba(184, 146, 79, 0.06) !important',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid',
                  borderColor: 'divider',
                },
              }}
            />
          </div>

          <AdjustStockPopover
            open={Boolean(adjustState)}
            anchorEl={adjustState?.anchorEl || null}
            onClose={closeAdjust}
            row={adjustState?.row}
            onSubmit={submitAdjust}
            isSaving={isAdjusting}
          />
        </section>
      ) : (
        <InventoryActivityTab />
      )}
    </>
  );
}

export default InventoryPage;
