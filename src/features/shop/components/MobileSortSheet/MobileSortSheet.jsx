import AppDrawer from '../../../../components/common/AppDrawer/AppDrawer.jsx';
import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import { SORT_OPTIONS } from '../../constants.js';
import styles from './MobileSortSheet.module.css';

function MobileSortSheet({ open, onClose, sort = 'featured', onSelect, onApply }) {
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      anchor="bottom"
      title="Sort by"
      footer={
        <div className={styles.footer}>
          <AppButton variant="primary" onClick={onApply}>
            Apply
          </AppButton>
        </div>
      }
    >
      <div className={styles.handleWrap} aria-hidden="true">
        <span className={styles.handle} />
      </div>
      <ul className={styles.list} role="radiogroup" aria-label="Sort options">
        {SORT_OPTIONS.map((opt) => {
          const isActive = sort === opt.value;
          return (
            <li key={opt.value} className={styles.item}>
              <button
                type="button"
                className={styles.option}
                role="radio"
                aria-checked={isActive}
                onClick={() => onSelect?.(opt.value)}
              >
                <span>{opt.label}</span>
                {isActive ? (
                  <span aria-hidden="true" className={styles.checkmark}>
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </AppDrawer>
  );
}

export default MobileSortSheet;
