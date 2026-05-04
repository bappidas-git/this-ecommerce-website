import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import Eyebrow from '../../../../components/common/Eyebrow.jsx';
import Container from '../../../../components/common/Container.jsx';
import { PATHS } from '../../../../routes/paths.js';
import useSettings from '../../../../hooks/useSettings.js';
import styles from './Hero.module.css';

const HERO_IMAGE =
  'https://res.cloudinary.com/dn9gyaiik/image/upload/v1777871734/Hero-Image_feu2v1.png';

const DEFAULTS = Object.freeze({
  heroImage: HERO_IMAGE,
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
