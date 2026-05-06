import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import Loader from '../../../components/common/Loader/Loader.jsx';

import ReviewItem from './ReviewItem.jsx';
import styles from './ReviewsList.module.css';

function ReviewsList({
  items,
  isLoading,
  isLoadingMore,
  isError,
  hasMore,
  onLoadMore,
  onItemUpdate,
  onWriteFirst,
  onRetry,
}) {
  if (isLoading) {
    return (
      <div className={styles.loadingWrap} role="status" aria-label="Loading reviews">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn’t load reviews"
        description="Please try again in a moment."
        onRetry={onRetry}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No reviews yet — be the first."
        description="Share your thoughts with our community of collectors."
        cta={
          onWriteFirst ? (
            <AppButton variant="primary" onClick={onWriteFirst}>
              Write a review
            </AppButton>
          ) : null
        }
      />
    );
  }

  return (
    <>
      <ul className={styles.list}>
        {items.map((review) => (
          <ReviewItem key={review.id} review={review} onUpdate={onItemUpdate} />
        ))}
      </ul>
      {hasMore ? (
        <div className={styles.loadMoreWrap}>
          <AppButton
            variant="secondary"
            onClick={onLoadMore}
            loading={isLoadingMore}
            disabled={isLoadingMore}
          >
            Load more reviews
          </AppButton>
        </div>
      ) : null}
    </>
  );
}

export default ReviewsList;
