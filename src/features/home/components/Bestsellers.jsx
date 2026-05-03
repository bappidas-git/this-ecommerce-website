import ProductRail from '../../../components/product/ProductRail/ProductRail.jsx';
import useProducts from '../../../hooks/useProducts.js';
import { PATHS } from '../../../routes/paths.js';

function Bestsellers() {
  const { items, isLoading } = useProducts({ sort: 'bestselling', perPage: 8 });

  return (
    <ProductRail
      eyebrow="Loved most"
      title="Bestsellers"
      kicker="The pieces our customers reach for again and again."
      viewAllTo={`${PATHS.shop}?sort=bestsellers`}
      items={items}
      loading={isLoading}
      emptyHint="No bestsellers to show just yet."
      tone="surface"
      ariaLabel="Bestselling pieces"
    />
  );
}

export default Bestsellers;
