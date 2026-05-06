import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import AdminCard from '../../../components/AdminCard.jsx';
import AppTextField from '../../../../components/common/AppTextField/AppTextField.jsx';
import TagsField from './TagsField.jsx';
import { slugify } from '../productSchema.js';
import styles from '../ProductFormPage.module.css';

function GeneralSection({ disabled = false }) {
  const { setValue, getValues, control } = useFormContext();
  const slugManualRef = useRef(false);
  const name = useWatch({ control, name: 'name' });
  const slug = useWatch({ control, name: 'slug' });

  useEffect(() => {
    if (slugManualRef.current) return;
    const auto = slugify(name);
    if (auto && auto !== getValues('slug')) {
      setValue('slug', auto, { shouldDirty: true, shouldValidate: false });
    }
  }, [name, setValue, getValues]);

  return (
    <AdminCard eyebrow="General" className={styles.section}>
      <AppTextField
        name="name"
        label="Name"
        required
        disabled={disabled}
        helperText="Visible to customers. 2–120 characters."
      />
      <AppTextField
        name="slug"
        label="Slug"
        required
        disabled={disabled}
        helperText="Lowercase letters, numbers and hyphens."
        onChange={(event) => {
          slugManualRef.current = true;
          setValue('slug', event.target.value, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
      <p className={styles.slugPreview}>
        shop.thisinteriors.com/products/
        <span className={styles.slugPreviewValue}>{slug || 'your-slug'}</span>
      </p>
      <AppTextField
        name="description"
        label="Description"
        multiline
        minRows={8}
        disabled={disabled}
        helperText="Plain text for now; rich text editor coming soon."
      />
      <TagsField disabled={disabled} />
    </AdminCard>
  );
}

export default GeneralSection;
