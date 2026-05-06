import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

import Chip from '../../../../components/common/Chip/Chip.jsx';
import { PATHS } from '../../../../routes/paths.js';
import { useUI } from '../../../../context/UIContext.jsx';
import { formatCurrency } from '../../../../utils/format.js';
import {
  getProductPlaceholder,
  handleImageError,
} from '../../../../utils/imageFallback.js';

import useRecentSearches from '../../state/useRecentSearches.js';
import useSearchSuggestions from '../../hooks/useSearchSuggestions.js';
import useOnSaleRail from '../../hooks/useOnSaleRail.js';
import { TRENDING_QUERIES } from '../../constants.js';

import styles from './SearchOverlay.module.css';

function buildHighlightedItems(products, categories) {
  const productItems = products.map((p) => ({
    type: 'product',
    id: `p-${p.id ?? p.slug}`,
    payload: p,
  }));
  const categoryItems = categories.map((c) => ({
    type: 'category',
    id: `c-${c.id ?? c.slug}`,
    payload: c,
  }));
  return [...productItems, ...categoryItems];
}

function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useUI();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(-1);
  const inputRef = useRef(null);

  const { items: recent, add: addRecent, clear: clearRecent } =
    useRecentSearches();
  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;

  const { products, categories, isLoading } = useSearchSuggestions(query);
  const { items: saleItems } = useOnSaleRail({ enabled: isSearchOpen && !hasQuery });

  const navItems = useMemo(
    () => buildHighlightedItems(products, categories),
    [products, categories],
  );

  // Reset state on open / close.
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setHighlight(-1);
      // Focus input shortly after the modal mounts.
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isSearchOpen]);

  // Keep highlight within bounds when results change.
  useEffect(() => {
    if (highlight >= navItems.length) setHighlight(navItems.length - 1);
  }, [navItems.length, highlight]);

  const submitQuery = useCallback(
    (q) => {
      const cleaned = String(q || '').trim();
      if (!cleaned) return;
      addRecent(cleaned);
      navigate(`${PATHS.search}?q=${encodeURIComponent(cleaned)}`);
      closeSearch();
    },
    [addRecent, navigate, closeSearch],
  );

  const goToItem = useCallback(
    (item) => {
      if (!item) return;
      if (item.type === 'product') {
        const slug = item.payload?.slug;
        if (slug) {
          navigate(PATHS.product(slug));
          closeSearch();
        }
        return;
      }
      if (item.type === 'category') {
        const slug = item.payload?.slug;
        if (slug) {
          navigate(PATHS.category(slug));
          closeSearch();
        }
      }
    },
    [navigate, closeSearch],
  );

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (event.key === 'ArrowDown') {
      if (!navItems.length) return;
      event.preventDefault();
      setHighlight((h) => (h + 1) % navItems.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      if (!navItems.length) return;
      event.preventDefault();
      setHighlight((h) => (h <= 0 ? navItems.length - 1 : h - 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlight >= 0 && navItems[highlight]) {
        goToItem(navItems[highlight]);
        return;
      }
      submitQuery(query);
    }
  };

  const motionProps = reduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: -16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -16 },
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <Modal
      open={Boolean(isSearchOpen)}
      onClose={closeSearch}
      aria-labelledby="search-overlay-title"
      slotProps={{
        backdrop: { className: styles.backdrop },
      }}
      className={styles.modalRoot}
      keepMounted={false}
    >
      <AnimatePresence>
        {isSearchOpen ? (
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            onKeyDown={handleKeyDown}
            {...motionProps}
          >
            <h2 id="search-overlay-title" className={styles.srOnly}>
              Search THIS Interiors
            </h2>

            <div className={styles.inputRow}>
              <SearchIcon className={styles.inputIcon} aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(-1);
                }}
                placeholder="Search products, materials, rooms…"
                aria-label="Search query"
                className={styles.input}
                autoComplete="off"
                spellCheck="false"
                enterKeyHint="search"
              />
              {isLoading ? (
                <CircularProgress
                  size={18}
                  className={styles.spinner}
                  aria-hidden="true"
                />
              ) : null}
              <IconButton
                aria-label="Close search"
                onClick={closeSearch}
                size="medium"
                className={styles.close}
              >
                <CloseIcon />
              </IconButton>
            </div>

            <div className={styles.body}>
              {hasQuery ? (
                <ResultsList
                  products={products}
                  categories={categories}
                  navItems={navItems}
                  highlight={highlight}
                  onHover={setHighlight}
                  onSelectItem={goToItem}
                  onSubmitQuery={() => submitQuery(query)}
                  isLoading={isLoading}
                  query={trimmed}
                />
              ) : (
                <EmptyState
                  recent={recent}
                  onClearRecent={clearRecent}
                  onSubmitQuery={submitQuery}
                  saleItems={saleItems}
                  onSelectItem={goToItem}
                />
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Modal>
  );
}

