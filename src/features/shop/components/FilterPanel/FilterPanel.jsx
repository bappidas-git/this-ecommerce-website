import { useState } from 'react';
import Slider from '@mui/material/Slider';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import AppTextField from '../../../../components/common/AppTextField/AppTextField.jsx';
import AppRadioGroup from '../../../../components/common/AppRadioGroup/AppRadioGroup.jsx';
import AppSwitch from '../../../../components/common/AppSwitch/AppSwitch.jsx';
import Chip from '../../../../components/common/Chip/Chip.jsx';
import {
  COLOR_OPTIONS,
  MATERIAL_OPTIONS,
  DEFAULT_PRICE,
} from '../../constants.js';
import styles from './FilterPanel.module.css';

const DEFAULT_OPEN_GROUPS = {
  category: true,
  price: true,
  color: true,
  material: false,
  availability: true,
  search: true,
};

const toggleInList = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const clampNum = (raw, fallback) => {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
};

function CollapsibleGroup({ id, title, isOpen, onToggle, children }) {
  const headingId = `filter-group-${id}-label`;
  const panelId = `filter-group-${id}-panel`;

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        aria-expanded={isOpen}
        aria-controls={panelId}
        id={headingId}
        onClick={() => onToggle(id)}
      >
        <span>{title}</span>
        <span
          className={[styles.caret, isOpen ? styles.caretOpen : null].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          <KeyboardArrowDownRoundedIcon fontSize="small" />
        </span>
      </button>
      {isOpen ? (
        <div id={panelId} role="region" aria-labelledby={headingId} className={styles.groupBody}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function FilterPanel({
  categories = [],
  state,
  onChange,
  onClearAll,
  isCategoryLocked = false,
  lockedCategory = null,
  showHeader = true,
  className,
}) {
  const [openGroups, setOpenGroups] = useState(DEFAULT_OPEN_GROUPS);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setPartial = (partial) => {
    if (typeof onChange === 'function') onChange(partial);
  };

  const minPrice = state?.minPrice ?? DEFAULT_PRICE.min;
  const maxPrice = state?.maxPrice ?? DEFAULT_PRICE.max;
  const colors = state?.colors ?? [];
  const materials = state?.materials ?? [];

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const handleSliderChange = (_e, value) => {
    if (!Array.isArray(value)) return;
    const [nextMin, nextMax] = value;
    setPartial({
      minPrice: nextMin === DEFAULT_PRICE.min ? null : nextMin,
      maxPrice: nextMax === DEFAULT_PRICE.max ? null : nextMax,
    });
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {showHeader ? (
        <div className={styles.headerRow}>
          <h2 className={styles.headerTitle}>Filters</h2>
          <button type="button" className={styles.clearAll} onClick={onClearAll}>
            Clear all
          </button>
        </div>
      ) : null}

      <CollapsibleGroup
        id="search"
        title="Search within results"
        isOpen={openGroups.search}
        onToggle={toggleGroup}
      >
        <AppTextField
          placeholder="Search this collection"
          value={state?.q ?? ''}
          onChange={(e) => setPartial({ q: e.target.value })}
          size="small"
          inputProps={{ 'aria-label': 'Search within results' }}
        />
      </CollapsibleGroup>

      <CollapsibleGroup
        id="category"
        title="Category"
        isOpen={openGroups.category}
        onToggle={toggleGroup}
      >
        {isCategoryLocked ? (
          <>
            <div className={styles.lockedCategory} aria-live="polite">
              <span className={styles.lockedCategoryDot} aria-hidden="true" />
              <span>{lockedCategory ? lockedCategory.name : 'Loading category…'}</span>
            </div>
            <p className={styles.lockedCategoryHint}>
              Browse all collections from the Shop landing page.
            </p>
          </>
        ) : (
          <AppRadioGroup
            options={categoryOptions}
            value={state?.categoryId ? String(state.categoryId) : ''}
            onChange={(e) =>
              setPartial({ categoryId: e.target.value || null })
            }
          />
        )}
      </CollapsibleGroup>

      <CollapsibleGroup
        id="price"
        title="Price"
        isOpen={openGroups.price}
        onToggle={toggleGroup}
      >
        <div className={styles.priceInputs}>
          <AppTextField
            label="Min"
            type="number"
            size="small"
            value={state?.minPrice ?? ''}
            onChange={(e) =>
              setPartial({ minPrice: clampNum(e.target.value, null) })
            }
            inputProps={{ min: 0, 'aria-label': 'Minimum price' }}
          />
          <AppTextField
            label="Max"
            type="number"
            size="small"
            value={state?.maxPrice ?? ''}
            onChange={(e) =>
              setPartial({ maxPrice: clampNum(e.target.value, null) })
            }
            inputProps={{ min: 0, 'aria-label': 'Maximum price' }}
          />
        </div>
        <div className={styles.sliderRow}>
          <Slider
            value={[minPrice, maxPrice]}
            min={DEFAULT_PRICE.min}
            max={DEFAULT_PRICE.max}
            valueLabelDisplay="auto"
            aria-label="Price range"
            onChangeCommitted={handleSliderChange}
          />
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup
        id="color"
        title="Color"
        isOpen={openGroups.color}
        onToggle={toggleGroup}
      >
        <div className={styles.chipRow}>
          {COLOR_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              variant="outline"
              selected={colors.includes(opt.value)}
              onClick={() => setPartial({ colors: toggleInList(colors, opt.value) })}
              clickable
            />
          ))}
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup
        id="material"
        title="Material"
        isOpen={openGroups.material}
        onToggle={toggleGroup}
      >
        <div className={styles.chipRow}>
          {MATERIAL_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              variant="outline"
              selected={materials.includes(opt.value)}
              onClick={() => setPartial({ materials: toggleInList(materials, opt.value) })}
              clickable
            />
          ))}
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup
        id="availability"
        title="Availability"
        isOpen={openGroups.availability}
        onToggle={toggleGroup}
      >
        <div className={styles.toggleRow}>
          <AppSwitch
            label="In stock"
            checked={Boolean(state?.inStock)}
            onChange={(e) => setPartial({ inStock: e.target.checked })}
          />
          <AppSwitch
            label="On sale"
            checked={Boolean(state?.onSale)}
            onChange={(e) => setPartial({ onSale: e.target.checked })}
          />
        </div>
      </CollapsibleGroup>
    </div>
  );
}

export default FilterPanel;
