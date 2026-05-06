import { useCallback, useEffect, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppSwitch from '../../../components/common/AppSwitch/AppSwitch.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { adminReviewService } from '../../../api/services/admin/adminReviewService.js';

import useReviewsUrlState, {
  SORT_PRESETS,
  RATING_OPTIONS,
  parseRatings,
  presetValue,
} from '../../features/reviews/useReviewsUrlState.js';
import useAdminReviews from '../../features/reviews/useAdminReviews.js';

import ReviewRow from './ReviewRow.jsx';
import ReviewDetailDrawer from './ReviewDetailDrawer.jsx';

import styles from './ReviewsModerationPage.module.css';

const SEARCH_DEBOUNCE_MS = 250;
const UNDO_TIMEOUT_MS = 8000;

const TAB_DEFS = [
  { value: 'pending', label: 'Pending' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
];

const ACTION_TO_STATUS = {
  publish: 'published',
  reject: 'rejected',
  unpublish: 'pending',
  restore: 'pending',
};

const ACTION_TOAST = {
  publish: 'Review approved',
  reject: 'Review rejected',
  unpublish: 'Review unpublished',
  restore: 'Review restored to pending',
};

function buildServiceParams(state) {
  const params = {
    status: state.status,
    page: state.page,
    perPage: state.per_page,
    sortBy: state.sort_by,
    sortDir: state.sort_dir,
  };
  if (state.q) params.q = state.q;
  if (state.ratings) params.ratings = parseRatings(state.ratings);
  if (state.verified_only === 'true' || state.verified_only === true) {
    params.verifiedOnly = true;
  }
  if (state.date_from) params.dateFrom = state.date_from;
  if (state.date_to) params.dateTo = state.date_to;
  return params;
}

function ReviewsModerationPage() {
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('reviews');

  useAdminBreadcrumbs([{ label: 'People' }, { label: 'Reviews' }]);

  const { state, update, reset } = useReviewsUrlState();
  const params = useMemo(() => buildServiceParams(state), [state]);
  const {
    items,
    meta,
    error,
    isLoading,
    refetch,
    patchLocal,
    removeLocal,
  } = useAdminReviews(params);

  const counts = meta?.counts || {};

  const [localQ, setLocalQ] = useState(state.q || '');
  useEffect(() => {
    setLocalQ(state.q || '');
  }, [state.q]);
  useEffect(() => {
    if (localQ === (state.q || '')) return undefined;
    const id = setTimeout(
      () => update({ q: localQ }, { resetPage: true }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const ratings = useMemo(() => parseRatings(state.ratings), [state.ratings]);

  const toggleRating = (n) => {
    const set = new Set(ratings);
    if (set.has(n)) set.delete(n);
    else set.add(n);
    const next = [...set].sort((a, b) => b - a);
    update({ ratings: next.join(',') }, { resetPage: true });
  };

  const onSortPreset = (event) => {
    const preset = SORT_PRESETS.find((p) => p.value === event.target.value);
    if (!preset) return;
    update(
      { sort_by: preset.sort_by, sort_dir: preset.sort_dir },
      { resetPage: true },
    );
  };

  const handleTabChange = (_event, value) => {
    setSelected(new Set());
    update({ status: value }, { resetPage: true });
  };

  // Selection
  const [selected, setSelected] = useState(new Set());
  useEffect(() => {
    setSelected(new Set());
  }, [state.status]);

  const onSelectChange = useCallback((id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(Number(id));
      else next.delete(Number(id));
      return next;
    });
  }, []);

  const allSelected =
    items.length > 0 && items.every((r) => selected.has(Number(r.id)));
  const someSelected = !allSelected && items.some((r) => selected.has(Number(r.id)));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((r) => Number(r.id))));
    }
  };

  // Drawer
  const [drawer, setDrawer] = useState({ open: false, review: null });
  const [drawerPending, setDrawerPending] = useState(false);

  const openDrawer = useCallback((review) => {
    setDrawer({ open: true, review });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer((d) => ({ ...d, open: false }));
  }, []);

  const handleAction = async (action, review) => {
    if (!review) return;
    const nextStatus = ACTION_TO_STATUS[action];
    if (!nextStatus) return;
    const prevStatus = review.status;
    setDrawerPending(true);
    // Optimistic update
    if (state.status === prevStatus && nextStatus !== prevStatus) {
      removeLocal([review.id]);
    } else {
      patchLocal(review.id, { status: nextStatus });
    }
    setDrawer((d) =>
      d.review && d.review.id === review.id
        ? { ...d, review: { ...d.review, status: nextStatus } }
        : d,
    );
    try {
      await adminReviewService.update(review.id, { status: nextStatus });
      toast.success(ACTION_TOAST[action] || 'Review updated');
      refetch();
      if (action !== 'publish' && action !== 'reject') {
        // keep drawer open for unpublish/restore so user sees state
      } else {
        closeDrawer();
      }
    } catch (err) {
      // Revert
      patchLocal(review.id, { status: prevStatus });
      setDrawer((d) =>
        d.review && d.review.id === review.id
          ? { ...d, review: { ...d.review, status: prevStatus } }
          : d,
      );
      toast.error(err?.response?.data?.message || 'Could not update review');
      refetch();
    } finally {
      setDrawerPending(false);
    }
  };

  const runBulk = async (status) => {
    const ids = [...selected];
    if (!ids.length) return;
    // Optimistic remove from current tab list
    removeLocal(ids);
    setSelected(new Set());
    let undone = false;
    let undoTimer = null;

    const undo = async () => {
      if (undone) return;
      undone = true;
      if (undoTimer) clearTimeout(undoTimer);
      try {
        await adminReviewService.bulkUpdate({ ids, status: 'pending' });
        toast.info('Bulk action undone');
        refetch();
      } catch (err) {
        toast.error('Could not undo bulk action');
        refetch();
      }
    };

    try {
      await adminReviewService.bulkUpdate({ ids, status });
      const label =
        status === 'published'
          ? `${ids.length} review${ids.length === 1 ? '' : 's'} approved`
          : `${ids.length} review${ids.length === 1 ? '' : 's'} rejected`;
      toast.success(label, {
        autoHideDuration: UNDO_TIMEOUT_MS,
        action: (key) => (
          <AppButton
            variant="ghost"
            size="small"
            onClick={async () => {
              await undo();
              toast.dismiss(key);
            }}
          >
            Undo
          </AppButton>
        ),
      });
      undoTimer = setTimeout(() => {
        undone = true;
      }, UNDO_TIMEOUT_MS);
      refetch();
    } catch (err) {
      // Revert by re-fetching authoritative data from server
      refetch();
      toast.error(err?.response?.data?.message || 'Bulk action failed');
    }
  };

  const totalForTab = (tab) => {
    if (counts && Object.prototype.hasOwnProperty.call(counts, tab)) {
      return counts[tab];
    }
    return tab === state.status ? meta?.total || 0 : 0;
  };

  const hasActiveFilters = Boolean(
    state.q || state.ratings || state.verified_only || state.date_from || state.date_to,
  );

  return (
    <>
      <Seo title="Reviews | Admin" noindex />
      <AdminPageHeader
        eyebrow="People"
        title="Reviews"
        description="Moderate customer reviews."
      />

      <Tabs
        value={state.status}
        onChange={handleTabChange}
        className={styles.tabs}
        TabIndicatorProps={{ className: styles.tabIndicator }}
        variant="scrollable"
        scrollButtons={false}
      >
        {TAB_DEFS.map((t) => (
          <Tab
            key={t.value}
            value={t.value}
            disableRipple
            className={styles.tab}
            label={
              <span className={styles.tabLabel}>
                {t.label}
                <Chip
                  size="small"
                  className={styles.tabChip}
                  label={totalForTab(t.value)}
                />
              </span>
            }
          />
        ))}
      </Tabs>

      <div className={styles.toolbar} role="search" aria-label="Filter reviews">
        <div className={styles.searchCell}>
          <AppTextField
            aria-label="Search reviews"
            placeholder="Search title, body, or product…"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: localQ ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear search"
                    size="small"
                    edge="end"
                    onClick={() => {
                      setLocalQ('');
                      update({ q: '' }, { resetPage: true });
                    }}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </div>

        <div className={styles.ratingCell} role="group" aria-label="Filter by rating">
          {RATING_OPTIONS.map((n) => {
            const selectedRating = ratings.includes(n);
            return (
              <button
                type="button"
                key={n}
                onClick={() => toggleRating(n)}
                className={[
                  styles.ratingChip,
                  selectedRating ? styles.ratingChipOn : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={selectedRating}
              >
                {n}
                <StarRateRoundedIcon fontSize="inherit" />
              </button>
            );
          })}
        </div>

        <div className={styles.toggleCell}>
          <AppSwitch
            label="Verified only"
            checked={state.verified_only === 'true' || state.verified_only === true}
            onChange={(e) =>
              update(
                { verified_only: e.target.checked ? 'true' : '' },
                { resetPage: true },
              )
            }
          />
        </div>

        <div className={styles.dateCell}>
          <AppTextField
            type="date"
            size="small"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={state.date_from || ''}
            onChange={(e) =>
              update({ date_from: e.target.value }, { resetPage: true })
            }
          />
          <AppTextField
            type="date"
            size="small"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={state.date_to || ''}
            onChange={(e) =>
              update({ date_to: e.target.value }, { resetPage: true })
            }
          />
        </div>

        <div className={styles.sortCell}>
          <AppSelect
            label="Sort by"
            size="small"
            value={presetValue(state)}
            onChange={onSortPreset}
            options={SORT_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
          />
        </div>

        {hasActiveFilters ? (
          <button type="button" className={styles.resetBtn} onClick={reset}>
            Clear filters
          </button>
        ) : null}
      </div>

      {canWrite && items.length > 0 ? (
        <div className={styles.selectAllRow}>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={toggleSelectAll}
              aria-label="Select all reviews on this page"
            />
            <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
          </label>
        </div>
      ) : null}

      <div className={styles.listWrap}>
        {isLoading ? (
          <div className={styles.progress}>
            <LinearProgress />
          </div>
        ) : null}

        {error && !isLoading ? (
          <ErrorState
            title="Could not load reviews"
            description={error?.message || 'Please try again.'}
            onRetry={refetch}
          />
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <EmptyState
            icon={<RateReviewOutlinedIcon fontSize="large" />}
            title={
              state.status === 'pending'
                ? 'No reviews to moderate'
                : state.status === 'published'
                  ? 'No published reviews'
                  : 'No rejected reviews'
            }
            description={
              hasActiveFilters
                ? 'Try clearing filters to see more results.'
                : 'New reviews will appear here as customers submit them.'
            }
          />
        ) : null}

        {!error && items.length > 0 ? (
          <ul className={styles.list}>
            {items.map((review) => (
              <li key={review.id} className={styles.listItem}>
                <ReviewRow
                  review={review}
                  selectable={canWrite}
                  selected={selected.has(Number(review.id))}
                  onSelectChange={onSelectChange}
                  onOpen={openDrawer}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {canWrite && selected.size > 0 ? (
        <div className={styles.bulkBar} role="region" aria-label="Bulk actions">
          <span className={styles.bulkCount}>
            {selected.size} selected
          </span>
          <div className={styles.bulkActions}>
            <AppButton
              variant="primary"
              size="small"
              icon={<CheckRoundedIcon fontSize="small" />}
              onClick={() => runBulk('published')}
            >
              Approve all
            </AppButton>
            <AppButton
              variant="ghost"
              size="small"
              icon={<BlockRoundedIcon fontSize="small" />}
              className={styles.rejectBulk}
              onClick={() => runBulk('rejected')}
            >
              Reject all
            </AppButton>
            <AppButton
              variant="ghost"
              size="small"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </AppButton>
          </div>
        </div>
      ) : null}

      <ReviewDetailDrawer
        open={drawer.open}
        review={drawer.review}
        canModerate={canWrite}
        onClose={closeDrawer}
        onAction={handleAction}
        isPending={drawerPending}
      />
    </>
  );
}

export default ReviewsModerationPage;
