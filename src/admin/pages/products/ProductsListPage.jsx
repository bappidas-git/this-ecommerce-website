import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { useCategories } from '../../../hooks/useCategories.js';
import { PATHS } from '../../../routes/paths.js';
import { formatCurrency, formatDate } from '../../../utils/format.js';
import { adminProductService } from '../../../api/services/admin/adminProductService.js';

import useProductsUrlState from '../../features/products/useProductsUrlState.js';
import useAdminProducts from '../../features/products/useAdminProducts.js';
import {
  PRODUCT_STATUS_LABELS,
  deriveStatus,
  deriveStockTone,
} from '../../features/products/productStatus.js';

import ProductsToolbar from './ProductsToolbar.jsx';
import ProductsBulkBar from './ProductsBulkBar.jsx';
import ProductRowActions from './ProductRowActions.jsx';

import styles from './ProductsListPage.module.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const UNDO_TOAST_DURATION_MS = 8000;

const STATUS_TONE = {
  active: 'success',
  draft: 'muted',
  archived: 'error',
};

function buildServiceParams(state) {
  const params = {
    page: state.page,
    perPage: state.per_page,
    sortBy: state.sort_by,
    sortDir: state.sort_dir,
  };
  if (state.q) params.q = state.q;
  if (state.category_id) params.categoryId = state.category_id;
  if (state.status) params.status = state.status;
  if (state.stock) params.stock = state.stock;
  if (state.price_min) params.priceMin = state.price_min;
  if (state.price_max) params.priceMax = state.price_max;
  return params;
}

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

