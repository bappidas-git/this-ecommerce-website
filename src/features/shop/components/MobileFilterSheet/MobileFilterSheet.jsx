import AppDrawer from '../../../../components/common/AppDrawer/AppDrawer.jsx';
import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import FilterPanel from '../FilterPanel/FilterPanel.jsx';
import styles from './MobileFilterSheet.module.css';

function MobileFilterSheet({
  open,
  onClose,
  onApply,
  onClearAll,
  ...filterProps
}) {
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      anchor="bottom"
      title="Filters"
      description="Refine the collection"
      width={{ xs: '100vw' }}
      footer={
        <div className={styles.footer}>
          <AppButton variant="ghost" onClick={onClearAll}>
            Clear all
          </AppButton>
          <AppButton variant="primary" onClick={onApply}>
            Apply
          </AppButton>
        </div>
      }
    >
      <div className={styles.handleWrap} aria-hidden="true">
        <span className={styles.handle} />
      </div>
      <div className={styles.body}>
        <FilterPanel
          {...filterProps}
          onClearAll={onClearAll}
          showHeader={false}
        />
      </div>
    </AppDrawer>
  );
}

export default MobileFilterSheet;
