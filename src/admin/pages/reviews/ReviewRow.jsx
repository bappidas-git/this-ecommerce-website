import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import Rating from '../../../components/common/Rating/Rating.jsx';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { PATHS } from '../../../routes/paths.js';
import { formatDate, truncate } from '../../../utils/format.js';

import styles from './ReviewRow.module.css';

const STATUS_TONE = {
  pending: 'warning',
  published: 'success',
  rejected: 'error',
};

const STATUS_LABEL = {
  pending: 'Pending',
  published: 'Published',
  rejected: 'Rejected',
};

function ReviewRow({
  review,
  selected = false,
  onSelectChange,
  onOpen,
  selectable = true,
}) {
  const tone = STATUS_TONE[review.status] || 'muted';
  const label = STATUS_LABEL[review.status] || review.status;

  const handleRowClick = (event) => {
    if (event.target.closest('[data-stop-row]')) return;
    onOpen?.(review);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen?.(review);
    }
  };

  return (
    <div
      className={[styles.row, selected ? styles.selected : ''].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open review by ${review.reviewer?.name || 'customer'}`}
    >
      {selectable ? (
        <div className={styles.selectCell} data-stop-row>
          <AppCheckbox
            checked={selected}
            onChange={(e) => onSelectChange?.(review.id, e.target.checked)}
            aria-label={`Select review ${review.id}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}

      <div className={styles.body}>
        <div className={styles.topLine}>
          <Rating value={Number(review.rating) || 0} size="sm" precision={1} />
          <StatusPill status={review.status} label={label} className={styles[`pill_${tone}`]} />
        </div>

        <h3 className={styles.title}>{review.title}</h3>

        <p className={styles.snippet}>{truncate(review.body, 240)}</p>

        <div className={styles.metaLine}>
          {review.productSlug ? (
            <Link
              component={RouterLink}
              to={PATHS.product(review.productSlug)}
              className={styles.product}
              underline="hover"
              data-stop-row
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={review.productImage}
                alt=""
                className={styles.thumb}
                width={36}
                height={36}
                loading="lazy"
              />
              <span className={styles.productName}>{review.productName}</span>
            </Link>
          ) : (
            <span className={styles.product}>
              <img
                src={review.productImage}
                alt=""
                className={styles.thumb}
                width={36}
                height={36}
                loading="lazy"
              />
              <span className={styles.productName}>{review.productName || 'Unknown product'}</span>
            </span>
          )}

          <span className={styles.dot} aria-hidden="true">·</span>

          <span className={styles.reviewer}>
            <span>{review.reviewer?.name || 'Customer'}</span>
            {review.verifiedPurchase ? (
              <Tooltip title="Verified purchase" placement="top" arrow>
                <span className={styles.verified} aria-label="Verified purchase">
                  <VerifiedRoundedIcon fontSize="inherit" />
                </span>
              </Tooltip>
            ) : null}
          </span>

          <span className={styles.dot} aria-hidden="true">·</span>

          <time className={styles.date} dateTime={review.createdAt}>
            {formatDate(review.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
}

export default ReviewRow;
