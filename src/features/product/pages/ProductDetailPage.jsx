import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Breadcrumbs from '../../../components/common/Breadcrumbs/Breadcrumbs.jsx';
import Container from '../../../components/common/Container.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import Section from '../../../components/common/Section.jsx';

import Gallery from '../components/Gallery/Gallery.jsx';
import Buybox from '../components/Buybox/Buybox.jsx';
import ProductAccordions from '../components/ProductAccordions/ProductAccordions.jsx';
import RelatedRail from '../components/RelatedRail/RelatedRail.jsx';
import RecentlyViewedRail, {
  pushRecentlyViewed,
} from '../components/RecentlyViewedRail/RecentlyViewedRail.jsx';
import StickyAddBar from '../components/StickyAddBar/StickyAddBar.jsx';
import PdpSkeleton from '../components/PdpSkeleton/PdpSkeleton.jsx';

import useProduct from '../../../hooks/useProduct.js';
import useCategories from '../../../hooks/useCategories.js';
import { PATHS } from '../../../routes/paths.js';
import { formatCurrency } from '../../../utils/format.js';

import styles from './ProductDetailPage.module.css';

const FALLBACK_OG = 'https://placehold.co/1200x630/F7F3ED/1B1A17?text=THIS+Interiors&font=playfair';

function buildAvailability(stock) {
  if (typeof stock !== 'number') return 'https://schema.org/InStock';
  if (stock <= 0) return 'https://schema.org/OutOfStock';
  return 'https://schema.org/InStock';
}

function buildJsonLd({ product, category, canonical }) {
  if (!product) return null;
  const description = (product.description || '').split(/\n\s*\n/)[0] || '';
  const offers = {
    '@type': 'Offer',
    url: canonical,
    priceCurrency: product.currency || 'AED',
    price: product.price,
    availability: buildAvailability(product.stock),
    itemCondition: 'https://schema.org/NewCondition',
  };

  const aggregateRating =
    typeof product.rating === 'number' && product.rating > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount ?? 0,
        }
      : undefined;

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: Array.isArray(product.images) ? product.images : [],
    description,
    sku: product.sku,
    category: category?.name,
    brand: { '@type': 'Brand', name: 'THIS Interiors' },
    offers,
    ...(aggregateRating ? { aggregateRating } : {}),
  };
}

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isNotFound, isError } = useProduct(slug);
  const { items: categories } = useCategories();

  const buyboxAnchorRef = useRef(null);

  const category = useMemo(() => {
    if (!product) return null;
    if (product.category) return product.category;
    if (Array.isArray(categories) && product.categoryId) {
      return categories.find((c) => c.id === product.categoryId) || null;
    }
    return null;
  }, [product, categories]);

  useEffect(() => {
    if (product) pushRecentlyViewed({ ...product, category });
  }, [product, category]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [slug]);

  const canonical = `/products/${slug}`;
  const ogImage = product?.images?.[0] || FALLBACK_OG;
  const seoTitle = product
    ? `${product.name} · THIS Interiors`
    : 'Product · THIS Interiors';
  const seoDescription = product
    ? (product.description || '').split(/\n\s*\n/)[0]?.slice(0, 200) ||
      'Editorial homewares from THIS Interiors.'
    : 'Editorial homewares from THIS Interiors.';
  const jsonLd = buildJsonLd({ product, category, canonical });

  const handleAddToCart = (item, quantity) => {
    if (!item) return;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ti:cart:add', {
          detail: {
            productId: item.id,
            quantity,
            price: item.price,
            name: item.name,
          },
        }),
      );
    }
  };

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: 'Home', to: PATHS.home },
      { label: 'Shop', to: PATHS.shop },
    ];
    if (category?.name && category?.slug) {
      items.push({ label: category.name, to: PATHS.category(category.slug) });
    }
    if (product?.name) items.push({ label: product.name });
    return items;
  }, [category, product]);

  if (isLoading) {
    return (
      <Section tone="cream">
        <Container gutter>
          <div className={styles.crumbWrap}>
            <Breadcrumbs items={[{ label: 'Home', to: PATHS.home }, { label: 'Shop', to: PATHS.shop }, { label: 'Loading…' }]} />
          </div>
          <PdpSkeleton />
        </Container>
      </Section>
    );
  }

  if (isNotFound || (!product && isError === false)) {
    return (
      <Section tone="cream">
        <Container gutter>
          <Helmet>
            <title>Piece not found · THIS Interiors</title>
            <meta name="robots" content="noindex" />
          </Helmet>
          <EmptyState
            title="We couldn’t find that piece."
            description="It may have moved on to a new home, or the link could be out of date."
            cta={
              <AppButton variant="primary" to={PATHS.shop}>
                Back to shop
              </AppButton>
            }
          />
        </Container>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section tone="cream">
        <Container gutter>
          <ErrorState
            title="Something went wrong"
            description="We couldn’t load this piece. Please try again in a moment."
            onRetry={() => navigate(0)}
          />
        </Container>
      </Section>
    );
  }

  if (!product) return null;

  const formattedPrice = formatCurrency(product.price, product.currency || 'AED');

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonical} />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content={product.currency || 'AED'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        {jsonLd ? (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        ) : null}
      </Helmet>

      <Section tone="cream" className={styles.topSection}>
        <Container gutter>
          <div className={styles.crumbWrap}>
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <div className={styles.layout}>
            <div className={styles.galleryCol}>
              <Gallery product={product} />
            </div>

            <div className={styles.buyboxCol} ref={buyboxAnchorRef}>
              <Buybox
                product={product}
                category={category}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>

          <div className={styles.accordionsWrap}>
            <ProductAccordions product={product} />
          </div>

          <div id="reviews" className={styles.reviewsAnchor} aria-hidden="true" />
        </Container>
      </Section>

      <RelatedRail productId={product.id} />
      <RecentlyViewedRail currentProductId={product.id} />

      <StickyAddBar
        product={product}
        anchorRef={buyboxAnchorRef}
        onAddToCart={handleAddToCart}
      />

      <span className={styles.srOnly} aria-live="polite">
        {product.name} priced at {formattedPrice}
      </span>
    </>
  );
}

export default ProductDetailPage;
