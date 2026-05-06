import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import { AnimatePresence, motion } from 'framer-motion';

import Container from '../../../components/common/Container.jsx';
import Section from '../../../components/common/Section.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import Seo from '../../../components/common/Seo.jsx';
import ProductRail from '../../../components/product/ProductRail/ProductRail.jsx';
import CartItemsTable from '../components/CartItemsTable.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import CartStickyBar from '../components/CartStickyBar.jsx';

import { useCart } from '../../../context/CartContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { useWishlist } from '../../../hooks/useWishlist.js';
import useProducts from '../../../hooks/useProducts.js';
import productService from '../../../api/services/productService.js';

import styles from './CartPage.module.css';

const RECONCILE_BANNER_MS = 6000;
const UNDO_REMOVE_MS = 4000;

function CartPage() {
  const {
    state,
    itemCount,
    updateQty,
    removeItem,
    addItem,
    setCoupon,
    clearCoupon,
    reconcileStock,
  } = useCart();
  const { add: addToWishlist } = useWishlist();
  const { info, success, dismiss } = useToast();

  const summaryRef = useRef(null);
  const [showReconcileBanner, setShowReconcileBanner] = useState(false);
  const reconcileRanRef = useRef(false);
  const reconcileTimerRef = useRef(null);

  const { items: bestsellers, isLoading: isBestsellersLoading } = useProducts({
    sort: 'bestselling',
    perPage: 8,
  });

  // Stock reconciliation on mount
  useEffect(() => {
    if (reconcileRanRef.current) return undefined;
    if (!state.isHydrated) return undefined;
    if (state.items.length === 0) {
      reconcileRanRef.current = true;
      return undefined;
    }
    reconcileRanRef.current = true;

    const ctrl = new AbortController();
    const ids = state.items.map((it) => it.productId);
    const before = state.items.reduce(
      (acc, it) => ({ ...acc, [it.productId]: it.qty }),
      {},
    );

    productService
      .list({ ids }, { signal: ctrl.signal })
      .then((result) => {
        const products = result?.items || [];
        const updates = {};
        for (const p of products) {
          const id = p.id ?? p.productId;
          if (id === undefined) continue;
          if (typeof p.stock === 'number') {
            updates[id] = p.stock;
          }
        }
        if (Object.keys(updates).length === 0) return;

        const adjusted = Object.entries(updates).some(([id, stock]) => {
          const prevQty = before[id];
          return (
            typeof prevQty === 'number' &&
            typeof stock === 'number' &&
            (prevQty > stock || stock <= 0)
          );
        });

        reconcileStock(updates);

        if (adjusted) {
          setShowReconcileBanner(true);
          if (reconcileTimerRef.current) clearTimeout(reconcileTimerRef.current);
          reconcileTimerRef.current = setTimeout(() => {
            setShowReconcileBanner(false);
            reconcileTimerRef.current = null;
          }, RECONCILE_BANNER_MS);
        }
      })
      .catch(() => {
        /* ignore: best-effort reconciliation */
      });

    return () => {
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isHydrated]);

  useEffect(
    () => () => {
      if (reconcileTimerRef.current) clearTimeout(reconcileTimerRef.current);
    },
    [],
  );

  const currency = state.items[0]?.currency || 'AED';

  const handleRemove = useCallback(
    (productId) => {
      const item = state.items.find((it) => it.productId === productId);
      if (!item) return;
      removeItem(productId);

      const undoKey = info(`${item.name} removed.`, {
        autoHideDuration: UNDO_REMOVE_MS,
        action: (key) => (
          <button
            type="button"
            className={styles.snackbarUndo}
            onClick={() => {
              addItem(item, item.qty);
              dismiss(key);
            }}
          >
            Undo
          </button>
        ),
      });
      // Touch the key to keep ESLint quiet about the unused returned id.
      void undoKey;
    },
    [state.items, removeItem, addItem, info, dismiss],
  );

  const handleMoveToWishlist = useCallback(
    async (item) => {
      await addToWishlist({ productId: item.productId, id: item.productId });
      removeItem(item.productId);
    },
    [addToWishlist, removeItem],
  );

  const handleApplyCoupon = useCallback(
    (couponData) => {
      setCoupon(couponData);
      success(`Coupon ${couponData.code} applied`);
    },
    [setCoupon, success],
  );

  const handleClearCoupon = useCallback(() => {
    clearCoupon();
  }, [clearCoupon]);

  return (
    <>
      <Seo title="Your bag | THIS Interiors" noindex />

      <Section tone="cream" className={styles.section}>
        <Container gutter>
          <header className={styles.header}>
            <Eyebrow color="muted">Cart</Eyebrow>
            <h1 className={styles.heading}>Your bag</h1>
            <p className={styles.caption}>
              {itemCount === 0
                ? 'No pieces yet'
                : `${itemCount} ${itemCount === 1 ? 'piece' : 'pieces'}`}
            </p>
          </header>

          <AnimatePresence initial={false}>
            {showReconcileBanner ? (
              <motion.div
                key="reconcile-banner"
                className={styles.bannerWrap}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Alert
                  severity="info"
                  variant="outlined"
                  className={styles.banner}
                  onClose={() => setShowReconcileBanner(false)}
                >
                  Some quantities were updated to reflect availability.
                </Alert>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className={styles.layout}>
            <div className={styles.itemsCol}>
              <CartItemsTable
                items={state.items}
                onUpdateQty={updateQty}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
              />
            </div>

            <div className={styles.summaryCol} ref={summaryRef}>
              <OrderSummary
                subtotal={state.subtotal}
                discount={state.discount}
                tax={state.tax}
                total={state.total}
                currency={currency}
                itemCount={itemCount}
                couponCode={state.couponCode}
                onApplyCoupon={handleApplyCoupon}
                onClearCoupon={handleClearCoupon}
              />
            </div>
          </div>
        </Container>
      </Section>

      <ProductRail
        eyebrow="You may also love"
        title="Pieces from the studio"
        kicker="Hand-selected to live alongside what's in your bag."
        items={bestsellers}
        loading={isBestsellersLoading}
        tone="surface"
        ariaLabel="Recommended pieces"
      />

      <CartStickyBar
        summaryRef={summaryRef}
        total={state.total}
        currency={currency}
        itemCount={itemCount}
      />
    </>
  );
}

export default CartPage;
