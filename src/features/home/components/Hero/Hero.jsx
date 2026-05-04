import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import Eyebrow from '../../../../components/common/Eyebrow.jsx';
import Container from '../../../../components/common/Container.jsx';
import { PATHS } from '../../../../routes/paths.js';
import useSettings from '../../../../hooks/useSettings.js';
import styles from './Hero.module.css';

// Editorial gradient + soft noise — no overlaid text so the headline reads cleanly.
const HERO_FALLBACK_SVG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="g" cx="32%" cy="38%" r="80%">
      <stop offset="0%" stop-color="#2A584A"/>
      <stop offset="55%" stop-color="#1F4034"/>
      <stop offset="100%" stop-color="#102820"/>
    </radialGradient>
    <linearGradient id="ray" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#C9A973" stop-opacity="0"/>
      <stop offset="100%" stop-color="#C9A973" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <ellipse cx="1180" cy="180" rx="520" ry="180" fill="url(#ray)"/>
  <ellipse cx="240" cy="780" rx="600" ry="200" fill="#0E2018" opacity="0.55"/>
  <circle cx="1320" cy="640" r="180" fill="#C9A973" fill-opacity="0.05"/>
  <circle cx="1320" cy="640" r="110" fill="#C9A973" fill-opacity="0.05"/>
</svg>`);

const DEFAULTS = Object.freeze({
  heroImage: HERO_FALLBACK_SVG,
  heroEyebrow: 'A Studio in Dubai',
  heroTitle: 'Pieces that quiet a room.',
  heroKicker:
    'Considered objects, hand‑finished and assembled in Dubai. Pieces meant to be lived with — not styled for a season.',
  primaryCtaLabel: 'Shop the collection',
  primaryCtaHref: PATHS.shop,
  secondaryCtaLabel: 'Read our story',
  secondaryCtaHref: PATHS.about,
});

const TRUST_BADGES = [
  { eyebrow: 'Studio', label: 'Crafted in Dubai' },
  { eyebrow: 'Delivery', label: 'Free local delivery on AED 500+' },
  { eyebrow: 'Made by hand', label: 'Hand‑finished' },
];

function Hero() {
  const { data: settings } = useSettings();
  const homepage = settings?.homepage ?? {};
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y = prefersReducedMotion ? 0 : parallaxY;

  const heroImage = homepage.heroImage || DEFAULTS.heroImage;
  const eyebrow = homepage.heroEyebrow || DEFAULTS.heroEyebrow;
  const title = homepage.heroTitle || DEFAULTS.heroTitle;
  const kicker = homepage.heroKicker || DEFAULTS.heroKicker;

  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = heroImage;
    img.onload = () => setImgLoaded(true);
    if (img.complete) setImgLoaded(true);
  }, [heroImage]);

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      aria-labelledby="home-hero-title"
    >
      <motion.div
        className={styles.imageLayer}
        style={{ y, backgroundImage: `url(${heroImage})` }}
        aria-hidden
        data-loaded={imgLoaded ? 'true' : 'false'}
      />
      <div className={styles.overlay} aria-hidden />

      <Container gutter className={styles.container}>
        <div className={styles.content}>
          <Eyebrow color="brass" className={styles.eyebrow}>
            {eyebrow}
          </Eyebrow>
          <h1 id="home-hero-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.kicker}>{kicker}</p>

          <div className={styles.ctaRow}>
            <RouterLink to={DEFAULTS.primaryCtaHref} className={styles.ctaPrimary}>
              {DEFAULTS.primaryCtaLabel}
            </RouterLink>
            <RouterLink to={DEFAULTS.secondaryCtaHref} className={styles.ctaGhost}>
              <span>{DEFAULTS.secondaryCtaLabel}</span>
              <span aria-hidden className={styles.ctaArrow}>
                →
              </span>
            </RouterLink>
          </div>
        </div>

        <ul className={styles.trustStrip} aria-label="Studio promises">
          {TRUST_BADGES.map((badge) => (
            <li key={badge.label} className={styles.trustItem}>
              <Eyebrow color="brass" className={styles.trustEyebrow}>
                {badge.eyebrow}
              </Eyebrow>
              <span className={styles.trustLabel}>{badge.label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export default Hero;
