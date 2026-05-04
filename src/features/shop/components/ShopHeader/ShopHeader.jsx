import Container from '../../../../components/common/Container.jsx';
import Breadcrumbs from '../../../../components/common/Breadcrumbs/Breadcrumbs.jsx';
import Eyebrow from '../../../../components/common/Eyebrow.jsx';
import { PATHS } from '../../../../routes/paths.js';
import { handleImageError } from '../../../../utils/imageFallback.js';
import styles from './ShopHeader.module.css';

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

  const encodedName = isCategory ? encodeURIComponent(category.name) : '';
  const categoryHero =
    isCategory && category?.image
      ? category.image
      : isCategory
        ? `https://placehold.co/1600x1000/1F4034/F7F3ED?text=${encodedName}&font=playfair`
        : null;
  const banner = bannerImage || categoryHero;

  return (
    <header className={styles.root} aria-labelledby="shop-page-title">
      <Container gutter>
        <Breadcrumbs items={crumbs} className={styles.crumbs} />

        {isCategory && banner ? (
          <div className={styles.heroBand}>
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
                alt={`${category.name} — editorial`}
                className={styles.heroBandImage}
                onError={(e) => handleImageError(e, category.name)}
              />
            </div>
          </div>
        ) : (
          <div className={styles.titleBlock}>
            <Eyebrow color="brass" className={styles.eyebrow}>
              The collection
            </Eyebrow>
            <h1 id="shop-page-title" className={styles.title}>
              {heading}
            </h1>
            <p className={styles.kicker}>{subline}</p>
          </div>
        )}
      </Container>
    </header>
  );
}

export default ShopHeader;
