import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { reviewService } from '../../../api/services/index.js';

const PER_PAGE = 10;

export default function useReviews({ productId, ratings, verifiedOnly, sort }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const ratingsKey = ratings.join(',');

  useEffect(() => {
    setItems([]);
    setPage(1);
    setTotal(0);
  }, [productId, ratingsKey, verifiedOnly, sort]);

  useEffect(() => {
    if (!productId) return undefined;
    const controller = new AbortController();
    const isFirstPage = page === 1;
    if (isFirstPage) setIsLoading(true);
    else setIsLoadingMore(true);
    setIsError(false);

    reviewService
      .listForProduct(
        productId,
        {
          ratings: ratings.length ? ratings : undefined,
          verifiedOnly: verifiedOnly || undefined,
          reviewSort: sort,
          page,
          perPage: PER_PAGE,
        },
        { signal: controller.signal },
      )
      .then(({ items: next, meta }) => {
        setItems((prev) => (isFirstPage ? next : [...prev, ...next]));
        setTotal(Number(meta?.total) || 0);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingMore(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, ratingsKey, verifiedOnly, sort, page]);

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const prependItem = useCallback((item) => {
    setItems((prev) => [item, ...prev]);
    setTotal((t) => t + 1);
  }, []);

  const replaceItem = useCallback((id, replacement) => {
    setItems((prev) => prev.map((it) => (it.id === id ? replacement : it)));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  const hasMore = items.length < total;

  return {
    items,
    total,
    page,
    isLoading,
    isLoadingMore,
    isError,
    hasMore,
    loadMore,
    prependItem,
    replaceItem,
    removeItem,
  };
}
