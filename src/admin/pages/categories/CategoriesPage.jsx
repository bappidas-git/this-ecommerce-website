import { useCallback, useEffect, useMemo, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

import Seo from '../../../components/common/Seo.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppDrawer from '../../../components/common/AppDrawer/AppDrawer.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import Loader from '../../../components/common/Loader/Loader.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import AdminCard from '../../components/AdminCard.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { adminCategoryService } from '../../../api/services/admin/adminCategoryService.js';

import useAdminCategories from '../../features/categories/useAdminCategories.js';
import CategoryTree from './CategoryTree.jsx';
import CategoryEditor from './CategoryEditor.jsx';

import styles from './CategoriesPage.module.css';

const NEW_KEY = '__new__';

function CategoriesPage() {
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('categories');

  useAdminBreadcrumbs([{ label: 'Catalog' }, { label: 'Categories' }]);

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const {
    items,
    tree,
    dependentCount,
    descendantIds,
    error,
    isLoading,
    refetch,
  } = useAdminCategories();

  const [selectedKey, setSelectedKey] = useState(null); // category id or NEW_KEY
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [topError, setTopError] = useState(null);
  const [deleteState, setDeleteState] = useState(null);

  const selectedCategory = useMemo(() => {
    if (selectedKey == null || selectedKey === NEW_KEY) return null;
    return items.find((c) => c.id === selectedKey) || null;
  }, [items, selectedKey]);

  const editorMode = selectedKey === NEW_KEY ? 'create' : 'edit';

  const excludedIds = useMemo(() => {
    if (!selectedCategory) return new Set();
    const desc = descendantIds(selectedCategory.id);
    desc.add(selectedCategory.id);
    return desc;
  }, [selectedCategory, descendantIds]);

  useEffect(() => {
    if (isDesktop && drawerOpen) setDrawerOpen(false);
  }, [isDesktop, drawerOpen]);

  const openEditor = useCallback(
    (node) => {
      setSelectedKey(node.id);
      if (!isDesktop) setDrawerOpen(true);
      setTopError(null);
    },
    [isDesktop],
  );

  const startCreate = useCallback(() => {
    setSelectedKey(NEW_KEY);
    if (!isDesktop) setDrawerOpen(true);
    setTopError(null);
  }, [isDesktop]);

  const closeEditor = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (payload) => {
      setTopError(null);
      try {
        if (editorMode === 'create') {
          const created = await adminCategoryService.create(payload);
          toast.success('Category created.');
          await refetch();
          if (created?.id) setSelectedKey(created.id);
          setDrawerOpen(false);
        } else if (selectedCategory) {
          await adminCategoryService.update(selectedCategory.id, payload);
          toast.success('Category saved.');
          await refetch();
        }
      } catch (err) {
        const message = err?.message || 'Could not save category.';
        setTopError(message);
        toast.error(message);
      }
    },
    [editorMode, selectedCategory, toast, refetch],
  );

  const handleMove = useCallback(
    async (node, direction) => {
      if (!canWrite) return;
      setBusyId(node.id);
      try {
        await adminCategoryService.move(node.id, { direction });
        await refetch();
      } catch (err) {
        toast.error(err?.message || 'Could not reorder category.');
      } finally {
        setBusyId(null);
      }
    },
    [canWrite, toast, refetch],
  );

  const openDelete = useCallback(
    (node) => {
      const deps = dependentCount(node.id);
      const hasDeps = deps.products > 0 || deps.categories > 0;
      setDeleteState({
        category: node,
        deps,
        hasDeps,
        reassignedTo: null,
        reassigning: false,
        deleting: false,
      });
    },
    [dependentCount],
  );

  const closeDelete = useCallback(() => setDeleteState(null), []);

  const reassignOptions = useMemo(() => {
    if (!deleteState?.category) return [];
    const exclude = descendantIds(deleteState.category.id);
    exclude.add(deleteState.category.id);
    const list = items.filter((c) => !exclude.has(c.id));
    list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return [
      { value: '__top__', label: '— Move to top level (no parent) —' },
      ...list.map((c) => ({ value: String(c.id), label: c.name })),
    ];
  }, [deleteState, items, descendantIds]);

  const onReassign = useCallback(async () => {
    if (!deleteState?.category || !deleteState.reassignedTo) return;
    setDeleteState((s) => ({ ...s, reassigning: true }));
    try {
      const toId =
        deleteState.reassignedTo === '__top__'
          ? null
          : Number(deleteState.reassignedTo);
      await adminCategoryService.reassign(deleteState.category.id, toId);
      await refetch();
      toast.success('Reassignment complete.');
      setDeleteState((s) =>
        s ? { ...s, reassigning: false, reassigned: true } : s,
      );
    } catch (err) {
      toast.error(err?.message || 'Could not reassign.');
      setDeleteState((s) => (s ? { ...s, reassigning: false } : s));
    }
  }, [deleteState, refetch, toast]);

  const onConfirmDelete = useCallback(async () => {
    if (!deleteState?.category) return;
    setDeleteState((s) => ({ ...s, deleting: true }));
    try {
      await adminCategoryService.remove(deleteState.category.id);
      toast.success(`Deleted “${deleteState.category.name}”.`);
      const removedId = deleteState.category.id;
      setDeleteState(null);
      if (selectedKey === removedId) {
        setSelectedKey(null);
        setDrawerOpen(false);
      }
      await refetch();
    } catch (err) {
      toast.error(err?.message || 'Could not delete category.');
      setDeleteState((s) => (s ? { ...s, deleting: false } : s));
    }
  }, [deleteState, selectedKey, refetch, toast]);

  const getProductCount = useCallback(
    (id) => dependentCount(id).products,
    [dependentCount],
  );

  const showEmpty = !isLoading && !error && tree.length === 0;
  const deleteReady =
    deleteState?.hasDeps ? Boolean(deleteState?.reassigned) : true;

  const editorPane = (
    <AdminCard className={styles.editorCard}>
      {selectedKey == null ? (
        <EmptyState
          icon={<CategoryOutlinedIcon fontSize="large" />}
          title="Select a category"
          description="Choose a category from the tree to edit its details, or create a new one."
          cta={
            canWrite ? (
              <AppButton
                variant="primary"
                size="small"
                icon={<AddRoundedIcon fontSize="small" />}
                onClick={startCreate}
              >
                New category
              </AppButton>
            ) : null
          }
        />
      ) : (
        <CategoryEditor
          mode={editorMode}
          category={selectedCategory}
          categories={items}
          excludedIds={excludedIds}
          disabled={!canWrite}
          topError={topError}
          onSubmit={handleSubmit}
        />
      )}
    </AdminCard>
  );

  return (
    <>
      <Seo title="Categories | Admin" noindex />
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Organize your catalog into a navigable tree."
        actions={
          canWrite ? (
            <AppButton
              variant="primary"
              size="small"
              icon={<AddRoundedIcon fontSize="small" />}
              onClick={startCreate}
            >
              New category
            </AppButton>
          ) : null
        }
      />

      <div className={styles.layout}>
        <AdminCard className={styles.treeCard} bodyClassName={styles.treeBody}>
          {isLoading ? (
            <Loader label="Loading categories…" />
          ) : error ? (
            <ErrorState
              title="Could not load categories"
              description={error?.message || 'Please try again.'}
              onRetry={refetch}
            />
          ) : showEmpty ? (
            <EmptyState
              icon={<CategoryOutlinedIcon fontSize="large" />}
              title="No categories yet"
              description="Create your first category to start organizing the catalog."
              cta={
                canWrite ? (
                  <AppButton
                    variant="primary"
                    size="small"
                    icon={<AddRoundedIcon fontSize="small" />}
                    onClick={startCreate}
                  >
                    New category
                  </AppButton>
                ) : null
              }
            />
          ) : (
            <CategoryTree
              tree={tree}
              selectedId={
                selectedKey === NEW_KEY ? null : selectedKey
              }
              onSelect={openEditor}
              onMove={handleMove}
              onEdit={openEditor}
              onDelete={openDelete}
              canWrite={canWrite}
              getProductCount={getProductCount}
              busyId={busyId}
            />
          )}
        </AdminCard>

        {isDesktop ? (
          <div className={styles.editorDesktop}>{editorPane}</div>
        ) : null}
      </div>

      {!isDesktop ? (
        <AppDrawer
          open={drawerOpen}
          onClose={closeEditor}
          anchor="right"
          title={
            editorMode === 'create'
              ? 'New category'
              : selectedCategory?.name || 'Edit category'
          }
          description={
            editorMode === 'create'
              ? 'Create a new category for the catalog.'
              : 'Edit the selected category.'
          }
        >
          {editorPane}
        </AppDrawer>
      ) : null}

      <AppDialog
        open={Boolean(deleteState)}
        onClose={deleteState?.deleting || deleteState?.reassigning ? undefined : closeDelete}
        title={
          deleteState?.hasDeps ? 'Reassign before deleting' : 'Delete category?'
        }
        description={
          deleteState?.hasDeps
            ? 'This category has dependents. Reassign them to another category before deleting.'
            : 'This action cannot be undone.'
        }
        size="md"
        actions={
          <>
            <AppButton
              variant="ghost"
              onClick={closeDelete}
              disabled={deleteState?.deleting || deleteState?.reassigning}
            >
              Cancel
            </AppButton>
            {deleteState?.hasDeps && !deleteState?.reassigned ? (
              <AppButton
                variant="primary"
                onClick={onReassign}
                loading={deleteState?.reassigning}
                disabled={!deleteState?.reassignedTo}
              >
                Reassign
              </AppButton>
            ) : null}
            <AppButton
              variant="danger"
              onClick={onConfirmDelete}
              loading={deleteState?.deleting}
              disabled={!deleteReady}
            >
              Delete
            </AppButton>
          </>
        }
      >
        {deleteState?.hasDeps ? (
          <div className={styles.deleteBody}>
            <p>
              <strong>{deleteState.category?.name}</strong> currently contains{' '}
              {deleteState.deps.products > 0 ? (
                <>
                  <strong>{deleteState.deps.products}</strong> product
                  {deleteState.deps.products === 1 ? '' : 's'}
                </>
              ) : null}
              {deleteState.deps.products > 0 && deleteState.deps.categories > 0
                ? ' and '
                : null}
              {deleteState.deps.categories > 0 ? (
                <>
                  <strong>{deleteState.deps.categories}</strong> child categor
                  {deleteState.deps.categories === 1 ? 'y' : 'ies'}
                </>
              ) : null}
              .
            </p>
            <AppSelect
              label="Reassign to"
              value={deleteState.reassignedTo ?? ''}
              onChange={(e) =>
                setDeleteState((s) =>
                  s ? { ...s, reassignedTo: e.target.value } : s,
                )
              }
              options={reassignOptions}
              placeholder="Choose a destination"
              disabled={Boolean(deleteState?.reassigned) || deleteState?.reassigning}
            />
            {deleteState?.reassigned ? (
              <p className={styles.deleteHint}>
                Reassigned. You can now safely delete this category.
              </p>
            ) : null}
          </div>
        ) : (
          <p>
            You are about to permanently delete{' '}
            <strong>{deleteState?.category?.name}</strong>. This cannot be undone.
          </p>
        )}
      </AppDialog>
    </>
  );
}

export default CategoriesPage;
