import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Container from '../../../components/common/Container.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import Section from '../../../components/common/Section.jsx';

import RatingSummary from './RatingSummary.jsx';
import ReviewsList from './ReviewsList.jsx';
import ReviewsToolbar from './ReviewsToolbar.jsx';
import WriteReviewDialog from './WriteReviewDialog.jsx';

import useReviews from '../hooks/useReviews.js';
import { reviewService } from '../../../api/services/index.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { PATHS } from '../../../routes/paths.js';

import styles from './ReviewsSection.module.css';

const RATING_KEY = 'reviews_ratings';
const VERIFIED_KEY = 'reviews_verified';
const SORT_KEY = 'reviews_sort';
const VALID_SORTS = new Set(['most_helpful', 'newest', 'highest_rated', 'lowest_rated']);

function parseRatings(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => Number(s))
    .filter((n) => n >= 1 && n <= 5);
}

function ReviewsSection({ product }) {
  const productId = product?.id;
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);

  const ratings = useMemo(
    () => parseRatings(searchParams.get(RATING_KEY)),
    [searchParams],
  );
  const verifiedOnly = searchParams.get(VERIFIED_KEY) === '1';
  const rawSort = searchParams.get(SORT_KEY);
  const sort = VALID_SORTS.has(rawSort) ? rawSort : 'most_helpful';

  const updateParams = useCallback(
    (changes) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([k, v]) => {
            if (v === null || v === undefined || v === '' || v === false) {
              next.delete(k);
            } else {
              next.set(k, String(v));
            }
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleRatingsChange = (next) => {
    updateParams({ [RATING_KEY]: next.length ? next.join(',') : null });
  };
  const handleVerifiedOnly = (val) => {
    updateParams({ [VERIFIED_KEY]: val ? '1' : null });
  };
  const handleSortChange = (val) => {
    updateParams({ [SORT_KEY]: val === 'most_helpful' ? null : val });
  };

  const reviews = useReviews({ productId, ratings, verifiedOnly, sort });

  const productRating = Number(product?.rating) || 0;
  const productReviewCount = Number(product?.reviewCount) || 0;
  const distribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!productReviewCount) return dist;
    // Approximate distribution from the headline rating so the bars render
    // even when the API hasn't returned a per-bucket breakdown. The summary
    // numbers come from the canonical product record.
    const r = productRating;
    const weights = {
      5: Math.max(0, 0.55 + (r - 4) * 0.18),
      4: Math.max(0, 0.27 + (r - 4) * 0.05),
      3: Math.max(0, 0.12 - (r - 4) * 0.06),
      2: Math.max(0, 0.05 - (r - 4) * 0.04),
      1: Math.max(0, 0.03 - (r - 4) * 0.04),
    };
    const sum = Object.values(weights).reduce((s, w) => s + w, 0) || 1;
    for (const key of [5, 4, 3, 2, 1]) {
      dist[key] = Math.round((weights[key] / sum) * productReviewCount);
    }
    return dist;
  }, [productRating, productReviewCount]);

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  const handleSubmitReview = useCallback(
    async (values) => {
      if (!productId) return;
      const tempId = `pending-${Date.now()}`;
      const optimistic = {
        id: tempId,
        productId,
        rating: values.rating,
        title: values.title,
        body: values.body,
        status: 'pending',
        verifiedPurchase: true,
        helpfulCount: 0,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        reviewer: {
          name: 'You',
          initials: 'YO',
          avatar: 'https://placehold.co/80x80/B8924F/F7F3ED?text=YO&font=playfair',
          location: { city: '', country: '' },
        },
      };
      reviews.prependItem(optimistic);
      try {
        const created = await reviewService.create({
          productId,
          rating: values.rating,
          title: values.title,
          body: values.body,
        });
        reviews.replaceItem(tempId, { ...created, isOptimistic: false });
        toast.success('Thank you. Your review will appear once reviewed by our team.');
      } catch (err) {
        reviews.removeItem(tempId);
        toast.error(err?.message || 'Could not post your review.');
        throw err;
      }
    },
    [productId, reviews, toast],
  );

  return (
    <Section id="reviews" tone="surface" className={styles.section}>
      <Container gutter>
        <div className={styles.head}>
          <div className={styles.heading}>
            <Eyebrow color="brass">Reviews</Eyebrow>
            <h2 className={styles.title}>What collectors are saying</h2>
          </div>
          <div className={styles.cta}>
            {isAuthenticated ? (
              <AppButton
                variant="primary"
                onClick={openDialog}
                className={`${styles.writeBtn} write-cta`}
              >
                Write a review
              </AppButton>
            ) : (
              <Link to={PATHS.auth.login} className={styles.signInLink}>
                Sign in to review
              </Link>
            )}
          </div>
        </div>

        <div className={styles.summary}>
          <RatingSummary
            rating={productRating}
            total={productReviewCount}
            distribution={distribution}
          />
        </div>

        <ReviewsToolbar
          ratings={ratings}
          onRatingsChange={handleRatingsChange}
          verifiedOnly={verifiedOnly}
          onVerifiedOnlyChange={handleVerifiedOnly}
          sort={sort}
          onSortChange={handleSortChange}
        />

        <div className={styles.list}>
          <ReviewsList
            items={reviews.items}
            isLoading={reviews.isLoading}
            isLoadingMore={reviews.isLoadingMore}
            isError={reviews.isError}
            hasMore={reviews.hasMore}
            onLoadMore={reviews.loadMore}
            onItemUpdate={(updated) => reviews.replaceItem(updated.id, updated)}
            onWriteFirst={isAuthenticated ? openDialog : null}
            onRetry={() => window.location.reload()}
          />
        </div>
      </Container>

      <WriteReviewDialog
        open={dialogOpen}
        onClose={closeDialog}
        productId={productId}
        productName={product?.name}
        onSubmit={handleSubmitReview}
      />
    </Section>
  );
}

export default ReviewsSection;
