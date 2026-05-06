import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import EmptyState from '../../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../../components/common/AppButton/AppButton.jsx';

import FilterSidebar from '../FilterSidebar/FilterSidebar.jsx';
import ToolbarBar from '../ToolbarBar/ToolbarBar.jsx';
import ActiveFilterChips from '../ActiveFilterChips/ActiveFilterChips.jsx';
import ProductGrid from '../ProductGrid/ProductGrid.jsx';
import PaginationBar from '../PaginationBar/PaginationBar.jsx';
import MobileFilterSheet from '../MobileFilterSheet/MobileFilterSheet.jsx';
import MobileSortSheet from '../MobileSortSheet/MobileSortSheet.jsx';

import buildFilterChips from '../../state/buildFilterChips.js';
import { PAGE_SIZE } from '../../constants.js';

import styles from './ProductBrowser.module.css';

function ProductBrowser({
  state,
  setFilters,
  setSort,
  setPage,
  clearAll,
  meta,
  items,
  isLoading,
  isFetching = false,
  isError,
  refetch,
  categories = [],
  lockedCategory = null,
  isCategoryLocked = false,
  emptyState,
  showSidebar = true,
}) {
  const gridRef = useRef(null);
  const products = items || [];

  const totalPages = meta?.pagination?.totalPages ?? 1;
  const total = meta?.pagination?.total ?? 0;

  useEffect(() => {
    if (isFetching || !meta?.pagination) return;
    if (state.page > totalPages) setPage(totalPages);
  }, [isFetching, meta, state.page, totalPages, setPage]);

  const [pendingMode, setPendingMode] = useState('dim');

  useEffect(() => {
    if (!isFetching) setPendingMode('dim');
  }, [isFetching]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState('grid');

  const handleFilterChange = useCallback(
    (partial) => {
      setPendingMode('dim');
      setFilters(partial);
    },
    [setFilters],
  );

  const handleSortChange = useCallback(
    (sort) => {
      setPendingMode('dim');
      setSort(sort);
    },
    [setSort],
  );

  const handlePageChange = useCallback(
    (page) => {
      setPendingMode('skeleton');
      setPage(page);
    },
    [setPage],
  );

  const handleClearAll = useCallback(() => {
    setPendingMode('dim');
    clearAll();
  }, [clearAll]);

  const handleChipRemove = useCallback(
    (chip) => {
      handleFilterChange(chip.clear);
    },
    [handleFilterChange],
  );

  const handleSortSelect = useCallback(
    (next) => {
      handleSortChange(next);
      setSortOpen(false);
    },
    [handleSortChange],
  );

  const chips = useMemo(
    () => buildFilterChips(state, { categories, isCategoryLocked }),
    [state, categories, isCategoryLocked],
  );

  const filterPanelProps = {
    state,
    categories,
    onChange: handleFilterChange,
    onClearAll: handleClearAll,
    isCategoryLocked,
    lockedCategory,
  };

  const showSkeleton =
    isLoading || (isFetching && (products.length === 0 || pendingMode === 'skeleton'));
  const showDimOverlay = isFetching && !showSkeleton;

  const showEmpty = !isLoading && !isFetching && !isError && products.length === 0;
  const showError = !isLoading && Boolean(isError);

  const layoutClass = [
    styles.layout,
    !showSidebar ? styles.layoutNoSidebar : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.root}>
      <div className={layoutClass}>
        {showSidebar ? <FilterSidebar {...filterPanelProps} /> : null}

        <section className={styles.content} aria-label="Products">
          <ToolbarBar
            total={total}
            page={state.page}
            pageSize={state.perPage || PAGE_SIZE}
            isLoading={showSkeleton}
            sort={state.sort}
            view={view}
            onSortChange={handleSortChange}
            onViewChange={setView}
            onOpenFilters={() => setFiltersOpen(true)}
            onOpenSort={() => setSortOpen(true)}
          />

          <ActiveFilterChips
            chips={chips}
            onRemove={handleChipRemove}
            onClearAll={handleClearAll}
          />

          <div
            ref={gridRef}
            className={[
              styles.gridAnchor,
              showDimOverlay ? styles.gridDimmed : null,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-busy={isFetching || undefined}
          >
            {showError ? (
              <div className={styles.stateWrap}>
                <ErrorState
                  title="We couldn't load the collection"
                  description="Please check your connection and try again."
                  onRetry={refetch}
                />
              </div>
            ) : showEmpty ? (
              <div className={styles.stateWrap}>
                {emptyState ?? (
                  <EmptyState
                    title="Nothing matches yet"
                    description="Try widening your filters or clear them to see the full collection."
                    cta={
                      <AppButton variant="secondary" onClick={handleClearAll}>
                        Clear all filters
                      </AppButton>
                    }
                  />
                )}
              </div>
            ) : (
              <ProductGrid
                products={products}
                view={view}
                isLoading={showSkeleton}
                skeletonCount={state.perPage || PAGE_SIZE}
              />
            )}
          </div>

          <PaginationBar
            page={state.page}
            count={totalPages}
            onChange={handlePageChange}
            gridRef={gridRef}
          />
        </section>
      </div>

      <MobileFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => setFiltersOpen(false)}
        onClearAll={handleClearAll}
        {...filterPanelProps}
      />

      <MobileSortSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        sort={state.sort}
        onSelect={handleSortSelect}
        onApply={() => setSortOpen(false)}
      />
    </div>
  );
}

export default ProductBrowser;
