import { useEffect, useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import {
  INVENTORY_STATUS_OPTIONS,
  INVENTORY_SORT_OPTIONS,
} from '../../features/inventory/inventoryStatus.js';

import styles from './InventoryToolbar.module.css';

const SEARCH_DEBOUNCE_MS = 250;

function InventoryToolbar({
  search,
  onSearch,
  categoryId,
  onCategoryId,
  status,
  onStatus,
  sort,
  onSort,
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
    <div className={styles.root} role="search" aria-label="Filter inventory">
      <div className={styles.searchCell}>
        <AppTextField
          aria-label="Search inventory"
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
          options={INVENTORY_STATUS_OPTIONS}
        />
      </div>

      <div className={styles.filterCell}>
        <AppSelect
          label="Sort by"
          size="small"
          value={sort ?? 'updatedAt:desc'}
          onChange={(e) => onSort(e.target.value)}
          options={INVENTORY_SORT_OPTIONS}
        />
      </div>

      {hasActiveFilters ? (
        <button type="button" className={styles.resetBtn} onClick={onReset}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

export default InventoryToolbar;
