import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppSwitch from '../../../components/common/AppSwitch/AppSwitch.jsx';

import styles from './CategoryEditor.module.css';

const DEFAULT_IMAGE =
  'https://placehold.co/720x720/E5DED2/1B1A17?text=THIS+Interiors&font=playfair';

const schema = yup.object({
  name: yup.string().trim().required('Name is required').max(80),
  slug: yup
    .string()
    .trim()
    .required('Slug is required')
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and hyphens only',
    )
    .max(80),
  description: yup.string().trim().max(500).default(''),
  image: yup.string().trim().url('Enter a valid URL').required('Image URL is required'),
  parentId: yup
    .mixed()
    .transform((v) => (v === '' || v === undefined || v === null ? null : Number(v)))
    .nullable(),
  sortOrder: yup.number().integer().min(0).default(0),
  isActive: yup.boolean().default(true),
});

const emptyDefaults = {
  name: '',
  slug: '',
  description: '',
  image: DEFAULT_IMAGE,
  parentId: '',
  sortOrder: 0,
  isActive: true,
};

const toFormValues = (cat) =>
  cat
    ? {
        name: cat.name || '',
        slug: cat.slug || '',
        description: cat.description || '',
        image: cat.image || DEFAULT_IMAGE,
        parentId: cat.parentId == null ? '' : String(cat.parentId),
        sortOrder: cat.sortOrder ?? 0,
        isActive: cat.isActive !== false,
      }
    : emptyDefaults;

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

function CategoryEditor({
  mode, // 'create' | 'edit'
  category,
  categories, // flat list
  excludedIds, // Set of ids to exclude from parent options (self + descendants)
  disabled,
  onSubmit,
  topError,
}) {
  const initialValues = useMemo(() => toFormValues(category), [category]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
    mode: 'onBlur',
  });
  const { handleSubmit, reset, formState, watch, setValue, getValues } = methods;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  // Auto-fill slug while creating
  const name = watch('name');
  useEffect(() => {
    if (mode !== 'create') return;
    const dirtySlug = formState.dirtyFields?.slug;
    if (dirtySlug) return;
    const next = slugify(name);
    if (next !== getValues('slug')) {
      setValue('slug', next, { shouldDirty: false, shouldValidate: false });
    }
  }, [name, mode, formState.dirtyFields, getValues, setValue]);

  const parentOptions = useMemo(() => {
    const list = (categories || []).filter((c) => !excludedIds.has(c.id));
    list.sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || '')),
    );
    return [
      { value: '', label: '— Top level —' },
      ...list.map((c) => ({ value: String(c.id), label: c.name })),
    ];
  }, [categories, excludedIds]);

  const submit = handleSubmit((values) => {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description?.trim() || '',
      image: values.image.trim(),
      parentId:
        values.parentId === '' || values.parentId == null
          ? null
          : Number(values.parentId),
      sortOrder: Number(values.sortOrder) || 0,
      isActive: Boolean(values.isActive),
    };
    return onSubmit(payload);
  });

  const isSubmitting = formState.isSubmitting;
  const isDirty = formState.isDirty;

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={submit} className={styles.form}>
        {topError ? (
          <Alert severity="error" className={styles.alert}>
            {topError}
          </Alert>
        ) : null}

        <div className={styles.grid}>
          <AppTextField
            name="name"
            label="Name"
            required
            disabled={disabled}
          />
          <AppTextField
            name="slug"
            label="Slug"
            description="Lowercase letters, numbers, and hyphens."
            required
            disabled={disabled}
          />
          <AppTextField
            name="description"
            label="Description"
            multiline
            minRows={3}
            disabled={disabled}
          />
          <AppTextField
            name="image"
            label="Image URL"
            description="Use a placehold.co URL with brand colors if you don't have an image yet."
            disabled={disabled}
          />
          <AppSelect
            name="parentId"
            label="Parent"
            options={parentOptions}
            disabled={disabled}
          />
          <AppTextField
            name="sortOrder"
            label="Sort order"
            type="number"
            description="Controlled by the up/down buttons in the tree."
            disabled
            InputProps={{ readOnly: true }}
          />
          <AppSwitch
            name="isActive"
            label="Active"
            disabled={disabled}
          />
        </div>

        <div className={styles.footer}>
          <AppButton
            variant="ghost"
            onClick={() => reset(initialValues)}
            disabled={!isDirty || isSubmitting || disabled}
          >
            Cancel
          </AppButton>
          {!disabled ? (
            <AppButton
              variant="primary"
              type="submit"
              loading={isSubmitting}
            >
              {mode === 'create' ? 'Create category' : 'Save changes'}
            </AppButton>
          ) : null}
        </div>
      </form>
    </FormProvider>
  );
}

export default CategoryEditor;
