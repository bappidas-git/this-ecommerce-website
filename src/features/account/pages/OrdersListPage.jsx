import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

import useAccountSection from '../hooks/useAccountSection.js';
import useOrders from '../hooks/useOrders.js';
import OrderRow from '../components/OrderRow.jsx';

import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Chip from '../../../components/common/Chip/Chip.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { PATHS } from '../../../routes/paths.js';
import styles from './OrdersListPage.module.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PER_PAGE_DEFAULT = 10;
const SEARCH_DEBOUNCE_MS = 300;

function readStatus(value) {
  if (!value) return 'all';
  return STATUS_FILTERS.some((f) => f.value === value) ? value : 'all';
}

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow} aria-hidden>
      <div className={styles.skeletonHead}>
        <span className={`${styles.skeletonBar} ${styles.skBarSm}`} />
        <span className={`${styles.skeletonBar} ${styles.skBarPill}`} />
      </div>
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonThumbs}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={styles.skeletonThumb} />
          ))}
        </div>
        <span className={`${styles.skeletonBar} ${styles.skBarMd}`} />
      </div>
    </div>
  );
}

function OrdersListPage() {
  useAccountSection({ descriptor: 'Browse and manage your past purchases.' });

  const [searchParams, setSearchParams] = useSearchParams();

  const status = readStatus(searchParams.get('status'));
  const q = searchParams.get('q') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const page = readNumber(searchParams.get('page'), 1);
  const perPage = readNumber(searchParams.get('per_page'), PER_PAGE_DEFAULT);

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Debounced search → URL
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === q) return undefined;
    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set('q', trimmed);
          else next.delete('q');
          next.delete('page');
          return next;
        },
        { replace: true },
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, q, setSearchParams]);

  const updateParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value == null || value === '' || value === 'all') next.delete(key);
          else next.set(key, String(value));
          if (key !== 'page') next.delete('page');
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  const queryParams = useMemo(() => {
    const params = { page, perPage };
    if (status && status !== 'all') params.status = status;
    if (q) params.q = q;
    if (from) params.from = from;
    if (to) params.to = to;
    return params;
  }, [status, q, from, to, page, perPage]);

  const { items: orders, meta, isLoading, error } = useOrders(queryParams);
  const totalPages = useMemo(() => {
    const total = Number(meta?.total) || 0;
    const size = Number(meta?.perPage) || perPage;
    return Math.max(1, Math.ceil(total / size));
  }, [meta, perPage]);

  const showEmpty =
    !isLoading &&
    !error &&
    orders.length === 0 &&
    !q &&
    !from &&
    !to &&
    status === 'all';

  const showFilteredEmpty =
    !isLoading && !error && orders.length === 0 && !showEmpty;

  return (
    <>
      <Seo title="My orders | THIS Interiors" noindex />

      <section className={styles.controls} aria-label="Filter orders">
        <div className={styles.chipRow} role="tablist" aria-label="Order status">
          {STATUS_FILTERS.map((filter) => {
            const selected = status === filter.value;
            return (
              <Chip
                key={filter.value}
                role="tab"
                aria-selected={selected}
                label={filter.label}
                variant="solid"
                selected={selected}
                onClick={() => updateParam('status', filter.value)}
                className={styles.chip}
                size="small"
              />
            );
          })}
        </div>

        <div className={styles.filtersRow}>
          <AppTextField
            label="Search"
            placeholder="Search by order #..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className={styles.search}
            InputProps={{
              startAdornment: (
                <SearchRoundedIcon
                  fontSize="small"
                  className={styles.searchIcon}
                  aria-hidden
                />
              ),
            }}
          />
          <AppTextField
            label="From"
            type="date"
            value={from}
            onChange={(event) => updateParam('from', event.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.dateInput}
            inputProps={{ max: to || undefined }}
          />
          <AppTextField
            label="To"
            type="date"
            value={to}
            onChange={(event) => updateParam('to', event.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.dateInput}
            inputProps={{ min: from || undefined }}
          />
        </div>
      </section>

      {error ? (
        <div className={styles.errorWrap} role="alert">
          <p className={styles.errorMessage}>
            We couldn&apos;t load your orders. Please try again.
          </p>
        </div>
      ) : isLoading ? (
        <div className={styles.list} aria-busy="true">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}
        </div>
      ) : showEmpty ? (
        <EmptyState
          icon={<ShoppingBagOutlinedIcon fontSize="large" />}
          title="No orders yet."
          description="Your purchases will live here once you place an order."
          cta={
            <AppButton variant="primary" to={PATHS.shop}>
              Begin browsing
            </AppButton>
          }
        />
      ) : showFilteredEmpty ? (
        <EmptyState
          icon={<ShoppingBagOutlinedIcon fontSize="large" />}
          title="No orders match these filters."
          description="Try clearing the search or date range."
        />
      ) : (
        <>
          <div className={styles.list}>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav className={styles.paginationWrap} aria-label="Orders pagination">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => updateParam('page', value)}
                shape="rounded"
                siblingCount={1}
              />
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}

export default OrdersListPage;