function buildErrorOverlay(onRetry, message) {
  return function GridErrorOverlay() {
    return (
      <div className={styles.overlay}>
        <ErrorState
          title="Could not load products"
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

function ProductsListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('products');

  useAdminBreadcrumbs([{ label: 'Catalog' }, { label: 'Products' }]);

  const { state, update, reset } = useProductsUrlState();
  const { items: categories } = useCategories();

  const params = useMemo(() => buildServiceParams(state), [state]);
  const {
    items,
    meta,
    error,
    isLoading,
    refetch,
    removeLocal,
    restoreLocal,
  } = useAdminProducts(params);

  const [selection, setSelection] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null); // { ids, single? }

  // DataGrid v8+ emits `{ type, ids: Set }`; older versions emit an array.
  const normalizeSelection = (next) => {
    if (Array.isArray(next)) return next.map(String);
    if (next && next.ids) return Array.from(next.ids).map(String);
    return [];
  };

  const rows = useMemo(
    () =>
      items.map((p) => ({
        ...p,
        status: deriveStatus(p),
        stockTone: deriveStockTone(p.stock),
      })),
    [items],
  );

  const categoriesById = useMemo(() => {
    const map = new Map();
    for (const c of categories || []) map.set(String(c.id), c);
    return map;
  }, [categories]);

  // Selection helpers (only retain ids that are still on the current page)
  const visibleIds = useMemo(() => new Set(rows.map((r) => String(r.id))), [rows]);
  const effectiveSelection = useMemo(
    () => selection.filter((id) => visibleIds.has(String(id))),
    [selection, visibleIds],
  );

  // ----- Mutations -----
  const archiveOne = useCallback(
    async (product) => {
      removeLocal([product.id]);
      try {
        await adminProductService.archive(product.id);
        toast.success(`Archived “${product.name}”`);
        refetch();
      } catch (err) {
        restoreLocal([product]);
        toast.error(err?.message || 'Could not archive product');
      }
    },
    [removeLocal, restoreLocal, refetch, toast],
  );

  const unarchiveOne = useCallback(
    async (product) => {
      try {
        await adminProductService.unarchive(product.id);
        toast.success(`Restored “${product.name}”`);
        refetch();
      } catch (err) {
        toast.error(err?.message || 'Could not restore product');
      }
    },
    [refetch, toast],
  );

  const duplicateOne = useCallback(
    async (product) => {
      try {
        const created = await adminProductService.duplicate(product.id);
        toast.success(`Duplicated “${product.name}”`);
        refetch();
        if (created?.id) navigate(PATHS.admin.productEdit(created.id));
      } catch (err) {
        toast.error(err?.message || 'Could not duplicate product');
      }
    },
    [navigate, refetch, toast],
  );

  const deleteIds = useCallback(
    async (ids) => {
      const set = new Set(ids.map(String));
      const removed = items.filter((p) => set.has(String(p.id)));
      removeLocal(ids);
      try {
        await adminProductService.bulkRemove(ids);
        toast.success(
          ids.length === 1
            ? `Deleted “${removed[0]?.name || 'product'}”`
            : `Deleted ${ids.length} products`,
        );
        setSelection([]);
        refetch();
      } catch (err) {
        restoreLocal(removed);
        toast.error(err?.message || 'Could not delete products');
      }
    },
    [items, removeLocal, restoreLocal, refetch, toast],
  );

  const bulkArchive = useCallback(async () => {
    if (effectiveSelection.length === 0) return;
    const ids = [...effectiveSelection];
    const set = new Set(ids.map(String));
    const removed = items.filter((p) => set.has(String(p.id)));
    removeLocal(ids);
    setSelection([]);
    try {
      await adminProductService.bulkArchive(ids);
      toast.success(`Archived ${ids.length} product${ids.length === 1 ? '' : 's'}`, {
        autoHideDuration: UNDO_TOAST_DURATION_MS,
        action: (id) => (
          <button
            type="button"
            className={styles.undoBtn}
            onClick={async () => {
              toast.dismiss(id);
              try {
                await adminProductService.bulkUnarchive(ids);
                toast.success(`Restored ${ids.length} product${ids.length === 1 ? '' : 's'}`);
                refetch();
              } catch (err) {
                toast.error(err?.message || 'Could not undo archive');
              }
            }}
          >
            Undo
          </button>
        ),
      });
      refetch();
    } catch (err) {
      restoreLocal(removed);
      toast.error(err?.message || 'Could not archive products');
    }
  }, [effectiveSelection, items, removeLocal, restoreLocal, refetch, toast]);

  const bulkUnarchive = useCallback(async () => {
    if (effectiveSelection.length === 0) return;
    const ids = [...effectiveSelection];
    try {
      await adminProductService.bulkUnarchive(ids);
      toast.success(`Restored ${ids.length} product${ids.length === 1 ? '' : 's'}`);
      setSelection([]);
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Could not restore products');
    }
  }, [effectiveSelection, refetch, toast]);

  const bulkSetCategory = useCallback(
    async (categoryId) => {
      if (effectiveSelection.length === 0) return;
      const ids = [...effectiveSelection];
      try {
        await adminProductService.bulkSetCategory(ids, categoryId);
        const cat = categoriesById.get(String(categoryId));
        toast.success(
          `Moved ${ids.length} product${ids.length === 1 ? '' : 's'} to ${cat?.name || 'category'}`,
        );
        setSelection([]);
        refetch();
      } catch (err) {
        toast.error(err?.message || 'Could not update category');
      }
    },
    [effectiveSelection, categoriesById, refetch, toast],
  );

  const onConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;
    const ids = confirmDelete.ids;
    setConfirmDelete(null);
    await deleteIds(ids);
  }, [confirmDelete, deleteIds]);

  // ----- Columns (memoized) -----
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
            (Array.isArray(row.images) && row.images[0]) ||
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
        headerName: 'Name',
        flex: 1.6,
        minWidth: 220,
        renderCell: ({ row }) => (
          <Link
            component={RouterLink}
            to={PATHS.admin.productEdit(row.id)}
            className={styles.nameLink}
            underline="hover"
          >
            {row.name}
          </Link>
        ),
      },
      {
        field: 'sku',
        headerName: 'SKU',
        width: 140,
        renderCell: ({ row }) => (
          <span className={styles.mono}>{row.sku || '—'}</span>
        ),
      },
      {
        field: 'categoryId',
        headerName: 'Category',
        width: 160,
        sortable: false,
        renderCell: ({ row }) => {
          const cat = categoriesById.get(String(row.categoryId));
          return <span className={styles.muted}>{cat?.name || '—'}</span>;
        },
      },
      {
        field: 'price',
        headerName: 'Price',
        width: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => {
          const hasCompare =
            typeof row.compareAtPrice === 'number' &&
            typeof row.price === 'number' &&
            row.compareAtPrice > row.price;
          return (
            <div className={styles.priceCell}>
              <span className={styles.priceMain}>
                {formatCurrency(row.price, row.currency)}
              </span>
              {hasCompare ? (
                <span className={styles.priceCompare}>
                  {formatCurrency(row.compareAtPrice, row.currency)}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        field: 'stock',
        headerName: 'Stock',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => {
          const tone = row.stockTone;
          if (tone === 'out') {
            return <StatusPill status="cancelled" label="Out" />;
          }
          if (tone === 'low') {
            return (
              <StatusPill
                status="ready"
                label={`Low · ${row.stock}`}
              />
            );
          }
          return <span className={styles.mono}>{row.stock}</span>;
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: ({ row }) => (
          <StatusPill
            status={STATUS_TONE[row.status] || 'pending'}
            label={PRODUCT_STATUS_LABELS[row.status] || row.status}
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
        width: 56,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <ProductRowActions
            product={row}
            canWrite={canWrite}
            onView={() => window.open(PATHS.product(row.slug), '_blank', 'noopener')}
            onEdit={() => navigate(PATHS.admin.productEdit(row.id))}
            onDuplicate={() => duplicateOne(row)}
            onArchive={() => archiveOne(row)}
            onUnarchive={() => unarchiveOne(row)}
            onDelete={() => setConfirmDelete({ ids: [row.id], single: true })}
          />
        ),
      },
    ],
    [canWrite, categoriesById, navigate, archiveOne, unarchiveOne, duplicateOne],
  );

  // ----- Server-side pagination/sort handlers -----
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
      update({ sort_by: 'updatedAt', sort_dir: 'desc', page: 1 });
      return;
    }
    const [first] = next;
    update({
      sort_by: first.field,
      sort_dir: first.sort === 'asc' ? 'asc' : 'desc',
      page: 1,
    });
  };

  // ----- Filter handlers (each resets page to 1) -----
  const onSearch = (q) => update({ q }, { resetPage: true });
  const onCategoryId = (v) => update({ category_id: v }, { resetPage: true });
  const onStatus = (v) => update({ status: v }, { resetPage: true });
  const onStock = (v) => update({ stock: v }, { resetPage: true });
  const onPriceMin = (v) => update({ price_min: v }, { resetPage: true });
  const onPriceMax = (v) => update({ price_max: v }, { resetPage: true });

  const hasActiveFilters = Boolean(
    state.q ||
      state.category_id ||
      state.status ||
      state.stock ||
      state.price_min ||
      state.price_max,
  );

  const total = Number(meta?.total) || rows.length;

  const exportCsv = () => {
    const headers = ['id', 'sku', 'name', 'category', 'price', 'stock', 'status', 'updatedAt'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      const cat = categoriesById.get(String(r.categoryId))?.name || '';
      const cells = [
        r.id,
        r.sku || '',
        `"${String(r.name || '').replace(/"/g, '""')}"`,
        `"${cat.replace(/"/g, '""')}"`,
        r.price ?? '',
        r.stock ?? '',
        r.status || '',
        r.updatedAt || '',
      ];
      lines.push(cells.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ErrorOverlay = useMemo(
    () => buildErrorOverlay(refetch, error?.message),
    [refetch, error?.message],
  );

  return (
    <>
      <Seo title="Products | Admin" noindex />
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage your catalog."
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
            {canWrite ? (
              <AppButton
                variant="primary"
                size="small"
                icon={<AddRoundedIcon fontSize="small" />}
                to={PATHS.admin.productNew}
              >
                New product
              </AppButton>
            ) : null}
          </div>
        }
      />

      <ProductsToolbar
        search={state.q}
        onSearch={onSearch}
        categoryId={state.category_id}
        onCategoryId={onCategoryId}
        status={state.status}
        onStatus={onStatus}
        stock={state.stock}
        onStock={onStock}
        priceMin={state.price_min}
        priceMax={state.price_max}
        onPriceMin={onPriceMin}
        onPriceMax={onPriceMax}
        categories={categories}
        onReset={reset}
        hasActiveFilters={hasActiveFilters}
      />

      <ProductsBulkBar
        count={effectiveSelection.length}
        canWrite={canWrite}
        categories={categories}
        onArchive={bulkArchive}
        onUnarchive={bulkUnarchive}
        onSetCategory={bulkSetCategory}
        onDelete={() =>
          setConfirmDelete({ ids: [...effectiveSelection], single: false })
        }
        onClear={() => setSelection([])}
      />

      <div className={styles.gridWrap}>
        {error && !isLoading ? (
          <div className={styles.errorWrap}>
            <ErrorState
              title="Could not load products"
              description={error?.message || 'Please try again.'}
              onRetry={refetch}
            />
          </div>
        ) : null}
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={isLoading}
          rowHeight={72}
          columnHeaderHeight={48}
          disableRowSelectionOnClick
          checkboxSelection
          rowSelectionModel={effectiveSelection}
          onRowSelectionModelChange={(next) => setSelection(normalizeSelection(next))}
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

      <AppDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={
          confirmDelete?.single
            ? 'Delete product?'
            : `Delete ${confirmDelete?.ids?.length || 0} products?`
        }
        description="This action cannot be undone."
        size="sm"
        actions={
          <>
            <AppButton variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" onClick={onConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        {confirmDelete?.single ? null : (
          <p>
            You are about to permanently delete{' '}
            <strong>{confirmDelete?.ids?.length || 0}</strong> products. This
            cannot be undone.
          </p>
        )}
      </AppDialog>
    </>
  );
}

export default ProductsListPage;
