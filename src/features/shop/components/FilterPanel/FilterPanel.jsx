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
  selectedCategory = '',
  priceRange = DEFAULT_PRICE,
  selectedColors = [],
  selectedMaterials = [],
  inStock = false,
  onSale = false,
  searchTerm = '',
  onClearAll,
  showHeader = true,
  className,
}) {
  const [openGroups, setOpenGroups] = useState(DEFAULT_OPEN_GROUPS);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

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
          value={searchTerm}
          onChange={() => {}}
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
        <AppRadioGroup
          options={categoryOptions}
          value={selectedCategory}
          onChange={() => {}}
        />
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
            value={priceRange.min}
            onChange={() => {}}
            inputProps={{ min: 0, 'aria-label': 'Minimum price' }}
          />
          <AppTextField
            label="Max"
            type="number"
            size="small"
            value={priceRange.max}
            onChange={() => {}}
            inputProps={{ min: 0, 'aria-label': 'Maximum price' }}
          />
        </div>
        <div className={styles.sliderRow}>
          <Slider
            value={[priceRange.min, priceRange.max]}
            min={DEFAULT_PRICE.min}
            max={DEFAULT_PRICE.max}
            valueLabelDisplay="auto"
            aria-label="Price range"
            onChange={() => {}}
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
              selected={selectedColors.includes(opt.value)}
              onClick={() => {}}
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
              selected={selectedMaterials.includes(opt.value)}
              onClick={() => {}}
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
          <AppSwitch label="In stock" checked={inStock} onChange={() => {}} />
          <AppSwitch label="On sale" checked={onSale} onChange={() => {}} />
        </div>
      </CollapsibleGroup>
    </div>
  );
}

export default FilterPanel;
