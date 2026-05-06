import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import AppDrawer from '../../../components/common/AppDrawer/AppDrawer.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Rating from '../../../components/common/Rating/Rating.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { PATHS } from '../../../routes/paths.js';
import { formatDate, formatNumber } from '../../../utils/format.js';

import styles from './ReviewDetailDrawer.module.css';

const STATUS_LABEL = {
  pending: 'Pending',
  published: 'Published',
  rejected: 'Rejected',
};

function ReviewDetailDrawer({
  open,
  review,
  canModerate = false,
  onClose,
  onAction,
  isPending = false,
}) {
  if (!review) {
    return (
      <AppDrawer open={open} onClose={onClose} title="Review" hideHeader={false}>
        <div className={styles.empty}>No review selected.</div>
      </AppDrawer>
    );
  }

  const status = review.status;

  const actions = [];
  if (canModerate) {
    if (status === 'pending') {
      actions.push(
        <AppButton
          key="approve"
          variant="primary"
          size="small"
          icon={<CheckRoundedIcon fontSize="small" />}
          loading={isPending}
          onClick={() => onAction?.('publish', review)}
        >
          Approve
        </AppButton>,
        <AppButton
          key="reject"
          variant="ghost"
          size="small"
          icon={<CloseRoundedIcon fontSize="small" />}
          className={styles.rejectBtn}
          loading={isPending}
          onClick={() => onAction?.('reject', review)}
        >
          Reject
        </AppButton>,
      );
    } else if (status === 'published') {
      actions.push(
        <AppButton
          key="unpublish"
          variant="secondary"
          size="small"
          icon={<VisibilityOffRoundedIcon fontSize="small" />}
          loading={isPending}
          onClick={() => onAction?.('unpublish', review)}
        >
          Unpublish
        </AppButton>,
      );
    } else if (status === 'rejected') {
      actions.push(
        <AppButton
          key="restore"
          variant="secondary"
          size="small"
          icon={<ReplayRoundedIcon fontSize="small" />}
          loading={isPending}
          onClick={() => onAction?.('restore', review)}
        >
          Restore
        </AppButton>,
      );
    }
  }

  const footer =
    actions.length > 0 ? (
      <div className={styles.footer}>{actions}</div>
    ) : null;

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      anchor="right"
      title="Review"
      width={{ xs: '100vw', sm: 480 }}
      footer={footer}
    >
      <div className={styles.content}>
        <header className={styles.head}>
          {review.productSlug ? (
            <Link
              component={RouterLink}
              to={PATHS.product(review.productSlug)}
              className={styles.productLink}
              underline="hover"
            >
              <img
                src={review.productImage}
                alt=""
                className={styles.thumb}
                width={56}
                height={56}
                loading="lazy"
              />
              <span className={styles.productName}>
                {review.productName || 'Product'}
              </span>
            </Link>
          ) : (
            <div className={styles.productLink}>
              <img
                src={review.productImage}
                alt=""
                className={styles.thumb}
                width={56}
                height={56}
                loading="lazy"
              />
              <span className={styles.productName}>
                {review.productName || 'Unknown product'}
              </span>
            </div>
          )}

          <div className={styles.headRow}>
            <Rating value={Number(review.rating) || 0} size="md" precision={1} />
            <StatusPill status={status} label={STATUS_LABEL[status] || status} />
          </div>

          <div className={styles.reviewerRow}>
            <img
              src={review.reviewer?.avatar}
              alt=""
              className={styles.avatar}
              width={32}
              height={32}
              loading="lazy"
            />
            <span className={styles.reviewerName}>
              {review.reviewer?.name || 'Customer'}
            </span>
            {review.verifiedPurchase ? (
              <span className={styles.verified} aria-label="Verified purchase">
                <VerifiedRoundedIcon fontSize="inherit" />
                Verified
              </span>
            ) : null}
            <time className={styles.date} dateTime={review.createdAt}>
              {formatDate(review.createdAt)}
            </time>
          </div>
        </header>

        <section className={styles.section}>
          <h3 className={styles.title}>{review.title}</h3>
          <p className={styles.body}>{review.body}</p>
        </section>

        <section className={styles.metaSection}>
          <dl className={styles.metaList}>
            <div className={styles.metaItem}>
              <dt>Helpful</dt>
              <dd className={styles.mono}>
                {formatNumber(review.helpfulCount || 0)}
              </dd>
            </div>
            {review.orderId ? (
              <div className={styles.metaItem}>
                <dt>Order</dt>
                <dd className={styles.mono}>
                  {review.orderNumber || `#${review.orderId}`}
                </dd>
              </div>
            ) : null}
            <div className={styles.metaItem}>
              <dt>Review ID</dt>
              <dd className={styles.mono}>#{review.id}</dd>
            </div>
            {review.reviewer?.email ? (
              <div className={styles.metaItem}>
                <dt>Email</dt>
                <dd className={styles.email}>{review.reviewer.email}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>
    </AppDrawer>
  );
}

export default ReviewDetailDrawer;
