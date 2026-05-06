import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import Seo from '../../../components/common/Seo.jsx';

import { useToast } from '../../../context/ToastContext.jsx';

import Section from '../../../components/common/Section.jsx';
import Container from '../../../components/common/Container.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import ProductCard from '../../../components/product/ProductCard/ProductCard.jsx';

import { useWishlist } from '../../../hooks/useWishlist.js';
import { useCart } from '../../../context/CartContext.jsx';
import productService from '../../../api/services/productService.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './WishlistPage.module.css';

function WishlistPage({ variant = 'standalone' }) {
  const { productIds, isHydrated, remove, clear, count } = useWishlist();
  const { addItem } = useCart();
  const { success, warning } = useToast();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const cacheRef = useRef(new Map()); // productId -> product

  // Compose products from cache + fetch missing
  useEffect(() => {
    if (!isHydrated) return undefined;
    if (productIds.length === 0) {
      setProducts([]);
      return undefined;
    }

    const cache = cacheRef.current;
    const missing = productIds.filter((id) => !cache.has(String(id)));

    // Render whatever we have from cache straight away.
    const fromCache = productIds
      .map((id) => cache.get(String(id)))
      .filter(Boolean);
    setProducts(fromCache);

    if (missing.length === 0) return undefined;

    setIsLoading(true);
    const ctrl = new AbortController();

    productService
      .list({ ids: missing }, { signal: ctrl.signal })
      .then((result) => {
        const items = Array.isArray(result?.items) ? result.items : [];
        const missingKeys = new Set(missing.map((id) => String(id)));
        for (const p of items) {
          const pid = p?.id ?? p?.productId;
          if (pid === undefined || pid === null) continue;
          // Only keep the ones we asked for in case the API doesn't honour `ids`.
          if (!missingKeys.has(String(pid))) continue;
          cache.set(String(pid), p);
        }
        const next = productIds
          .map((id) => cache.get(String(id)))
          .filter(Boolean);
        setProducts(next);
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        // best-effort — leave whatever's already rendered
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => ctrl.abort();
  }, [productIds, isHydrated]);

  // Drop cached products that have been removed from the wishlist
  useEffect(() => {
    const cache = cacheRef.current;
    const keep = new Set(productIds.map((id) => String(id)));
    for (const key of cache.keys()) {
      if (!keep.has(key)) cache.delete(key);
    }
  }, [productIds]);

  const handleMoveToBag = useCallback(
    async (product) => {
      if (!product) return;
      const pid = product.id ?? product.productId;
      if (typeof product.stock === 'number' && product.stock <= 0) {
        warning(`${product.name || 'This piece'} is sold out`);
        return;
      }
      addItem(
        {
          productId: pid,
          slug: product.slug,
          name: product.name,
          image:
            product.image ||
            (Array.isArray(product.images) ? product.images[0] : ''),
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          currency: product.currency,
          stock: product.stock,
        },
        1,
      );
      await remove(pid);
      success(`${product.name || 'Piece'} moved to your bag`);
    },
    [addItem, remove, success, warning],
  );

  const handleMoveAll = useCallback(async () => {
    if (products.length === 0) return;
    let moved = 0;
    for (const product of products) {
      const pid = product.id ?? product.productId;
      if (typeof product.stock === 'number' && product.stock <= 0) continue;
      addItem(
        {
          productId: pid,
          slug: product.slug,
          name: product.name,
          image:
            product.image ||
            (Array.isArray(product.images) ? product.images[0] : ''),
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          currency: product.currency,
          stock: product.stock,
        },
        1,
      );
      // eslint-disable-next-line no-await-in-loop
      await remove(pid);
      moved += 1;
    }
    if (moved > 0) {
      success(
        moved === 1 ? '1 piece moved to your bag' : `${moved} pieces moved to your bag`,
      );
    } else {
      warning('Nothing available to move');
    }
  }, [products, addItem, remove, success, warning]);

  const handleConfirmClear = useCallback(() => {
    clear();
    setConfirmClearOpen(false);
  }, [clear]);

  const captionText = useMemo(() => {
    if (!isHydrated) return 'Loading your wishlist…';
    if (count === 0) return 'No pieces saved yet';
    return count === 1 ? '1 piece saved' : `${count} pieces saved`;
  }, [count, isHydrated]);

  const isEmpty = isHydrated && count === 0;
  const isAccount = variant === 'account';

  const headerNode = isAccount ? (
    <header className={styles.accountWrap}>
      <Eyebrow color="brass">Saved for later</Eyebrow>
      <h2 className={styles.accountHeading}>Your wishlist</h2>
      <p className={styles.caption}>{captionText}</p>
    </header>
  ) : (
    <header className={styles.header}>
      <Eyebrow color="muted">Saved</Eyebrow>
      <h1 className={styles.heading}>Your wishlist</h1>
      <p className={styles.caption}>{captionText}</p>
    </header>
  );

  const bulkBar =
    !isEmpty && count > 0 ? (
      <div className={styles.bulkBar} role="toolbar" aria-label="Wishlist bulk actions">
        <AppButton variant="ghost" size="small" onClick={handleMoveAll}>
          Move all to bag
        </AppButton>
        <span className={styles.bulkDivider} aria-hidden="true" />
        <AppButton
          variant="ghost"
          size="small"
          onClick={() => setConfirmClearOpen(true)}
        >
          Clear wishlist
        </AppButton>
      </div>
    ) : null;

  const body = isEmpty ? (
    <div className={styles.empty}>
      <EmptyState
        icon={<FavoriteBorderIcon fontSize="inherit" />}
        title="Your wishlist is quiet, for now."
        description="Save the pieces that catch your eye — we'll keep them here so you can return when you're ready."
        cta={
          <AppButton variant="primary" to={PATHS.shop}>
            Discover the collection
          </AppButton>
        }
      />
    </div>
  ) : (
    <>
      {bulkBar}
      <div className={styles.grid}>
        {isLoading && products.length === 0
          ? Array.from({ length: Math.min(count, 8) }).map((_, idx) => (
              <div key={idx} className={styles.gridItem}>
                <ProductCard.Skeleton />
              </div>
            ))
          : products.map((product) => (
              <div key={product.id ?? product.productId} className={styles.gridItem}>
                <ProductCard
                  product={product}
                  density="standard"
                  overlayAction={{
                    label: 'Move to bag',
                    ariaLabel: `Move ${product.name || 'piece'} to bag`,
                    onClick: handleMoveToBag,
                  }}
                />
              </div>
            ))}
      </div>
    </>
  );

  const content = (
    <>
      <Seo title="Your wishlist | THIS Interiors" noindex />

      {headerNode}
      {body}

      <AppDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear your wishlist?"
        description="This will remove every saved piece. You can always add them back later."
        size="sm"
        actions={
          <>
            <AppButton variant="ghost" onClick={() => setConfirmClearOpen(false)}>
              Keep saved
            </AppButton>
            <AppButton variant="danger" onClick={handleConfirmClear}>
              Clear wishlist
            </AppButton>
          </>
        }
      />
    </>
  );

  if (isAccount) {
    return <section>{content}</section>;
  }

  return (
    <Section tone="cream" className={styles.section}>
      <Container gutter>{content}</Container>
    </Section>
  );
}

export default WishlistPage;
