import { useState } from 'react';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';

import Rating from '../../../components/common/Rating/Rating.jsx';
import { reviewService } from '../../../api/services/index.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';

import styles from './ReviewItem.module.css';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatLocation(location) {
  if (!location) return '';
  const parts = [location.city, location.country].filter(Boolean);
  return parts.join(', ');
}

function ReviewItem({ review, onUpdate }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [optimistic, setOptimistic] = useState({
    helpfulCount: Number(review.helpfulCount) || 0,
    isHelpful: Boolean(review.isHelpful),
  });
  const [isPending, setIsPending] = useState(false);

  const reviewer = review.reviewer || {};
  const isPendingReview = review.status === 'pending';
  const initials = reviewer.initials || '?';
  const avatar =
    reviewer.avatar ||
    `https://placehold.co/80x80/B8924F/F7F3ED?text=${encodeURIComponent(initials)}&font=playfair`;

  const handleHelpful = async () => {
    if (!isAuthenticated) {
      toast.info('Sign in to mark a review as helpful.');
      return;
    }
    if (review.isOptimistic) return;
    const prev = optimistic;
    const next = {
      isHelpful: !prev.isHelpful,
      helpfulCount: Math.max(0, prev.helpfulCount + (prev.isHelpful ? -1 : 1)),
    };
    setOptimistic(next);
    setIsPending(true);
    try {
      const updated = await reviewService.toggleHelpful(review.id);
      setOptimistic({
        helpfulCount: Number(updated?.helpfulCount) || next.helpfulCount,
        isHelpful: next.isHelpful,
      });
      onUpdate?.({ ...review, ...updated, isHelpful: next.isHelpful });
    } catch (err) {
      setOptimistic(prev);
      toast.error(err?.message || 'Could not update. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <li className={styles.root}>
      <div className={styles.head}>
        <img
          src={avatar}
          alt=""
          width={40}
          height={40}
          className={styles.avatar}
          loading="lazy"
        />
        <div className={styles.meta}>
          <p className={styles.name}>{reviewer.name || 'Customer'}</p>
          {reviewer.location ? (
            <p className={styles.location}>{formatLocation(reviewer.location)}</p>
          ) : null}
        </div>
        <div className={styles.rightMeta}>
          <Rating value={Number(review.rating) || 0} size="sm" precision={1} />
          <p className={styles.date}>{formatDate(review.createdAt)}</p>
        </div>
      </div>

      <div className={styles.badgeRow}>
        {review.verifiedPurchase ? (
          <span className={styles.verified}>
            <VerifiedRoundedIcon className={styles.verifiedIcon} aria-hidden="true" />
            Verified buyer
          </span>
        ) : null}
        {isPendingReview ? (
          <span className={styles.pending}>
            <HourglassTopRoundedIcon className={styles.pendingIcon} aria-hidden="true" />
            Awaiting review
          </span>
        ) : null}
      </div>

      {review.title ? <h3 className={styles.title}>{review.title}</h3> : null}
      {review.body ? <p className={styles.body}>{review.body}</p> : null}

      {!isPendingReview ? (
        <button
          type="button"
          onClick={handleHelpful}
          disabled={isPending || review.isOptimistic}
          aria-pressed={optimistic.isHelpful}
          className={[styles.helpful, optimistic.isHelpful ? styles.helpfulOn : '']
            .filter(Boolean)
            .join(' ')}
        >
          {optimistic.isHelpful ? (
            <ThumbUpAltIcon fontSize="small" />
          ) : (
            <ThumbUpAltOutlinedIcon fontSize="small" />
          )}
          <span>Helpful?</span>
          <span className={styles.helpfulCount}>{optimistic.helpfulCount}</span>
        </button>
      ) : null}
    </li>
  );
}

export default ReviewItem;
