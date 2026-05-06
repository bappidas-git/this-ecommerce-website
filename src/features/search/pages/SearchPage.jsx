import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import Container from '../../../components/common/Container.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Chip from '../../../components/common/Chip/Chip.jsx';
import Seo from '../../../components/common/Seo.jsx';

import ProductBrowser from '../../shop/components/ProductBrowser/ProductBrowser.jsx';
import useShopState from '../../shop/state/useShopState.js';
import useProducts from '../../../hooks/useProducts.js';

import { PATHS } from '../../../routes/paths.js';
import { TRENDING_QUERIES } from '../constants.js';
import { addRecentSearch } from '../state/recentSearches.js';

import styles from './SearchPage.module.css';

function pickRandomSubset(list, n) {
  if (!Array.isArray(list) || list.length <= n) return [...(list || [])];
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = (searchParams.get('q') || '').trim();

  const {
    state,
    setFilters,
    setSort,
    setPage,
    clearAll,
    serialized,
    categories,
  } = useShopState();

  const {
    items,
    meta,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useProducts(serialized);

  // Persist any non-empty query that lands on the page.
  useEffect(() => {
    if (q) addRecentSearch(q);
  }, [q]);

  const total = meta?.pagination?.total;
  // Re-shuffle once per query so users see a stable suggestion set while
  // refining filters but a different one if they search a new term.
  const relatedSuggestions = useMemo(
    () => {
      // q is a deliberate dependency: it seeds re-shuffles per query.
      void q;
      return pickRandomSubset(TRENDING_QUERIES, 4);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );

  if (!q) {
    return <Navigate to={PATHS.shop} replace />;
  }

  const handleClearSearch = () => {
    clearAll();
    navigate(PATHS.shop);
  };

  const seoTitle = `Results for "${q}" | THIS Interiors`;

  const emptyState = (
    <EmptyState
      title="Nothing matches yet."
      description={`We couldn't find anything for "${q}". Try one of these instead:`}
      cta={
        <div className={styles.emptyCta}>
          <div className={styles.suggestionRow}>
            {relatedSuggestions.map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant="outline"
                onClick={() =>
                  navigate(`${PATHS.search}?q=${encodeURIComponent(s)}`)
                }
              />
            ))}
          </div>
          <AppButton variant="secondary" onClick={handleClearSearch}>
            Clear search
          </AppButton>
        </div>
      }
    />
  );

  return (
    <div className={styles.page}>
      <Seo title={seoTitle} noindex />

      <Container gutter>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Search</p>
          <h1 className={styles.title}>
            Results for &ldquo;{q}&rdquo;
          </h1>
          {!isLoading && !isFetching ? (
            <p className={styles.count}>
              {total === 1
                ? '1 piece found'
                : `${total ?? 0} pieces found`}
            </p>
          ) : (
            <p className={styles.count} aria-hidden="true">
              &nbsp;
            </p>
          )}
        </header>

        <ProductBrowser
          state={state}
          setFilters={setFilters}
          setSort={setSort}
          setPage={setPage}
          clearAll={clearAll}
          meta={meta}
          items={items}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          refetch={refetch}
          categories={categories}
          emptyState={emptyState}
        />
      </Container>
    </div>
  );
}

export default SearchPage;
