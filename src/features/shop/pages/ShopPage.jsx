import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Container from '../../../components/common/Container.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';

import ShopHeader from '../components/ShopHeader/ShopHeader.jsx';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar.jsx';
import ToolbarBar from '../components/ToolbarBar/ToolbarBar.jsx';
import ActiveFilterChips from '../components/ActiveFilterChips/ActiveFilterChips.jsx';
import ProductGrid from '../components/ProductGrid/ProductGrid.jsx';
import PaginationBar from '../components/PaginationBar/PaginationBar.jsx';
import MobileFilterSheet from '../components/MobileFilterSheet/MobileFilterSheet.jsx';
import MobileSortSheet from '../components/MobileSortSheet/MobileSortSheet.jsx';

import useProducts from '../../../hooks/useProducts.js';
import useShopState from '../state/useShopState.js';
import buildFilterChips from '../state/buildFilterChips.js';
import { PAGE_SIZE } from '../constants.js';
import styles from './ShopPage.module.css';

function buildSeoTitle(category) {
  return category
    ? `${category.name} — Shop | THIS Interiors`
    : 'Shop | THIS Interiors';
}

function buildSeoDescription(category) {
  return category
    ? `Explore ${category.name.toLowerCase()} from THIS Interiors — editorial homewares assembled in Dubai.`
    : 'Browse the THIS Interiors collection — editorial homewares assembled in Dubai for considered homes.';
}

function ShopPage() {
  const gridRef = useRef(null);

  const {
    state,
    setFilters,
    setSort,
    setPage,
    clearAll,
    serialized,
    lockedCategory,
    isCategoryLocked,
    categories,
  } = useShopState();

  // Once categories resolve, useShopState swaps in the correct categoryId and
  // useProducts aborts the in-flight unfiltered request automatically.
  const {
    items: products,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useProducts(serialized);

  const totalPages = meta?.pagination?.totalPages ?? 1;
  const total = meta?.pagination?.total ?? 0;

  // Clamp page to the last available one if the URL points past the end.
  useEffect(() => {
    if (isFetching || !meta?.pagination) return;
    if (state.page > totalPages) setPage(totalPages);
  }, [isFetching, meta, state.page, totalPages, setPage]);

  // Track which transition mode to use during fetches:
  //   'dim'      — keep current items at 60% opacity (filter / sort change)
  //   'skeleton' — swap to skeletons (page change, since layout is stable)
  const [pendingMode, setPendingMode] = useState('dim');

  // Once items refresh, drop back to default for the next interaction.
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

  const seoTitle = buildSeoTitle(lockedCategory);
  const seoDescription = buildSeoDescription(lockedCategory);

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

  const showEmpty = !isLoading && !isFetching && !error && products.length === 0;
  const showError = !isLoading && Boolean(error);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link
          rel="canonical"
          href={lockedCategory ? `/shop/${lockedCategory.slug}` : '/shop'}
        />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      <ShopHeader category={lockedCategory} />

      <Container gutter>
        <div className={styles.layout}>
          <FilterSidebar {...filterPanelProps} />

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
                  <EmptyState
                    title="Nothing matches yet"
                    description="Try widening your filters or clear them to see the full collection."
                    cta={
                      <AppButton variant="secondary" onClick={handleClearAll}>
                        Clear all filters
                      </AppButton>
                    }
                  />
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
      </Container>

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

export default ShopPage;
