import Section from '../components/common/Section.jsx';
import Container from '../components/common/Container.jsx';
import SectionHeader from '../components/common/SectionHeader.jsx';
import { ProductCard } from '../components/product';

const PLACEHOLDER_BASE = 'https://placehold.co';

function img(text, variant = 1) {
  const palette = variant === 1 ? 'F7F3ED/1B1A17' : 'E5DED2/1B1A17';
  return `${PLACEHOLDER_BASE}/1200x1500/${palette}?text=${encodeURIComponent(text)}&font=playfair`;
}

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    slug: 'marble-carrara-vase',
    name: 'Marble Carrara Vase',
    price: 7800,
    compareAtPrice: null,
    currency: 'AED',
    images: [img('Carrara Vase 1', 1), img('Carrara Vase 2', 2)],
    rating: 4.6,
    reviewCount: 32,
    stock: 8,
    category: { name: 'Vases', slug: 'vases' },
  },
  {
    id: 2,
    slug: 'brass-taper-holder',
    name: 'Brass Taper Holder',
    price: 460,
    currency: 'AED',
    images: [img('Brass Taper 1', 1), img('Brass Taper 2', 2)],
    rating: 4.2,
    reviewCount: 11,
    stock: 0,
    category: { name: 'Lighting', slug: 'lighting' },
  },
  {
    id: 3,
    slug: 'emerald-glass-bowl',
    name: 'Emerald Glass Bowl',
    price: 980,
    compareAtPrice: 1380,
    currency: 'AED',
    images: [img('Emerald Bowl 1', 1), img('Emerald Bowl 2', 2)],
    rating: 4.9,
    reviewCount: 87,
    stock: 3,
    isNew: true,
    isOnSale: true,
    isLimited: true,
    category: { name: 'Tableware', slug: 'tableware' },
  },
];

function KitchenSinkProducts() {
  const handleQuickAdd = (product) => {
    // eslint-disable-next-line no-console
    console.log('quick-add', product.slug);
  };

  const handleWishlistToggle = (product, willBeWishlisted) => {
    // eslint-disable-next-line no-console
    console.log('wishlist', product.slug, willBeWishlisted);
  };

  return (
    <>
      <Section tone="cream">
        <Container gutter>
          <SectionHeader
            eyebrow="Kitchen Sink"
            title="ProductCard preview"
            kicker="Default, sold out, badges + sale, and skeleton — all rendered with the canonical ProductCard."
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container gutter>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
            }}
          >
            <ProductCard
              product={SAMPLE_PRODUCTS[0]}
              onQuickAdd={handleQuickAdd}
              onWishlistToggle={handleWishlistToggle}
            />
            <ProductCard
              product={SAMPLE_PRODUCTS[1]}
              onQuickAdd={handleQuickAdd}
              onWishlistToggle={handleWishlistToggle}
            />
            <ProductCard
              product={SAMPLE_PRODUCTS[2]}
              onQuickAdd={handleQuickAdd}
              onWishlistToggle={handleWishlistToggle}
            />
            <ProductCard.Skeleton />
          </div>
        </Container>
      </Section>

      <Section tone="cream">
        <Container gutter>
          <SectionHeader eyebrow="Density" title="Compact density" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20,
              marginTop: 16,
            }}
          >
            {SAMPLE_PRODUCTS.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                density="compact"
                onQuickAdd={handleQuickAdd}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
            <ProductCard.Skeleton density="compact" />
          </div>
        </Container>
      </Section>
    </>
  );
}

export default KitchenSinkProducts;
