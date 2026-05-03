import { useEffect, useState } from 'react';

import ProductRail from '../../../../components/product/ProductRail/ProductRail.jsx';

const STORAGE_KEY = 'ti_recently_viewed';
const CAP = 12;

function readStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* swallow */
  }
}

export function pushRecentlyViewed(product) {
  if (!product?.id) return;
  const minimal = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    currency: product.currency,
    images: Array.isArray(product.images) ? product.images.slice(0, 2) : [],
    rating: product.rating ?? null,
    reviewCount: product.reviewCount ?? 0,
    stock: product.stock ?? null,
    isNew: Boolean(product.isNew),
    isOnSale: Boolean(product.isOnSale),
    isLimited: Boolean(product.isLimited),
    category: product.category || null,
    viewedAt: Date.now(),
  };

  const existing = readStorage().filter((p) => p.id !== minimal.id);
  const next = [minimal, ...existing].slice(0, CAP);
  writeStorage(next);
}

function RecentlyViewedRail({ currentProductId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const all = readStorage();
    setItems(all.filter((p) => p.id !== currentProductId));
  }, [currentProductId]);

  if (items.length === 0) return null;

  return (
    <ProductRail
      eyebrow="Lately"
      title="Recently viewed"
      kicker="Pick up where you left off."
      items={items}
      loading={false}
      tone="cream"
      ariaLabel="Recently viewed products"
    />
  );
}

export default RecentlyViewedRail;
