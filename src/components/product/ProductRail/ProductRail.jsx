import { useCallback, useEffect, useRef, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import Container from '../../common/Container.jsx';
import Section from '../../common/Section.jsx';
import SectionHeader from '../../common/SectionHeader.jsx';
import AppButton from '../../common/AppButton/AppButton.jsx';
import AppIconButton from '../../common/AppIconButton/AppIconButton.jsx';
import EmptyState from '../../common/EmptyState/EmptyState.jsx';
import ProductCard from '../ProductCard/ProductCard.jsx';

import styles from './ProductRail.module.css';

const SKELETON_COUNT = 6;

function ProductRail({
  title,
  eyebrow,
  kicker,
  viewAllTo,
  items = [],
  loading = false,
  emptyHint = 'New pieces are on the way.',
  tone = 'cream',
  id,
  ariaLabel,
}) {
  const scrollerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateBoundaries = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(maxScroll <= 0 || el.scrollLeft >= maxScroll - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    updateBoundaries();
    el.addEventListener('scroll', updateBoundaries, { passive: true });
    window.addEventListener('resize', updateBoundaries);
    return () => {
      el.removeEventListener('scroll', updateBoundaries);
      window.removeEventListener('resize', updateBoundaries);
    };
  }, [updateBoundaries, items.length, loading]);

  const scrollByCard = useCallback((direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstItem = el.querySelector(`.${styles.item}`);
    const cardWidth = firstItem ? firstItem.getBoundingClientRect().width : el.clientWidth * 0.9;
    const gap = 24;
    el.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' });
  }, []);

  const showRail = loading || items.length > 0;
  const showCta = Boolean(viewAllTo);
  const cta = showCta ? (
    <AppButton variant="ghost" to={viewAllTo} size="small">
      View all
    </AppButton>
  ) : null;

  return (
    <Section tone={tone} aria-label={ariaLabel || title} id={id}>
      <Container gutter>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          kicker={kicker}
          tone={tone}
          cta={cta}
        />

        {showRail ? (
          <div className={styles.railWrap}>
            <ul
              ref={scrollerRef}
              className={styles.scroller}
              aria-busy={loading || undefined}
              role="list"
            >
              {loading
                ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <li key={`rail-skeleton-${i}`} className={styles.item} aria-hidden="true">
                      <ProductCard.Skeleton />
                    </li>
                  ))
                : items.map((product) => (
                    <li key={product.id ?? product.slug} className={styles.item}>
                      <ProductCard product={product} />
                    </li>
                  ))}
            </ul>

            {!loading && items.length > 0 ? (
              <>
                <div
                  className={[
                    styles.arrowSlot,
                    styles.arrowSlotLeft,
                    atStart ? styles.arrowHidden : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden={atStart}
                >
                  <AppIconButton
                    aria-label="Scroll rail left"
                    onClick={() => scrollByCard(-1)}
                    className={styles.arrowButton}
                    tabIndex={atStart ? -1 : 0}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </AppIconButton>
                </div>
                <div
                  className={[
                    styles.arrowSlot,
                    styles.arrowSlotRight,
                    atEnd ? styles.arrowHidden : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden={atEnd}
                >
                  <AppIconButton
                    aria-label="Scroll rail right"
                    onClick={() => scrollByCard(1)}
                    className={styles.arrowButton}
                    tabIndex={atEnd ? -1 : 0}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </AppIconButton>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className={styles.emptyWrap}>
            <EmptyState
              title="No pieces to show yet"
              description={emptyHint}
            />
          </div>
        )}
      </Container>
    </Section>
  );
}

export default ProductRail;
