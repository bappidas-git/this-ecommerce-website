import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';

import Seo from '../../../components/common/Seo.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import Loader from '../../../components/common/Loader/Loader.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { useCategories } from '../../../hooks/useCategories.js';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { adminProductService } from '../../../api/services/admin/adminProductService.js';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import { PATHS } from '../../../routes/paths.js';

import GeneralSection from './sections/GeneralSection.jsx';
import PricingSection from './sections/PricingSection.jsx';
import MediaSection from './sections/MediaSection.jsx';
import InventorySection from './sections/InventorySection.jsx';
import AttributesSection from './sections/AttributesSection.jsx';
import SeoSection from './sections/SeoSection.jsx';
import SidebarColumn from './sections/SidebarColumn.jsx';

import {
  emptyDefaults,
  formValuesToPayload,
  productSchema,
  productToFormValues,
} from './productSchema.js';
import useUnsavedChangesPrompt from './useUnsavedChangesPrompt.js';
import styles from './ProductFormPage.module.css';

function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { canWrite } = useCanAdminAccess('products');
  const isEdit = Boolean(id);
  const mode = isEdit ? 'edit' : 'create';
  const readOnly = !canWrite;

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [topError, setTopError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const initialName = useRef('');

  const methods = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: emptyDefaults,
    mode: 'onBlur',
  });
  const {
    handleSubmit,
    reset,
    formState,
    watch,
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods);

  const name = watch('name');
  const status = watch('status');

  const breadcrumbs = useMemo(
    () => [
      { label: 'Catalog' },
      { label: 'Products', to: PATHS.admin.products },
      {
        label:
          isEdit && initialName.current
            ? initialName.current
            : isEdit
              ? 'Edit product'
              : 'New product',
      },
    ],
    [isEdit, initialName.current], // eslint-disable-line react-hooks/exhaustive-deps
  );
  useAdminBreadcrumbs(breadcrumbs);

  // Load product on edit
  useEffect(() => {
    let active = true;
    if (!isEdit) return undefined;
    setLoading(true);
    setLoadError(null);
    adminProductService
      .getById(id)
      .then((product) => {
        if (!active) return;
        const values = productToFormValues(product);
        initialName.current = product?.name || '';
        reset(values);
        if (product?.updatedAt) {
          const dt = new Date(product.updatedAt);
          if (!Number.isNaN(dt.getTime())) setLastSavedAt(dt);
        }
      })
      .catch((err) => {
        if (active) setLoadError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEdit, reset]);

  const { categories } = useCategoriesSafe();

  const isDirty = formState.isDirty;
  const isSubmitting = formState.isSubmitting;
  const blocker = useUnsavedChangesPrompt(isDirty && !isSubmitting);

  const onCancel = useCallback(() => {
    navigate(PATHS.admin.products);
  }, [navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setTopError(null);
    const payload = formValuesToPayload(values);
    try {
      let saved;
      if (isEdit) {
        saved = await adminProductService.update(id, payload);
      } else {
        saved = await adminProductService.create(payload);
      }
      const next = productToFormValues(saved || payload);
      reset(next, { keepDefaultValues: false });
      setLastSavedAt(new Date());
      initialName.current = saved?.name || values.name;
      toast.success('Saved.');
      const newId = saved?.id ?? id;
      if (!isEdit && newId) {
        navigate(PATHS.admin.productEdit(newId), { replace: true });
      }
    } catch (err) {
      const fieldErrors = err?.errors;
      if (fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
        onApiError(err);
        return;
      }
      setTopError(getApiErrorMessage(err) || 'Could not save product.');
    }
  });

  // Confirm-on-leave dialog
  const onDiscard = () => {
    if (blocker?.proceed) blocker.proceed();
  };
  const onStay = () => {
    if (blocker?.reset) blocker.reset();
  };

  if (loadError) {
    return (
      <>
        <Seo title="Edit product | Admin" noindex />
        <AdminPageHeader eyebrow="Catalog" title="Edit product" />
        <ErrorState
          title="Could not load product"
          description={loadError?.message || 'Please try again.'}
          onRetry={() => window.location.reload()}
        />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Seo title="Edit product | Admin" noindex />
        <AdminPageHeader eyebrow="Catalog" title="Edit product" />
        <Loader label="Loading product…" />
      </>
    );
  }

  const headerTitle = isEdit
    ? name || initialName.current || 'Edit product'
    : 'New product';

  return (
    <FormProvider {...methods}>
      <Seo title={`${headerTitle} | Admin`} noindex />
      <AdminPageHeader
        eyebrow={isEdit ? 'Edit product' : 'New product'}
        title={
          <span>
            {headerTitle}
            {readOnly ? (
              <span className={styles.headerNote}>
                <StatusPill status="muted" label="Read-only" />
              </span>
            ) : null}
          </span>
        }
        description={
          isEdit
            ? `Status: ${status}. Update the catalog entry below.`
            : 'Create a new product for the catalog.'
        }
        actions={
          <div className={styles.formActions}>
            <AppButton variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </AppButton>
            {!readOnly ? (
              <AppButton
                variant="primary"
                onClick={onSubmit}
                loading={isSubmitting}
              >
                Save
              </AppButton>
            ) : null}
          </div>
        }
      />

      <form noValidate onSubmit={onSubmit} className={styles.layout}>
        <div className={styles.main}>
          {topError ? (
            <Alert severity="error" className={styles.alert}>
              {topError}
            </Alert>
          ) : null}
          <GeneralSection disabled={readOnly} />
          <PricingSection disabled={readOnly} />
          <MediaSection disabled={readOnly} />
          <InventorySection disabled={readOnly} />
          <AttributesSection disabled={readOnly} />
          <SeoSection disabled={readOnly} />
        </div>
        <SidebarColumn
          mode={mode}
          productId={id}
          categories={categories}
          disabled={readOnly}
          isSubmitting={isSubmitting}
          onSave={onSubmit}
          onCancel={onCancel}
          lastSavedAt={lastSavedAt}
        />
      </form>

      <AppDialog
        open={blocker?.state === 'blocked'}
        onClose={onStay}
        title="Unsaved changes"
        description="You have unsaved changes on this product. Discard them and leave, or stay and continue editing?"
        size="sm"
        actions={
          <>
            <AppButton variant="ghost" onClick={onStay}>
              Stay
            </AppButton>
            <AppButton variant="danger" onClick={onDiscard}>
              Discard
            </AppButton>
          </>
        }
      />
    </FormProvider>
  );
}

function useCategoriesSafe() {
  const { items } = useCategories();
  return { categories: items };
}

export default ProductFormPage;
