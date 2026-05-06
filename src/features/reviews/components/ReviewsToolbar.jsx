import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Chip from '../../../components/common/Chip/Chip.jsx';
import styles from './ReviewsToolbar.module.css';

const SORT_OPTIONS = [
  { value: 'most_helpful', label: 'Most helpful' },
  { value: 'newest', label: 'Newest' },
  { value: 'highest_rated', label: 'Highest rated' },
  { value: 'lowest_rated', label: 'Lowest rated' },
];

function ReviewsToolbar({
  ratings = [],
  onRatingsChange,
  verifiedOnly = false,
  onVerifiedOnlyChange,
  sort = 'most_helpful',
  onSortChange,
}) {
  const toggleStar = (star) => {
    const has = ratings.includes(star);
    const next = has ? ratings.filter((r) => r !== star) : [...ratings, star];
    onRatingsChange(next);
  };

  return (
    <div className={styles.root}>
      <div className={styles.filters}>
        <span className={styles.label}>Filter by</span>
        <ul className={styles.chips}>
          {[5, 4, 3, 2, 1].map((star) => {
            const selected = ratings.includes(star);
            return (
              <li key={star}>
                <Chip
                  variant={selected ? 'solid' : 'outline'}
                  selected={selected}
                  size="small"
                  onClick={() => toggleStar(star)}
                  label={
                    <span className={styles.chipLabel}>
                      <StarRoundedIcon className={styles.chipStar} aria-hidden="true" />
                      <span>{star}</span>
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
        <label className={styles.verifiedToggle}>
          <input
            type="checkbox"
            checked={Boolean(verifiedOnly)}
            onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
          />
          <span>Verified buyers only</span>
        </label>
      </div>

      <div className={styles.sortGroup}>
        <span className={styles.label} id="reviews-sort-label">
          Sort by
        </span>
        <Select
          aria-labelledby="reviews-sort-label"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          size="small"
          className={styles.sortSelect}
        >
          {SORT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default ReviewsToolbar;
