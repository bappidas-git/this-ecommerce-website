import { useEffect, useState } from 'react';

import ProductRail from '../../../../components/product/ProductRail/ProductRail.jsx';
import productService from '../../../../api/services/productService.js';

function RelatedRail({ productId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return undefined;
    const controller = new AbortController();
    let active = true;
    setLoading(true);

    productService
      .getRelated(productId, { per_page: 8 }, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setItems(result.items ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setItems([]);
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId]);

  if (!loading && items.length === 0) return null;

  return (
    <ProductRail
      eyebrow="You may also like"
      title="Pieces in the same room"
      kicker="Quietly aligned with what you’re viewing."
      items={items}
      loading={loading}
      tone="cream"
      ariaLabel="Related products"
    />
  );
}

export default RelatedRail;
