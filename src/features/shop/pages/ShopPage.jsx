import Container from '../../../components/common/Container.jsx';
import Seo from '../../../components/common/Seo.jsx';

import ShopHeader from '../components/ShopHeader/ShopHeader.jsx';
import ProductBrowser from '../components/ProductBrowser/ProductBrowser.jsx';

import useProducts from '../../../hooks/useProducts.js';
import useShopState from '../state/useShopState.js';
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

  const {
    items,
    meta,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useProducts(serialized);

  const seoTitle = buildSeoTitle(lockedCategory);
  const seoDescription = buildSeoDescription(lockedCategory);

  return (
    <div className={styles.page}>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical={lockedCategory ? `/shop/${lockedCategory.slug}` : '/shop'}
      />

      <ShopHeader category={lockedCategory} />

      <Container gutter>
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
          lockedCategory={lockedCategory}
          isCategoryLocked={isCategoryLocked}
        />
      </Container>
    </div>
  );
}

export default ShopPage;
