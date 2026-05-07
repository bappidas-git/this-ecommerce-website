import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AppDrawer from '../../common/AppDrawer/AppDrawer.jsx';
import AppButton from '../../common/AppButton/AppButton.jsx';
import Chip from '../../common/Chip/Chip.jsx';
import Eyebrow from '../../common/Eyebrow.jsx';
import MiniCartLine from './MiniCartLine.jsx';
import { useUI } from '../../../context/UIContext.jsx';
import { useCart } from '../../../context/CartContext.jsx';
import useProducts from '../../../hooks/useProducts.js';
import useDeferredLoading from '../../../hooks/useDeferredLoading.js';
import { formatCurrency } from '../../../utils/format.js';
import { PATHS } from '../../../routes/paths.js';
import styles from './MiniCartDrawer.module.css';

const AUTO_CLOSE_MS = 8000;
const RECOMMENDATION_COUNT = 4;

function MiniCartDrawer() {
  const { isCartOpen, openCart, closeCart } = useUI();
  const { state, itemCount, updateQty, removeItem } = useCart();
  const location = useLocation();

  const paperRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionTick, setInteractionTick] = useState(0);

  const hasItems = state.items.length > 0;

  // Auto-open on `ti:cart-add`
  useEffect(() => {
    function handleAdd() {
      openCart();
    }
    window.addEventListener('ti:cart-add', handleAdd);
    return () => window.removeEventListener('ti:cart-add', handleAdd);
  }, [openCart]);

  // Auto-close on route change
  const initialPathRef = useRef(location.pathname + location.search);
  useEffect(() => {
    const current = location.pathname + location.search;
    if (initialPathRef.current === current) return;
    initialPathRef.current = current;
    if (isCartOpen) closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // First focus → close button (after MUI's focus trap settles)
  useEffect(() => {
    if (!isCartOpen) return undefined;
    const t = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [isCartOpen]);

  // Track hover/focus + interactions inside the panel to pause idle timer
  useEffect(() => {
    if (!isCartOpen) return undefined;
    const paper = paperRef.current;
    if (!paper) return undefined;

    const onEnter = () => setIsInteracting(true);
    const onLeave = () => setIsInteracting(false);
    const onFocusIn = () => setIsInteracting(true);
    const onFocusOut = (e) => {
      if (!paper.contains(e.relatedTarget)) setIsInteracting(false);
    };
    const onActivity = () => setInteractionTick((n) => n + 1);

    paper.addEventListener('mouseenter', onEnter);
    paper.addEventListener('mouseleave', onLeave);
    paper.addEventListener('focusin', onFocusIn);
    paper.addEventListener('focusout', onFocusOut);
    paper.addEventListener('keydown', onActivity);
    paper.addEventListener('click', onActivity);
    paper.addEventListener('scroll', onActivity, true);
    paper.addEventListener('wheel', onActivity, { passive: true });
    paper.addEventListener('touchstart', onActivity, { passive: true });

    return () => {
      paper.removeEventListener('mouseenter', onEnter);
      paper.removeEventListener('mouseleave', onLeave);
      paper.removeEventListener('focusin', onFocusIn);
      paper.removeEventListener('focusout', onFocusOut);
      paper.removeEventListener('keydown', onActivity);
      paper.removeEventListener('click', onActivity);
      paper.removeEventListener('scroll', onActivity, true);
      paper.removeEventListener('wheel', onActivity);
      paper.removeEventListener('touchstart', onActivity);
    };
  }, [isCartOpen]);

  // Reset interaction state when drawer closes
  useEffect(() => {
    if (!isCartOpen) {
      setIsInteracting(false);
      setInteractionTick(0);
    }
  }, [isCartOpen]);

  // Idle auto-close (8s)
  useEffect(() => {
    if (!isCartOpen) return undefined;
    if (isInteracting) return undefined;
    const id = setTimeout(() => {
      closeCart();
    }, AUTO_CLOSE_MS);
    return () => clearTimeout(id);
  }, [isCartOpen, isInteracting, interactionTick, closeCart]);

  const handleViewBagClick = useCallback(() => {
    closeCart();
  }, [closeCart]);

  const handleCheckoutClick = useCallback(() => {
    closeCart();
  }, [closeCart]);

  const titleNode = useMemo(
    () => (
      <span className={styles.titleRow}>
        <span>Your bag</span>
        {itemCount > 0 ? (
          <Chip
            size="small"
            variant="soft"
            label={String(itemCount)}
            className={styles.countChip}
            aria-label={`${itemCount} items in bag`}
          />
        ) : null}
      </span>
    ),
    [itemCount],
  );

  const footerNode = hasItems ? (
    <div className={styles.footer}>
      <div className={styles.subtotalRow}>
        <span className={styles.subtotalLabel}>Subtotal</span>
        <span className={styles.subtotalValue}>
          {formatCurrency(state.subtotal, state.items[0]?.currency)}
        </span>
      </div>
      <p className={styles.shippingNote}>Shipping calculated at checkout</p>
      <div className={styles.actions}>
        <AppButton
          variant="ghost"
          fullWidth
          to={PATHS.cart}
          onClick={handleViewBagClick}
          className={styles.viewBagBtn}
        >
          View bag
        </AppButton>
        <AppButton
          variant="primary"
          fullWidth
          to={PATHS.checkout}
          onClick={handleCheckoutClick}
          className={styles.checkoutBtn}
        >
          Checkout
        </AppButton>
      </div>
    </div>
  ) : null;

  return (
    <AppDrawer
      open={isCartOpen}
      onClose={closeCart}
      anchor="right"
      disableScrollLock
      width="min(92vw, 420px)"
      title={titleNode}
      footer={footerNode}
      paperRef={paperRef}
      closeButtonRef={closeButtonRef}
      closeButtonLabel="Close shopping bag"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      className={styles.drawer}
    >
      {hasItems ? (
        <ul className={styles.lineList}>
          <AnimatePresence initial={false}>
            {state.items.map((item) => (
              <MiniCartLine
                key={item.productId}
                item={item}
                onUpdateQty={updateQty}
                onRemove={removeItem}
                onNavigate={closeCart}
              />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <EmptyBag onBrowse={closeCart} />
      )}
    </AppDrawer>
  );
}

function EmptyBag({ onBrowse }) {
  const { items, isLoading } = useProducts({
    sort: 'bestselling',
    perPage: RECOMMENDATION_COUNT,
  });
  const showSkeleton = useDeferredLoading(isLoading);

  return (
    <div className={styles.empty}>
      <div className={styles.emptyHero} role="status">
        <ShoppingBagOutlinedIcon className={styles.emptyIcon} />
        <Eyebrow color="muted" className={styles.emptyEyebrow}>
          Your bag is empty
        </Eyebrow>
        <p className={styles.emptyKicker}>Begin with something timeless.</p>
        <div className={styles.emptyCta}>
          <AppButton variant="primary" to={PATHS.shop} onClick={onBrowse}>
            Browse the collection
          </AppButton>
        </div>
      </div>

      {showSkeleton || items.length > 0 ? (
        <div className={styles.recommendations}>
          <p className={styles.recoTitle}>You might love</p>
          <ul className={styles.recoRail} role="list">
            {(showSkeleton ? Array.from({ length: RECOMMENDATION_COUNT }) : items)
              .slice(0, RECOMMENDATION_COUNT)
              .map((product, index) =>
                showSkeleton ? (
                  <li
                    key={`reco-skel-${index}`}
                    className={`${styles.recoItem} ${styles.recoSkeleton}`}
                    aria-hidden="true"
                  />
                ) : (
                  <li key={product.id ?? product.slug} className={styles.recoItem}>
                    <Link
                      to={PATHS.product(product.slug)}
                      className={styles.recoLink}
                      onClick={onBrowse}
                    >
                      <span className={styles.recoImageWrap}>
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            loading="lazy"
                            className={styles.recoImage}
                          />
                        ) : (
                          <span className={styles.recoImageFallback} aria-hidden="true">
                            {product.name?.[0] || 'T'}
                          </span>
                        )}
                      </span>
                      <span className={styles.recoName}>{product.name}</span>
                      <span className={styles.recoPrice}>
                        {formatCurrency(product.price, product.currency)}
                      </span>
                    </Link>
                  </li>
                ),
              )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default MiniCartDrawer;
