import { useFormContext, useWatch } from 'react-hook-form';
import AdminCard from '../../../components/AdminCard.jsx';
import AppTextField from '../../../../components/common/AppTextField/AppTextField.jsx';
import styles from '../ProductFormPage.module.css';

function SeoSection({ disabled = false }) {
  const { control } = useFormContext();
  const metaTitle = useWatch({ control, name: 'seo.metaTitle' }) || '';
  const metaDescription = useWatch({ control, name: 'seo.metaDescription' }) || '';

  return (
    <AdminCard eyebrow="SEO" className={styles.section}>
      <AppTextField
        name="seo.metaTitle"
        label="Meta title"
        disabled={disabled}
        optional
      />
      <p className={styles.helperCount}>{metaTitle.length} / 60</p>
      <AppTextField
        name="seo.metaDescription"
        label="Meta description"
        multiline
        minRows={3}
        disabled={disabled}
        optional
      />
      <p className={styles.helperCount}>{metaDescription.length} / 160</p>
      <AppTextField
        name="seo.ogImage"
        label="OG image URL"
        disabled={disabled}
        optional
      />
      <AppTextField
        name="seo.canonical"
        label="Canonical URL override"
        disabled={disabled}
        optional
      />
    </AdminCard>
  );
}

export default SeoSection;
