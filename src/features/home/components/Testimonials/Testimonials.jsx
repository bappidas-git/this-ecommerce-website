import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import Section from '../../../../components/common/Section.jsx';
import Container from '../../../../components/common/Container.jsx';
import SectionHeader from '../../../../components/common/SectionHeader.jsx';
import useCarousel from '../../../../hooks/useCarousel.js';

import styles from './Testimonials.module.css';

const TESTIMONIALS = [
  {
    id: 'reem',
    quote:
      'Every piece looks even more beautiful in our home than online. The vase has become the heart of our living room.',
    name: 'Reem A.',
    location: 'Jumeirah, Dubai',
    avatar: 'https://placehold.co/120x120/B8924F/F7F3ED?text=RA&font=playfair',
  },
  {
    id: 'jad',
    quote:
      'It feels like the studio knew exactly what our apartment needed. Quiet, considered, and beautifully made.',
    name: 'Jad K.',
    location: 'City Walk, Dubai',
    avatar: 'https://placehold.co/120x120/B8924F/F7F3ED?text=JK&font=playfair',
  },
  {
    id: 'noor',
    quote:
      'The lamp arrived in this gorgeous linen wrap — gift-worthy before it was even unwrapped. Such warmth in the details.',
    name: 'Noor F.',
    location: 'Al Barsha, Dubai',
    avatar: 'https://placehold.co/120x120/B8924F/F7F3ED?text=NF&font=playfair',
  },
];

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD = 60;

function Testimonials() {
  const prefersReducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const { index, set, next, prev } = useCarousel({
    length: TESTIMONIALS.length,
    autoplay: prefersReducedMotion ? 0 : AUTOPLAY_MS,
    paused,
  });

  const touchStartX = useRef(null);

  const handleTouchStart = (event) => {
    setPaused(true);
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches?.[0]?.clientX ?? null;
    touchStartX.current = null;
    if (startX != null && endX != null) {
      const dx = endX - startX;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx < 0) next();
        else prev();
      }
    }
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
  };

  const slide = TESTIMONIALS[index];

  return (
    <Section tone="cream" aria-labelledby="testimonials-title">
      <Container gutter>
        <SectionHeader
          eyebrow="From the home"
          title="Heard from our customers"
          align="center"
          id="testimonials-title"
        />

        <div
          className={styles.carousel}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
        >
          <span className={styles.openingMark} aria-hidden="true">
            &ldquo;
          </span>

          <div className={styles.viewport}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={slide.id}
                className={styles.slide}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: [0.2, 0.6, 0.2, 1] }}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${TESTIMONIALS.length}`}
              >
                <blockquote className={styles.quote}>{slide.quote}</blockquote>
                <figcaption className={styles.attribution}>
                  <img
                    src={slide.avatar}
                    alt=""
                    className={styles.avatar}
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <span className={styles.identity}>
                    <span className={styles.name}>{slide.name}</span>
                    <span className={styles.location}>{slide.location}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div
            className={styles.dots}
            role="tablist"
            aria-label="Select testimonial"
          >
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show testimonial ${i + 1}`}
                tabIndex={i === index ? 0 : -1}
                className={[styles.dot, i === index ? styles.dotActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => set(i)}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default Testimonials;