function ResultsList({
  products,
  categories,
  navItems,
  highlight,
  onHover,
  onSelectItem,
  onSubmitQuery,
  isLoading,
  query,
}) {
  if (!products.length && !categories.length && !isLoading) {
    return (
      <div className={styles.emptyResults}>
        <p className={styles.emptyTitle}>
          No matches for &ldquo;{query}&rdquo;
        </p>
        <p className={styles.emptyHint}>
          Press <kbd>Enter</kbd> to search the full catalogue.
        </p>
        <button
          type="button"
          className={styles.fullSearchBtn}
          onClick={onSubmitQuery}
        >
          Search the catalogue
        </button>
      </div>
    );
  }

  return (
    <div className={styles.results} role="listbox" aria-label="Search suggestions">
      {products.length ? (
        <section className={styles.group}>
          <h3 className={styles.groupTitle}>Suggestions</h3>
          <ul className={styles.list}>
            {products.map((p) => {
              const navIndex = navItems.findIndex(
                (i) => i.type === 'product' && i.payload === p,
              );
              const isActive = navIndex === highlight;
              return (
                <li key={p.id ?? p.slug}>
                  <ProductRow
                    product={p}
                    active={isActive}
                    onMouseEnter={() => onHover(navIndex)}
                    onClick={() =>
                      onSelectItem({ type: 'product', payload: p })
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {categories.length ? (
        <section className={styles.group}>
          <h3 className={styles.groupTitle}>Categories</h3>
          <ul className={styles.list}>
            {categories.map((c) => {
              const navIndex = navItems.findIndex(
                (i) => i.type === 'category' && i.payload === c,
              );
              const isActive = navIndex === highlight;
              return (
                <li key={c.id ?? c.slug}>
                  <CategoryRow
                    category={c}
                    active={isActive}
                    onMouseEnter={() => onHover(navIndex)}
                    onClick={() =>
                      onSelectItem({ type: 'category', payload: c })
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ProductRow({ product, active, onMouseEnter, onClick }) {
  const fallback = getProductPlaceholder(product?.name || 'THIS Interiors');
  const image = product?.images?.[0] || fallback;
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={[styles.row, active ? styles.rowActive : ''].join(' ')}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className={styles.thumb}>
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(e) => handleImageError(e, product?.name)}
        />
      </span>
      <span className={styles.rowMeta}>
        <span className={styles.rowName}>{product?.name}</span>
        {product?.category?.name ? (
          <span className={styles.rowEyebrow}>{product.category.name}</span>
        ) : null}
      </span>
      <span className={styles.rowPrice}>
        {formatCurrency(product?.price, product?.currency || 'AED')}
      </span>
    </button>
  );
}

function CategoryRow({ category, active, onMouseEnter, onClick }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={[styles.row, active ? styles.rowActive : ''].join(' ')}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className={[styles.thumb, styles.thumbCategory].join(' ')} aria-hidden="true">
        <SearchIcon fontSize="small" />
      </span>
      <span className={styles.rowMeta}>
        <span className={styles.rowName}>{category?.name}</span>
        <span className={styles.rowEyebrow}>Browse category</span>
      </span>
    </button>
  );
}

function EmptyState({ recent, onClearRecent, onSubmitQuery, saleItems, onSelectItem }) {
  return (
    <div className={styles.empty}>
      <div className={styles.columns}>
        <section className={styles.column}>
          <header className={styles.columnHeader}>
            <h3 className={styles.groupTitle}>Recent searches</h3>
            {recent.length ? (
              <button
                type="button"
                className={styles.clearLink}
                onClick={onClearRecent}
              >
                Clear
              </button>
            ) : null}
          </header>
          {recent.length ? (
            <div className={styles.chipRow}>
              {recent.map((q) => (
                <Chip
                  key={q}
                  label={q}
                  size="small"
                  onClick={() => onSubmitQuery(q)}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyHint}>
              Your recent queries will appear here.
            </p>
          )}
        </section>

        <section className={styles.column}>
          <header className={styles.columnHeader}>
            <h3 className={styles.groupTitle}>Popular right now</h3>
          </header>
          <div className={styles.chipRow}>
            {TRENDING_QUERIES.map((q) => (
              <Chip
                key={q}
                label={q}
                size="small"
                variant="outline"
                onClick={() => onSubmitQuery(q)}
              />
            ))}
          </div>
        </section>
      </div>

      {saleItems.length ? (
        <section className={styles.saleRail}>
          <header className={styles.columnHeader}>
            <h3 className={styles.groupTitle}>On sale</h3>
          </header>
          <ul className={styles.saleList}>
            {saleItems.map((p) => (
              <li key={p.id ?? p.slug}>
                <button
                  type="button"
                  className={styles.saleCard}
                  onClick={() =>
                    onSelectItem({ type: 'product', payload: p })
                  }
                >
                  <span className={styles.saleThumb}>
                    <img
                      src={
                        p.images?.[0] || getProductPlaceholder(p.name)
                      }
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      onError={(e) => handleImageError(e, p.name)}
                    />
                  </span>
                  <span className={styles.saleName}>{p.name}</span>
                  <span className={styles.salePrice}>
                    {formatCurrency(p.price, p.currency || 'AED')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default SearchOverlay;
