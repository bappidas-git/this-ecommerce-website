import AdminCard from '../../../components/AdminCard.jsx';
import AppTextField from '../../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../../components/common/AppSelect/AppSelect.jsx';
import { TAX_CLASS_OPTIONS } from '../productSchema.js';
import styles from '../ProductFormPage.module.css';

function PricingSection({ disabled = false }) {
  return (
    <AdminCard eyebrow="Pricing" className={styles.section}>
      <div className={`${styles.row} ${styles.row2}`}>
        <AppTextField
          name="price"
          label="Price"
          type="number"
          inputProps={{ min: 0, step: '0.01' }}
          required
          disabled={disabled}
        />
        <AppTextField
          name="compareAtPrice"
          label="Compare-at price"
          type="number"
          inputProps={{ min: 0, step: '0.01' }}
          optional
          disabled={disabled}
          helperText="Shown as the strike-through original price."
        />
      </div>
      <div className={`${styles.row} ${styles.row2}`}>
        <AppTextField
          name="currency"
          label="Currency"
          value="AED"
          disabled
          helperText="AED is currently the only supported currency."
        />
        <AppSelect
          name="taxClass"
          label="Tax class"
          options={TAX_CLASS_OPTIONS}
          disabled={disabled}
        />
      </div>
    </AdminCard>
  );
}

export default PricingSection;
