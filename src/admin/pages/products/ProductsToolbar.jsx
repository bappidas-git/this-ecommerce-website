import { useEffect, useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';

import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import {
  PRODUCT_STATUS_OPTIONS,
  STOCK_OPTIONS,
} from '../../features/products/productStatus.js';

import styles from './ProductsToolbar.module.css';

const SEARCH_DEBOUNCE_MS = 250;

function ProductsToolbar({
  search,
  onSearch,
  categoryId,
  onCategoryId,
  status,
  onStatus,
  stock,
  onStock,
  priceMin,
  priceMax,
  onPriceMin,
  onPriceMax,
  categories = [],
  onReset,
  hasActiveFilters,
}) {
  const [localQ, setLocalQ] = useState(search ?? '');

  useEffect(() => {
    setLocalQ(search ?? '');
  }, [search]);

  useEffect(() => {
    if (localQ === (search ?? '')) return undefined;
    const id = setTimeout(() => onSearch(localQ), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div className={styles.root} role="search" aria-label="Filter products">
      <div className={styles.searchCell}>
        <AppTextField
          aria-label="Search products"
          placeholder="Search by name or SKU…"
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
                    onSearch('');
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </div>

      <div className={styles.filterCell}>
        <AppSelect
          label="Category"
          size="small"
          value={categoryId ?? ''}
          onChange={(e) => onCategoryId(e.target.value)}
          options={categoryOptions}
        />
      </div>

      <div className={styles.filterCell}>
        <AppSelect
          label="Status"
          size="small"
          value={status ?? ''}
          onChange={(e) => onStatus(e.target.value)}
          options={PRODUCT_STATUS_OPTIONS}
        />
      </div>

      <div className={styles.filterCell}>
        <AppSelect
          label="Stock"
          size="small"
          value={stock ?? ''}
          onChange={(e) => onStock(e.target.value)}
          options={STOCK_OPTIONS}
        />
      </div>

      <div className={styles.priceCell}>
        <AppTextField
          label="Min price"
          size="small"
          type="number"
          inputProps={{ min: 0 }}
          value={priceMin ?? ''}
          onChange={(e) => onPriceMin(e.target.value)}
        />
        <AppTextField
          label="Max price"
          size="small"
          type="number"
          inputProps={{ min: 0 }}
          value={priceMax ?? ''}
          onChange={(e) => onPriceMax(e.target.value)}
        />
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          className={styles.resetBtn}
          onClick={onReset}
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

export default ProductsToolbar;
