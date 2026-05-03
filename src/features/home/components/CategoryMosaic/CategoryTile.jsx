import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

import Eyebrow from '../../../../components/common/Eyebrow.jsx';
import { PATHS } from '../../../../routes/paths.js';
import styles from './CategoryTile.module.css';

const FALLBACK_IMAGE =
  'https://placehold.co/900x1100/E5DED2/1B1A17?text=THIS+Interiors&font=playfair';

function CategoryTile({ category, index = 0, span }) {
  const slug = category?.slug ?? '';
  const name = category?.name ?? 'Category';
  const image = category?.image || FALLBACK_IMAGE;

  const styleVars = span
    ? {
        '--tile-col': `span ${span.col}`,
        '--tile-row': `span ${span.row}`,
      }
    : undefined;

  return (
    <motion.li
      className={styles.tile}
      style={styleVars}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.5,
        ease: [0.2, 0.6, 0.2, 1],
        delay: index * 0.06,
      }}
    >
      <RouterLink
        to={PATHS.category(slug)}
        className={styles.link}
        aria-label={`Discover ${name}`}
      >
        <span
          className={styles.image}
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden
        />
        <span className={styles.overlay} aria-hidden />
        <span className={styles.content}>
          <Eyebrow color="brass" className={styles.eyebrow}>
            Category
          </Eyebrow>
          <span className={styles.title}>{name}</span>
          <span className={styles.cta}>
            Discover
            <span aria-hidden className={styles.arrow}>
              →
            </span>
          </span>
        </span>
      </RouterLink>
    </motion.li>
  );
}

export default CategoryTile;
