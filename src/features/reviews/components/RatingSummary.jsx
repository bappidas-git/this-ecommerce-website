import StarRoundedIcon from '@mui/icons-material/StarRounded';
import Rating from '../../../components/common/Rating/Rating.jsx';
import styles from './RatingSummary.module.css';

function RatingSummary({ rating = 0, total = 0, distribution }) {
  const safeTotal = Number(total) || 0;
  const safeRating = Number(rating) || 0;

  return (
    <div className={styles.root} aria-label="Rating summary">
      <div className={styles.headline}>
        <span className={styles.score} aria-hidden="true">
          {safeTotal > 0 ? safeRating.toFixed(1) : '—'}
        </span>
        <span className={styles.outOf}>out of 5</span>
        <Rating value={safeRating} size="md" precision={0.1} className={styles.stars} />
        <p className={styles.caption}>
          {safeTotal > 0
            ? `Based on ${safeTotal} ${safeTotal === 1 ? 'review' : 'reviews'}`
            : 'No reviews yet'}
        </p>
      </div>

      <ul className={styles.bars} aria-label="Rating distribution">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution?.[star] ?? 0;
          const pct = safeTotal > 0 ? Math.round((count / safeTotal) * 100) : 0;
          return (
            <li key={star} className={styles.row}>
              <span className={styles.starLabel}>
                <StarRoundedIcon className={styles.starIcon} aria-hidden="true" />
                <span className={styles.starNumber}>{star}</span>
              </span>
              <span
                className={styles.track}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${star} stars`}
              >
                <span className={styles.fill} style={{ width: `${pct}%` }} />
              </span>
              <span className={styles.pct}>{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RatingSummary;
