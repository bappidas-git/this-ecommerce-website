import Section from '../../../../components/common/Section.jsx';
import Container from '../../../../components/common/Container.jsx';
import SectionHeader from '../../../../components/common/SectionHeader.jsx';
import SkeletonCard from '../../../../components/common/SkeletonCard/SkeletonCard.jsx';
import ErrorState from '../../../../components/common/ErrorState/ErrorState.jsx';
import useCategories from '../../../../hooks/useCategories.js';
import CategoryTile from './CategoryTile.jsx';
import styles from './CategoryMosaic.module.css';

const TILE_SPANS = [
  { col: 7, row: 2 },
  { col: 5, row: 1 },
  { col: 3, row: 1 },
  { col: 2, row: 1 },
];

const FEATURED_LIMIT = 4;

function CategoryMosaic() {
  const { items, isLoading, error } = useCategories({ featured: true, limit: FEATURED_LIMIT });

  const tiles = (items || []).slice(0, FEATURED_LIMIT);

  return (
    <Section tone="cream">
      <Container gutter>
        <SectionHeader
          eyebrow="The collection"
          title="Curated edits for considered homes"
          align="center"
        />

        {error ? (
          <div className={styles.stateWrap}>
            <ErrorState
              title="We couldn't load categories"
              description="Please try again in a moment."
            />
          </div>
        ) : null}

        {!error && isLoading && tiles.length === 0 ? (
          <ul className={styles.grid} aria-busy="true" aria-label="Loading categories">
            {Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
              <li
                key={`mosaic-skeleton-${i}`}
                className={styles.skeletonItem}
                style={{
                  '--tile-col': `span ${TILE_SPANS[i].col}`,
                  '--tile-row': `span ${TILE_SPANS[i].row}`,
                }}
              >
                <SkeletonCard />
              </li>
            ))}
          </ul>
        ) : null}

        {!error && tiles.length > 0 ? (
          <ul className={styles.grid}>
            {tiles.map((category, index) => (
              <CategoryTile
                key={category.id ?? category.slug ?? index}
                category={category}
                index={index}
                span={TILE_SPANS[index]}
              />
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}

export default CategoryMosaic;
