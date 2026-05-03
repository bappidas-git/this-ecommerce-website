import { forwardRef } from 'react';
import ProductCard from '../../../../components/product/ProductCard/ProductCard.jsx';
import styles from './ProductGrid.module.css';

const ProductGrid = forwardRef(function ProductGrid(
  { products = [], view = 'grid', isLoading = false, skeletonCount = 12 },
  ref,
) {
  const isList = view === 'list';
  const containerClass = isList ? styles.list : styles.grid;
  const itemClass = isList ? styles.listItem : styles.gridItem;

  if (isLoading) {
    return (
      <div ref={ref} className={containerClass} aria-busy="true">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div key={idx} className={itemClass}>
            <ProductCard.Skeleton density={isList ? 'compact' : 'standard'} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={containerClass}>
      {products.map((product) => (
        <div key={product.id ?? product.slug} className={itemClass}>
          <ProductCard product={product} density={isList ? 'compact' : 'standard'} />
        </div>
      ))}
    </div>
  );
});

export default ProductGrid;
