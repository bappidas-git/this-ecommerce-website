import { motion, useReducedMotion } from 'framer-motion';

import Container from '../../../../components/common/Container.jsx';
import Breadcrumbs from '../../../../components/common/Breadcrumbs/Breadcrumbs.jsx';
import Eyebrow from '../../../../components/common/Eyebrow.jsx';
import { PATHS } from '../../../../routes/paths.js';
import { handleImageError } from '../../../../utils/imageFallback.js';
import styles from './ShopHeader.module.css';

// Neutral textured panel — never echoes the category name in giant text.
const NEUTRAL_HERO_IMAGE =
  'https://placehold.co/1200x720/E5DED2/8C8678?text=THIS+Interiors&font=playfair';

function ShopHeader({ category, title, kicker, bannerImage }) {
  const isCategory = Boolean(category);

  const crumbs = [
    { label: 'Home', to: PATHS.home },
    { label: 'Shop', to: isCategory ? PATHS.shop : undefined },
    ...(isCategory ? [{ label: category.name }] : []),
  ];

  const heading = title || (isCategory ? category.name : 'Shop the collection');
  const subline =
    kicker ||
    (isCategory
      ? category.description ||
        `A considered selection of ${category.name.toLowerCase()} for quiet, lived‑in rooms.`
      : 'All small decor for considered homes.');

  // Always use the neutral panel for the hero image — the heading on the
  // left already says the category name; the image must not duplicate it.
  const banner = bannerImage || NEUTRAL_HERO_IMAGE;

  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <header className={styles.root} aria-labelledby="shop-page-title">
      <Container gutter>
        <Breadcrumbs items={crumbs} className={styles.crumbs} />

        {isCategory && banner ? (
          <motion.div className={styles.heroBand} {...motionProps}>
            <div className={styles.heroBandContent}>
              <Eyebrow color="brass" className={styles.eyebrow}>
                The collection
              </Eyebrow>
              <h1 id="shop-page-title" className={styles.title}>
                {heading}
              </h1>
              <p className={styles.kicker}>{subline}</p>
            </div>
            <div className={styles.heroBandImageWrap}>
              <img
                src={banner}
                alt=""
                aria-hidden="true"
                className={styles.heroBandImage}
                decoding="async"
                onError={(e) => handleImageError(e, 'THIS Interiors')}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div className={styles.titleBlock} {...motionProps}>
            <Eyebrow color="brass" className={styles.eyebrow}>
              The collection
            </Eyebrow>
            <h1 id="shop-page-title" className={styles.title}>
              {heading}
            </h1>
            <p className={styles.kicker}>{subline}</p>
          </motion.div>
        )}
      </Container>
    </header>
  );
}

export default ShopHeader;
