import { useEffect, useState } from 'react';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';

import AppSelect from '../../../../components/common/AppSelect/AppSelect.jsx';
import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import { SORT_OPTIONS } from '../../constants.js';
import styles from './ToolbarBar.module.css';

function buildCountLabel({ total, page, pageSize, isLoading }) {
  if (isLoading) return 'Loading the collection…';
  if (!total) return 'Showing 0 results';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  return `Showing ${start}–${end} of ${total}`;
}

function ToolbarBar({
  total = 0,
  page = 1,
  pageSize = 12,
  isLoading = false,
  sort = 'featured',
  view = 'grid',
  onOpenFilters,
  onOpenSort,
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const countLabel = buildCountLabel({ total, page, pageSize, isLoading });

  return (
    <div
      className={[styles.root, scrolled ? styles.scrolled : null].filter(Boolean).join(' ')}
      role="region"
      aria-label="Sort and view options"
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.count} aria-live="polite">
            {countLabel}
          </span>
        </div>

        <div className={styles.right}>
          <div className={styles.mobileTriggers}>
            <AppButton
              variant="secondary"
              size="small"
              icon={<TuneRoundedIcon fontSize="small" />}
              onClick={onOpenFilters}
            >
              Filters
            </AppButton>
            <AppButton
              variant="secondary"
              size="small"
              icon={<SwapVertRoundedIcon fontSize="small" />}
              onClick={onOpenSort}
            >
              Sort
            </AppButton>
          </div>

          <div className={styles.desktopOnly}>
            <AppSelect
              label="Sort by"
              size="small"
              value={sort}
              onChange={() => {}}
              options={SORT_OPTIONS}
              className={styles.sortSelect}
            />
            <div className={styles.viewToggle} role="group" aria-label="View mode">
              <button
                type="button"
                className={styles.viewBtn}
                aria-pressed={view === 'grid'}
                aria-label="Grid view"
                onClick={() => {}}
              >
                <GridViewRoundedIcon fontSize="small" />
              </button>
              <button
                type="button"
                className={styles.viewBtn}
                aria-pressed={view === 'list'}
                aria-label="List view"
                onClick={() => {}}
              >
                <ViewListRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToolbarBar;
