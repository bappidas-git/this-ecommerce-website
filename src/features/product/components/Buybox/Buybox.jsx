import { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';

import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import Eyebrow from '../../../../components/common/Eyebrow.jsx';
import PriceTag from '../../../../components/common/PriceTag.jsx';
import QuantityStepper from '../../../../components/common/QuantityStepper/QuantityStepper.jsx';
import { PATHS } from '../../../../routes/paths.js';

import styles from './Buybox.module.css';

function firstParagraph(text) {
  if (typeof text !== 'string') return '';
  const para = text.split(/\n\s*\n/)[0] || '';
  return para.trim();
}

function StockIndicator({ stock }) {
  if (typeof stock !== 'number') return null;
  if (stock <= 0) {
    return (
      <span className={[styles.stock, styles.stockOut].join(' ')} role="status">
        Sold out
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className={[styles.stock, styles.stockLow].join(' ')} role="status">
        <span className={styles.stockDot} aria-hidden="true" />
        Only {stock} left
      </span>
    );
  }
  return (
    <span className={[styles.stock, styles.stockOk].join(' ')} role="status">
      <span className={styles.stockDot} aria-hidden="true" />
      In stock
    </span>
  );
}

function Buybox({ product, category, onAddToCart, onWishlistToggle, isWishlisted = false }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [savedLocal, setSavedLocal] = useState(isWishlisted);

  if (!product) return null;

  const stock = typeof product.stock === 'number' ? product.stock : null;
  const isSoldOut = stock !== null && stock <= 0;
  const summary = firstParagraph(product.description);
  const rating = typeof product.rating === 'number' ? product.rating : null;
  const reviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : 0;
  const isWishlistedActive = typeof onWishlistToggle === 'function' ? isWishlisted : savedLocal;

  const handleAdd = async () => {
    if (isSoldOut) return;
    setIsAdding(true);
    try {
      await Promise.resolve(onAddToCart?.(product, quantity));
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = () => {
    if (typeof onWishlistToggle === 'function') {
      onWishlistToggle(product, !isWishlisted);
    } else {
      setSavedLocal((s) => !s);
    }
  };

  const categoryHref = category?.slug ? PATHS.category(category.slug) : null;

  return (
    <aside className={styles.root} aria-label="Product summary">
      {category?.name ? (
        categoryHref ? (
          <Eyebrow as={Link} to={categoryHref} className={styles.eyebrowLink}>
            {category.name}
          </Eyebrow>
        ) : (
          <Eyebrow>{category.name}</Eyebrow>
        )
      ) : null}

      <h1 className={styles.title}>{product.name}</h1>

      <div className={styles.priceRow}>
        <PriceTag
          value={product.price}
          compareAt={product.compareAtPrice}
          currency={product.currency}
          size="lg"
        />
      </div>

      <div className={styles.ratingRow}>
        {rating !== null ? (
          <a className={styles.ratingLink} href="#reviews">
            <StarRoundedIcon className={styles.ratingStar} aria-hidden="true" />
            <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            <span className={styles.ratingCount}>
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </a>
        ) : (
          <span className={styles.ratingMuted}>No reviews yet</span>
        )}
        <a href="#reviews" className={styles.reviewsLink}>
          Read all reviews
        </a>
      </div>

      {summary ? <p className={styles.summary}>{summary}</p> : null}

      <StockIndicator stock={stock} />

      <div className={styles.actions}>
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={Math.max(1, stock ?? 99)}
          disabled={isSoldOut}
        />
        <AppButton
          variant="primary"
          size="large"
          fullWidth
          loading={isAdding}
          disabled={isSoldOut}
          onClick={handleAdd}
          className={styles.addBtn}
        >
          {isAdding ? 'Adding…' : isSoldOut ? 'Sold out' : 'Add to bag'}
        </AppButton>
      </div>

      <button
        type="button"
        onClick={handleWishlist}
        aria-pressed={isWishlistedActive}
        className={[styles.wishlist, isWishlistedActive ? styles.wishlistActive : null]
          .filter(Boolean)
          .join(' ')}
      >
        {isWishlistedActive ? (
          <FavoriteIcon fontSize="small" />
        ) : (
          <FavoriteBorderIcon fontSize="small" />
        )}
        <span>{isWishlistedActive ? 'Saved to wishlist' : 'Save to wishlist'}</span>
      </button>

      <ul className={styles.trust}>
        <li>
          <LocationOnRoundedIcon className={styles.trustIcon} aria-hidden="true" />
          <span>Crafted in Dubai</span>
        </li>
        <li>
          <HandymanRoundedIcon className={styles.trustIcon} aria-hidden="true" />
          <span>Hand‑finished</span>
        </li>
        <li>
          <LocalShippingRoundedIcon className={styles.trustIcon} aria-hidden="true" />
          <span>Free local delivery on AED 500+</span>
        </li>
      </ul>
    </aside>
  );
}

export default Buybox;
