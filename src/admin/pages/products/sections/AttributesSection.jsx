import { useFieldArray, useFormContext } from 'react-hook-form';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import AdminCard from '../../../components/AdminCard.jsx';
import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../../components/common/AppTextField/AppTextField.jsx';
import styles from '../ProductFormPage.module.css';

function AttributesSection({ disabled = false }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  });

  return (
    <AdminCard
      eyebrow="Attributes"
      className={styles.section}
      action={
        !disabled ? (
          <AppButton
            variant="ghost"
            size="small"
            icon={<AddRoundedIcon fontSize="small" />}
            onClick={() => append({ key: '', value: '' })}
          >
            Add row
          </AppButton>
        ) : null
      }
    >
      <div className={styles.attrList}>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.attrRow}>
            <AppTextField
              name={`attributes.${index}.key`}
              placeholder="Key (e.g. color)"
              size="small"
              disabled={disabled}
            />
            <AppTextField
              name={`attributes.${index}.value`}
              placeholder="Value (e.g. Ivory, or 24 × 24 × 38 cm)"
              size="small"
              disabled={disabled}
            />
            <IconButton
              size="small"
              aria-label="Remove attribute"
              disabled={disabled}
              onClick={() => remove(index)}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export default AttributesSection;
