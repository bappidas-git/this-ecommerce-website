import { useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
import useCategories from '../../../hooks/useCategories.js';
import categoriesData from '../../../data/categories.js';
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
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const gridRef = useRef(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const { items: categoriesFromApi } = useCategories();
  const categories = categoriesFromApi.length ? categoriesFromApi : categoriesData;
  const category = useMemo(
    () => (slug ? categories.find((c) => c.slug === slug) : null),
    [slug, categories],
  );

  const { items: products, meta, isLoading, error } = useProducts({});

  const total = meta?.total ?? products.length ?? 0;
  const page = Number(searchParams.get('page') || 1);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sort = searchParams.get('sort') || 'featured';
  const view = searchParams.get('view') || 'grid';

  const seoTitle = buildSeoTitle(category);
  const seoDescription = buildSeoDescription(category);

  const noop = () => {};

  const filterPanelProps = {
    categories,
    selectedCategory: slug || '',
    selectedColors: [],
    selectedMaterials: [],
    inStock: false,
    onSale: false,
    searchTerm: '',
    onClearAll: noop,
  };

  const showEmpty = !isLoading && !error && products.length === 0;
  const showError = !isLoading && Boolean(error);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={category ? `/shop/${category.slug}` : '/shop'} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      <ShopHeader category={category} />

      <Container gutter>
        <div className={styles.layout}>
          <FilterSidebar {...filterPanelProps} />

          <section className={styles.content} aria-label="Products">
            <ToolbarBar
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
              isLoading={isLoading}
              sort={sort}
              view={view}
              onOpenFilters={() => setFiltersOpen(true)}
              onOpenSort={() => setSortOpen(true)}
            />

            <ActiveFilterChips chips={[]} onRemove={noop} onClearAll={noop} />

            <div ref={gridRef} className={styles.gridAnchor}>
              {showError ? (
                <div className={styles.stateWrap}>
                  <ErrorState
                    title="We couldn't load the collection"
                    description="Please check your connection and try again."
                    onRetry={() => window.location.reload()}
                  />
                </div>
              ) : showEmpty ? (
                <div className={styles.stateWrap}>
                  <EmptyState
                    title="Nothing matches yet"
                    description="Try widening your filters or clear them to see the full collection."
                    cta={
                      <AppButton variant="secondary" onClick={noop}>
                        Clear all filters
                      </AppButton>
                    }
                  />
                </div>
              ) : (
                <ProductGrid
                  products={products}
                  view={view}
                  isLoading={isLoading}
                  skeletonCount={PAGE_SIZE}
                />
              )}
            </div>

            <PaginationBar
              page={page}
              count={pageCount}
              onChange={noop}
              gridRef={gridRef}
            />
          </section>
        </div>
      </Container>

      <MobileFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => setFiltersOpen(false)}
        onClearAll={noop}
        {...filterPanelProps}
      />

      <MobileSortSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        sort={sort}
        onSelect={noop}
        onApply={() => setSortOpen(false)}
      />
    </div>
  );
}

export default ShopPage;
