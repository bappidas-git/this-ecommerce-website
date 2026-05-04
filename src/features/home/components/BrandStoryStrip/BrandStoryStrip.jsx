import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import Section from '../../../../components/common/Section.jsx';
import Container from '../../../../components/common/Container.jsx';
import Eyebrow from '../../../../components/common/Eyebrow.jsx';
import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import { PATHS } from '../../../../routes/paths.js';

import styles from './BrandStoryStrip.module.css';

// Cream-on-brass so the panels stay readable against the emerald section bg.
const STORY_IMAGES = [
  'https://res.cloudinary.com/dn9gyaiik/image/upload/v1777872857/atlier_kjtbcg.png',
  'https://res.cloudinary.com/dn9gyaiik/image/upload/v1777872967/hand-made_xyrl56.png',
];

const ROTATE_INTERVAL = 6000;

function BrandStoryStrip() {
  const prefersReducedMotion = useReducedMotion();
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    if (STORY_IMAGES.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % STORY_IMAGES.length);
    }, ROTATE_INTERVAL);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <Section tone="emerald" aria-labelledby="brand-story-title">
      <Container gutter>
        <div className={styles.grid}>
          <div className={styles.imageColumn}>
            <div className={styles.imageFrame} aria-hidden="true">
              <AnimatePresence initial={false} mode="sync">
                <motion.img
                  key={STORY_IMAGES[imageIndex]}
                  src={STORY_IMAGES[imageIndex]}
                  alt=""
                  className={styles.image}
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.2, 0.6, 0.2, 1] }}
                />
              </AnimatePresence>
            </div>
          </div>

          <div className={styles.textColumn}>
            <Eyebrow color="brass" className={styles.eyebrow}>
              Atelier
            </Eyebrow>
            <h2 id="brand-story-title" className={styles.title}>
              Slow making, in a Dubai studio.
            </h2>
            <p className={styles.kicker}>
              Each piece is finished by hand in our atelier — drawn from quiet rituals, honest
              materials, and the rooms we keep returning to. We make a little less, so each object
              can mean a little more.
            </p>
            <div className={styles.cta}>
              <AppButton variant="primary" to={PATHS.about} className={styles.ctaButton}>
                Read the story
              </AppButton>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default BrandStoryStrip;
