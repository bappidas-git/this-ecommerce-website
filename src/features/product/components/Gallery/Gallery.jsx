import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import AppBadge from '../../../../components/common/AppBadge/AppBadge.jsx';
import AppDialog from '../../../../components/common/AppDialog/AppDialog.jsx';
import AppIconButton from '../../../../components/common/AppIconButton/AppIconButton.jsx';
import { getProductPlaceholder, handleImageError } from '../../../../utils/imageFallback.js';

import styles from './Gallery.module.css';

function clampIndex(i, length) {
  if (length <= 0) return 0;
  if (i < 0) return length - 1;
  if (i >= length) return 0;
  return i;
}

function buildBadges(product) {
  const items = [];
  if (product?.isNew) items.push({ key: 'new', variant: 'new' });
  if (product?.isOnSale) items.push({ key: 'sale', variant: 'sale' });
  if (product?.isLimited) items.push({ key: 'limited', variant: 'limited' });
  return items;
}

function Gallery({ product }) {
  const fallback = useMemo(
    () => getProductPlaceholder(product?.name || 'THIS Interiors', 1200, 1500),
    [product?.name],
  );
  const images = useMemo(() => {
    const list = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
    return list.length > 0 ? list : [fallback];
  }, [product, fallback]);

  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Tracks indices whose remote URL failed; we swap to local fallback for those.
  const [brokenIdx, setBrokenIdx] = useState(() => new Set());
  const stageRef = useRef(null);

  useEffect(() => {
    setActive(0);
    setBrokenIdx(new Set());
  }, [product?.id]);

  const markBroken = useCallback((idx) => {
    setBrokenIdx((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  const total = images.length;
  const next = useCallback(() => setActive((i) => clampIndex(i + 1, total)), [total]);
  const prev = useCallback(() => setActive((i) => clampIndex(i - 1, total)), [total]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      } else if (event.key === 'Enter' || event.key === ' ') {
        if (event.target?.dataset?.role === 'main-image') {
          event.preventDefault();
          setLightboxOpen(true);
        }
      }
    },
    [next, prev],
  );

  const handleMouseMove = (event) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const badges = buildBadges(product);
  const altBase = product?.name || 'Product image';
  const rawSrc = images[active];
  const mainSrc = brokenIdx.has(active) ? fallback : rawSrc;

  return (
    <section
      className={styles.root}
      aria-label={`${altBase} gallery`}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={styles.thumbColumn} role="tablist" aria-label="Product image thumbnails">
        {images.map((src, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={`${src}-${idx}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Show image ${idx + 1} of ${total}`}
              className={[styles.thumb, isActive ? styles.thumbActive : null]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActive(idx)}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                onError={(e) => handleImageError(e, altBase)}
              />
            </button>
          );
        })}
      </div>

      <div
        ref={stageRef}
        className={styles.stage}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {badges.length > 0 ? (
          <div className={styles.badges}>
            {badges.map((b) => (
              <AppBadge key={b.key} variant={b.variant} />
            ))}
          </div>
        ) : null}

        <button
          type="button"
          data-role="main-image"
          className={styles.mainBtn}
          aria-label={`Open full-size view of ${altBase}`}
          onClick={() => setLightboxOpen(true)}
          style={{
            backgroundImage: `url(${mainSrc})`,
            backgroundSize: isZooming ? '180%' : 'cover',
            backgroundPosition: isZooming ? `${zoomPos.x}% ${zoomPos.y}%` : 'center',
          }}
        >
          <img
            src={mainSrc}
            alt={`${altBase} — view ${active + 1}`}
            className={styles.mainImg}
            onError={(e) => {
              markBroken(active);
              handleImageError(e, altBase);
            }}
          />
        </button>

        {total > 1 ? (
          <>
            <div className={[styles.navBtn, styles.navPrev].join(' ')}>
              <AppIconButton aria-label="Previous image" onClick={prev}>
                <ChevronLeftIcon />
              </AppIconButton>
            </div>
            <div className={[styles.navBtn, styles.navNext].join(' ')}>
              <AppIconButton aria-label="Next image" onClick={next}>
                <ChevronRightIcon />
              </AppIconButton>
            </div>
          </>
        ) : null}
      </div>

      <div className={styles.thumbStrip} role="tablist" aria-label="Product image thumbnails">
        {images.map((src, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={`m-${src}-${idx}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Show image ${idx + 1} of ${total}`}
              className={[styles.thumb, isActive ? styles.thumbActive : null]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActive(idx)}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                onError={(e) => handleImageError(e, altBase)}
              />
            </button>
          );
        })}
      </div>

      <AppDialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        size="lg"
        className={styles.lightbox}
        ariaLabelledBy="pdp-lightbox-title"
      >
        <div className={styles.lightboxBody}>
          <h2 id="pdp-lightbox-title" className={styles.lightboxTitle}>
            {altBase}
          </h2>
          <img
            src={mainSrc}
            alt={`${altBase} — view ${active + 1}`}
            className={styles.lightboxImg}
            onError={(e) => handleImageError(e, altBase)}
          />

          {total > 1 ? (
            <>
              <IconButton
                aria-label="Previous image"
                className={[styles.lightboxNav, styles.lightboxPrev].join(' ')}
                onClick={prev}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                aria-label="Next image"
                className={[styles.lightboxNav, styles.lightboxNext].join(' ')}
                onClick={next}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          ) : null}

          <IconButton
            aria-label="Close gallery"
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
          >
            <CloseIcon />
          </IconButton>

          <p className={styles.lightboxCounter} aria-live="polite">
            {active + 1} / {total}
          </p>
        </div>
      </AppDialog>
    </section>
  );
}

export default Gallery;
