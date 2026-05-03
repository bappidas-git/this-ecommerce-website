import { useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import useCategories from '../../../hooks/useCategories.js';
import categoriesData from '../../../data/categories.js';
import {
  FILTER_DEFAULTS,
  parseFilters,
  serializeFilters,
  toServiceParams,
} from './serializeFilters.js';

/**
 * useShopState — single source of truth for shop filter UI.
 *
 * - Reads canonical state from URLSearchParams (so back/forward Just Works™).
 * - Writes back through useSearchParams; every default value is pruned.
 * - When the route exposes a /:slug param, the corresponding category is
 *   resolved via useCategories() and locked: the URL no longer carries
 *   category_id (the slug owns it) and the sidebar Category group is read-only.
 * - Exposes a memoized `serialized` object meant for useProducts → axios.
 */
export function useShopState() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: categoriesFromApi, isLoading: categoriesLoading } = useCategories();

  const categories = categoriesFromApi.length ? categoriesFromApi : categoriesData;

  const lockedCategory = useMemo(() => {
    if (!slug) return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [slug, categories]);

  const isCategoryLocked = Boolean(slug);
  const isCategoryResolving = isCategoryLocked && !lockedCategory && categoriesLoading;

  const parsed = useMemo(() => parseFilters(searchParams), [searchParams]);

  const state = useMemo(() => {
    if (!isCategoryLocked) return parsed;
    return {
      ...parsed,
      // Locked category overrides whatever may be in the URL.
      categoryId: lockedCategory ? String(lockedCategory.id) : null,
    };
  }, [parsed, isCategoryLocked, lockedCategory]);

  const writeParams = useCallback(
    (next, { replace = false } = {}) => {
      const cleaned = { ...next };
      // When the route locks the category, never persist category_id in the URL —
      // /shop/:slug already encodes it.
      if (isCategoryLocked) delete cleaned.categoryId;
      setSearchParams(serializeFilters(cleaned), { replace });
    },
    [setSearchParams, isCategoryLocked],
  );

  const setFilters = useCallback(
    (partial) => {
      // Any filter change resets pagination back to the first page.
      writeParams({ ...state, ...partial, page: 1 });
    },
    [state, writeParams],
  );

  const setSort = useCallback(
    (sort) => {
      writeParams({ ...state, sort, page: 1 });
    },
    [state, writeParams],
  );

  const setPage = useCallback(
    (page) => {
      const next = Math.max(1, Number(page) || 1);
      writeParams({ ...state, page: next });
    },
    [state, writeParams],
  );

  const clearAll = useCallback(() => {
    writeParams({ ...FILTER_DEFAULTS });
  }, [writeParams]);

  const serialized = useMemo(() => toServiceParams(state), [state]);

  return {
    state,
    setFilters,
    setSort,
    setPage,
    clearAll,
    serialized,
    lockedCategory,
    isCategoryLocked,
    isCategoryResolving,
    categories,
  };
}

export default useShopState;
