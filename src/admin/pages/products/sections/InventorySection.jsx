import AdminCard from '../../../components/AdminCard.jsx';
import AppTextField from '../../../../components/common/AppTextField/AppTextField.jsx';
import AppSwitch from '../../../../components/common/AppSwitch/AppSwitch.jsx';
import styles from '../ProductFormPage.module.css';

function InventorySection({ disabled = false }) {
  return (
    <AdminCard eyebrow="Inventory" className={styles.section}>
      <div className={`${styles.row} ${styles.row2}`}>
        <AppTextField name="sku" label="SKU" required disabled={disabled} />
        <AppTextField
          name="stock"
          label="Stock"
          type="number"
          inputProps={{ min: 0, step: 1 }}
          required
          disabled={disabled}
        />
      </div>
      <div className={`${styles.row} ${styles.row2}`}>
        <AppTextField
          name="lowStockThreshold"
          label="Low-stock threshold"
          type="number"
          inputProps={{ min: 0, step: 1 }}
          disabled={disabled}
          helperText="Trigger a low-stock badge below this number."
        />
        <AppSwitch
          name="allowBackorder"
          label="Allow backorder"
          disabled={disabled}
        />
      </div>
    </AdminCard>
  );
}

export default InventorySection;
