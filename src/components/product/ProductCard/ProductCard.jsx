import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import AppBadge from '../../common/AppBadge/AppBadge.jsx';

import { PATHS } from '../../../routes/paths.js';
import { WishlistContext } from '../../../context/WishlistContext.jsx';
import { CartContext } from '../../../context/CartContext.jsx';
import { getProductPlaceholder, handleImageError } from '../../../utils/imageFallback.js';
import { formatCurrency } from '../../../utils/format.js';
import styles from './ProductCard.module.css';

const BADGE_PRIORITY = ['sale', 'new', 'bestseller', 'limited'];
const BADGE_LABEL = {
  sale: 'Sale',
  new: 'New',
  bestseller: 'Bestseller',
  limited: 'Limited',
};
const MAX_BADGES = 2;

function buildBadges(product) {
  const set = new Set();
  if (product.isOnSale) set.add('sale');
  if (product.isNew) set.add('new');
  if (product.isBestseller) set.add('bestseller');
  if (product.isLimited) set.add('limited');
  return BADGE_PRIORITY.filter((key) => set.has(key)).slice(0, MAX_BADGES);
}

function ProductCard({
  product,
  density = 'standard',
  showRating = true,
  onQuickAdd,
  onWishlistToggle,
  isWishlisted,
  overlayAction,
  className,
}) {
  // `overlayAction` is a higher-priority click target (e.g. Wishlist's
  // "Move to bag") that replaces the default add-to-bag handler.
  const overlayClick =
    overlayAction && typeof overlayAction.onClick === 'function'
      ? overlayAction.onClick
      : null;
  const overlayLabel = overlayAction?.label;
  const reduceMotion = useReducedMotion();
  const wishlistCtx = useContext(WishlistContext);
  const cartCtx = useContext(CartContext);
  const wishlistedControlled = typeof isWishlisted === 'boolean';
  const [internalWishlisted, setInternalWishlisted] = useState(false);
  const ctxWishlisted =
    wishlistCtx && product
      ? wishlistCtx.isWishlisted(product.id ?? product.productId)
      : null;
  const wishlisted = wishlistedControlled
    ? isWishlisted
    : ctxWishlisted !== null
      ? ctxWishlisted
      : internalWishlisted;

  useEffect(() => {
    if (wishlistedControlled) return;
    setInternalWishlisted(false);
  }, [product?.id, wishlistedControlled]);

  if (!product) return null;

  const {
    slug,
    name,
    price,
    compareAtPrice,
    currency,
    images = [],
    rating,
    reviewCount,
    stock,
    category,
  } = product;

  const isCompact = density === 'compact';
  const isSoldOut = typeof stock === 'number' && stock <= 0;
  const fallbackImage = getProductPlaceholder(name || 'THIS Interiors');
  const primaryImage = images[0] || fallbackImage;
  const secondaryImage = images[1];
  const hasSecondary = Boolean(secondaryImage) && secondaryImage !== primaryImage;
  const badges = buildBadges(product);
  const productHref = slug ? PATHS.product(slug) : '#';

  const handlerQuickAdd = typeof onQuickAdd === 'function' ? onQuickAdd : null;
  const cartQuickAdd =
    !handlerQuickAdd && !overlayClick && cartCtx
      ? (p) => cartCtx.addItem(p, 1)
      : null;
  const effectiveQuickAdd = overlayClick || handlerQuickAdd || cartQuickAdd;
  const showQuickAdd = Boolean(effectiveQuickAdd) && !isSoldOut;

  const handleWishlistClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = !wishlisted;
    if (typeof onWishlistToggle === 'function') {
      if (!wishlistedControlled && ctxWishlisted === null) {
        setInternalWishlisted(next);
      }
      onWishlistToggle(product, next);
      return;
    }
    if (wishlistCtx) {
      wishlistCtx.toggle(product);
      return;
    }
    if (!wishlistedControlled) setInternalWishlisted(next);
  };

  const handleQuickAddClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof effectiveQuickAdd === 'function') effectiveQuickAdd(product);
  };

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      };

  const rootClasses = [styles.root, isCompact ? styles.compact : null, className]
    .filter(Boolean)
    .join(' ');

  const wishlistLabel = wishlisted
    ? `Remove ${name} from wishlist`
    : `Add ${name} to wishlist`;
  const ratingValue = typeof rating === 'number' ? rating : null;
  const reviewsValue = typeof reviewCount === 'number' ? reviewCount : null;
  const hasReviews = reviewsValue !== null && reviewsValue > 0;

  const hasDiscount =
    typeof compareAtPrice === 'number' &&
    typeof price === 'number' &&
    compareAtPrice > price;
  const savePct = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <motion.article className={rootClasses} {...motionProps}>
      <Link to={productHref} aria-label={name} className={styles.cardLink}>
        <div className={styles.imageArea}>
          <img
            src={primaryImage}
            alt={name}
            loading="lazy"
            className={`${styles.image} ${styles.imagePrimary}`}
            onError={(e) => handleImageError(e, name)}
          />

          {hasSecondary ? (
            <img
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className={`${styles.image} ${styles.imageSecondary}`}
              onError={(e) => handleImageError(e, name)}
            />
          ) : null}

          {badges.length > 0 ? (
            <div className={styles.badges}>
              {badges.map((key) => (
                <AppBadge key={key} variant={key}>
                  {BADGE_LABEL[key]}
                </AppBadge>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            aria-label={wishlistLabel}
            aria-pressed={wishlisted}
            className={[styles.wishlist, wishlisted ? styles.wishlistActive : null]
              .filter(Boolean)
              .join(' ')}
            onClick={handleWishlistClick}
          >
            {wishlisted ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </button>

          {isSoldOut ? (
            <span className={styles.soldOutBar} aria-live="polite">
              Sold out
            </span>
          ) : showQuickAdd ? (
            <>
              <button
                type="button"
                className={styles.addBag}
                aria-label={overlayLabel ? `${overlayLabel} — ${name}` : `Add ${name} to bag`}
                onClick={handleQuickAddClick}
              >
                {overlayLabel || 'Add to bag'}
              </button>
              <button
                type="button"
                className={styles.addBagMobile}
                aria-label={overlayLabel ? `${overlayLabel} — ${name}` : `Add ${name} to bag`}
                onClick={handleQuickAddClick}
              >
                <AddRoundedIcon fontSize="inherit" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>

        <div className={styles.meta}>
          {category?.name ? (
            <span className={styles.eyebrow}>{category.name}</span>
          ) : (
            <span className={styles.eyebrow} aria-hidden="true">
              &nbsp;
            </span>
          )}

          <h3 className={styles.name}>{name}</h3>

          {showRating && !isCompact && ratingValue !== null && hasReviews ? (
            <span
              className={styles.ratingRow}
              aria-label={`Rated ${ratingValue} out of 5 from ${reviewsValue} reviews`}
            >
              <StarRoundedIcon
                style={{ color: 'var(--color-brass)', fontSize: 14 }}
                aria-hidden="true"
              />
              <span className={styles.ratingValue}>{ratingValue.toFixed(1)}</span>
              <span className={styles.ratingCount}>({reviewsValue})</span>
            </span>
          ) : (
            <span className={styles.ratingRow} aria-hidden="true">
              &nbsp;
            </span>
          )}

          <span className={styles.priceRow}>
            <span className={styles.price}>
              {formatCurrency(price, currency || 'AED')}
            </span>
            {hasDiscount ? (
              <span className={styles.compare} aria-label="Original price">
                {formatCurrency(compareAtPrice, currency || 'AED')}
              </span>
            ) : null}
            {hasDiscount && savePct > 0 ? (
              <span
                className={styles.savePill}
                aria-label={`${savePct} percent off`}
              >
                –{savePct}%
              </span>
            ) : null}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function ProductCardSkeleton({ density = 'standard', showRating = true, className }) {
  const isCompact = density === 'compact';
  const rootClasses = [
    styles.root,
    styles.skeleton,
    isCompact ? styles.compact : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses} aria-hidden="true">
      <div className={styles.imageArea} />
      <div className={styles.meta}>
        <span className={`${styles.skeletonLine} ${styles.skeletonEyebrow}`} />
        <span className={`${styles.skeletonLine} ${styles.skeletonName}`} />
        <span
          className={`${styles.skeletonLine} ${styles.skeletonName} ${styles.skeletonNameShort}`}
        />
        {showRating && !isCompact ? (
          <span className={`${styles.skeletonLine} ${styles.skeletonRating}`} />
        ) : null}
        <span className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
      </div>
    </div>
  );
}

ProductCard.Skeleton = ProductCardSkeleton;

export default ProductCard;
