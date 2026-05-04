import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

import AppBadge from '../../common/AppBadge/AppBadge.jsx';
import AppIconButton from '../../common/AppIconButton/AppIconButton.jsx';
import Eyebrow from '../../common/Eyebrow.jsx';
import PriceTag from '../../common/PriceTag.jsx';

import { PATHS } from '../../../routes/paths.js';
import { WishlistContext } from '../../../context/WishlistContext.jsx';
import { CartContext } from '../../../context/CartContext.jsx';
import { getProductPlaceholder, handleImageError } from '../../../utils/imageFallback.js';
import styles from './ProductCard.module.css';

/**
 * @typedef {Object} ProductCardProduct
 * @property {number|string} id
 * @property {string} slug
 * @property {string} name
 * @property {number} price
 * @property {number} [compareAtPrice]
 * @property {string} [currency]
 * @property {string[]} [images]
 * @property {number} [rating]
 * @property {number} [reviewCount]
 * @property {number} [stock]
 * @property {boolean} [isNew]
 * @property {boolean} [isOnSale]
 * @property {boolean} [isLimited]
 * @property {{ name?: string, slug?: string }} [category]
 */

function buildBadges(product) {
  const items = [];
  if (product.isNew) items.push({ key: 'new', variant: 'new' });
  if (product.isOnSale) items.push({ key: 'sale', variant: 'sale' });
  if (product.isLimited) items.push({ key: 'limited', variant: 'limited' });
  return items;
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
  // When no explicit handler is provided, fall back to cart context so the
  // shop & home rails can add to bag without prop wiring at every level.
  const handlerQuickAdd = typeof onQuickAdd === 'function' ? onQuickAdd : null;
  const cartQuickAdd = !handlerQuickAdd && cartCtx ? (p) => cartCtx.addItem(p, 1) : null;
  const effectiveQuickAdd = handlerQuickAdd || cartQuickAdd;
  const showQuickAdd = Boolean(effectiveQuickAdd);

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
    if (!wishlistedControlled) {
      setInternalWishlisted(next);
    }
  };

  const handleQuickAddClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof effectiveQuickAdd === 'function') {
      effectiveQuickAdd(product);
    }
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

  const wishlistLabel = wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`;
  const ratingValue = typeof rating === 'number' ? rating : null;
  const reviewsValue = typeof reviewCount === 'number' ? reviewCount : null;

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
        </div>

        <div className={styles.meta}>
          {category?.name ? (
            <Eyebrow color="muted" className={styles.eyebrow}>
              {category.name}
            </Eyebrow>
          ) : null}

          <h3 className={styles.name}>
            <span className={styles.nameInner}>{name}</span>
          </h3>

          {showRating && !isCompact && ratingValue !== null ? (
            <span className={styles.ratingRow} aria-label={`Rated ${ratingValue} out of 5`}>
              <StarRoundedIcon
                style={{ color: 'var(--color-brass)', fontSize: 14 }}
                aria-hidden="true"
              />
              <span className={styles.ratingValue}>{ratingValue.toFixed(1)}</span>
              {reviewsValue !== null ? (
                <span className={styles.ratingCount}>({reviewsValue})</span>
              ) : null}
            </span>
          ) : null}

          <span className={styles.priceRow}>
            <PriceTag value={price} compareAt={compareAtPrice} currency={currency} size="md" />
          </span>
        </div>
      </Link>

      <div className={styles.overlay} aria-hidden="false">
        {badges.length > 0 ? (
          <div className={styles.badges}>
            {badges.map((b) => (
              <AppBadge key={b.key} variant={b.variant} />
            ))}
          </div>
        ) : null}

        <AppIconButton
          aria-label={wishlistLabel}
          aria-pressed={wishlisted}
          size="small"
          className={[styles.wishlist, wishlisted ? styles.wishlistActive : null]
            .filter(Boolean)
            .join(' ')}
          onClick={handleWishlistClick}
        >
          {wishlisted ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </AppIconButton>

      </div>

      {overlayAction && !isSoldOut ? (
        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.addBag}
            aria-label={overlayAction.ariaLabel || overlayAction.label}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (typeof overlayAction.onClick === 'function') {
                overlayAction.onClick(product);
              }
            }}
          >
            <ShoppingBagOutlinedIcon
              fontSize="inherit"
              className={styles.addBagIcon}
              aria-hidden="true"
            />
            <span>{overlayAction.label}</span>
          </button>
        </div>
      ) : showQuickAdd || isSoldOut ? (
        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.addBag}
            disabled={isSoldOut}
            aria-label={isSoldOut ? `${name} is sold out` : `Add ${name} to bag`}
            onClick={isSoldOut ? undefined : handleQuickAddClick}
          >
            <ShoppingBagOutlinedIcon
              fontSize="inherit"
              className={styles.addBagIcon}
              aria-hidden="true"
            />
            <span>{isSoldOut ? 'Sold out' : 'Add to bag'}</span>
          </button>
        </div>
      ) : null}
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
