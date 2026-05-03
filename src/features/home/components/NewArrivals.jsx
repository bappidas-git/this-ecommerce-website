import ProductRail from '../../../components/product/ProductRail/ProductRail.jsx';
import useProducts from '../../../hooks/useProducts.js';
import { PATHS } from '../../../routes/paths.js';

function NewArrivals() {
  const { items, isLoading } = useProducts({ sort: 'newest', perPage: 8 });

  return (
    <ProductRail
      eyebrow="Just landed"
      title="New arrivals"
      kicker="The latest pieces from the studio — picked while still warm from the workshop."
      viewAllTo={`${PATHS.shop}?sort=newest`}
      items={items}
      loading={isLoading}
      emptyHint="Fresh arrivals are on their way — check back soon."
      ariaLabel="New arrivals"
    />
  );
}

export default NewArrivals;
