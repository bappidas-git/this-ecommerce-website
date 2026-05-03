import Chip from '../../../../components/common/Chip/Chip.jsx';
import styles from './ActiveFilterChips.module.css';

function ActiveFilterChips({ chips = [], onRemove, onClearAll }) {
  if (!chips.length) return null;

  return (
    <div className={styles.root} aria-label="Active filters">
      <span className={styles.label}>Filtering by</span>
      {chips.map((chip) => (
        <Chip
          key={`${chip.group}:${chip.value}`}
          label={chip.label}
          variant="soft"
          onDelete={() => onRemove?.(chip)}
        />
      ))}
      <button type="button" className={styles.clearAll} onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}

export default ActiveFilterChips;
