import { useEffect, useState } from 'react';

import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import PriceTag from '../../../../components/common/PriceTag.jsx';

import styles from './StickyAddBar.module.css';

function StickyAddBar({ product, anchorRef, onAddToCart, isAdding = false }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = anchorRef?.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { rootMargin: '-50% 0px 0px 0px', threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [anchorRef]);

  if (!product) return null;

  const isSoldOut = typeof product.stock === 'number' && product.stock <= 0;

  return (
    <div
      className={[styles.root, visible ? styles.visible : null].filter(Boolean).join(' ')}
      aria-hidden={!visible}
    >
      <div className={styles.inner}>
        <div className={styles.meta}>
          <span className={styles.name}>{product.name}</span>
          <PriceTag
            value={product.price}
            compareAt={product.compareAtPrice}
            currency={product.currency}
            size="sm"
          />
        </div>
        <AppButton
          variant="primary"
          size="medium"
          loading={isAdding}
          disabled={isSoldOut}
          onClick={() => onAddToCart?.(product, 1)}
          tabIndex={visible ? 0 : -1}
        >
          {isSoldOut ? 'Sold out' : isAdding ? 'Adding…' : 'Add to bag'}
        </AppButton>
      </div>
    </div>
  );
}

export default StickyAddBar;
