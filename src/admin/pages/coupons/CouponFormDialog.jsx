import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppSwitch from '../../../components/common/AppSwitch/AppSwitch.jsx';

import {
  couponEmptyDefaults,
  couponSchema,
  couponToFormValues,
  formValuesToPayload,
  generateCouponCode,
} from '../../features/coupons/couponSchema.js';

import styles from './CouponFormDialog.module.css';

const TYPE_OPTIONS = [
  { value: 'percent', label: 'Percent off' },
  { value: 'fixed', label: 'Fixed AED off' },
];

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All products' },
  { value: 'categories', label: 'Specific categories' },
  { value: 'products', label: 'Specific products' },
];

function FormSection({ title, hint, children }) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {hint ? <p className={styles.sectionHint}>{hint}</p> : null}
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function CouponFormDialog({
  open,
  mode = 'create',
  coupon = null,
  categories = [],
  products = [],
  loadingTargets = false,
  disabled = false,
  onClose,
  onSubmit,
}) {
  const defaults = useMemo(
    () => (coupon ? couponToFormValues(coupon) : couponEmptyDefaults),
    [coupon],
  );

  const methods = useForm({
    resolver: yupResolver(couponSchema),
    defaultValues: defaults,
    mode: 'onBlur',
  });
  const { control, register, handleSubmit, reset, setValue, setError, formState } =
    methods;
  const { errors, isSubmitting } = formState;

  const [topError, setTopError] = useState(null);

  useEffect(() => {
    if (!open) return;
    reset(defaults);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTopError(null);
  }, [open, defaults, reset]);

  const type = useWatch({ control, name: 'type' });
  const appliesTo = useWatch({ control, name: 'appliesTo' });
  const watchedTargetIds = useWatch({ control, name: 'targetIds' });

  const targetOptions = useMemo(() => {
    if (appliesTo === 'categories') {
      return categories.map((c) => ({ id: c.id, label: c.name }));
    }
    if (appliesTo === 'products') {
      return products.map((p) => ({
        id: p.id,
        label: p.name,
        sku: p.sku,
      }));
    }
    return [];
  }, [appliesTo, categories, products]);

  const selectedTargets = useMemo(() => {
    const ids = Array.isArray(watchedTargetIds) ? watchedTargetIds : [];
    return targetOptions.filter((o) => ids.includes(o.id));
  }, [targetOptions, watchedTargetIds]);

  const handleGenerate = () => {
    setValue('code', generateCouponCode(8), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCodeBlur = (e) => {
    const next = String(e.target.value || '').toUpperCase().trim();
    setValue('code', next, { shouldValidate: true, shouldDirty: true });
  };

  const onValid = async (values) => {
    setTopError(null);
    const payload = formValuesToPayload(values);
    try {
      await onSubmit(payload);
    } catch (err) {
      const fieldErrors = err?.errors || err?.response?.data?.errors || null;
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message: String(message) });
        });
      }
      const message =
        err?.message ||
        err?.response?.data?.message ||
        'Could not save coupon.';
      setTopError(message);
    }
  };

  const isReadOnly = disabled;

  return (
    <AppDialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      size="lg"
      title={mode === 'edit' ? `Edit ${coupon?.code || 'coupon'}` : 'New coupon'}
      description={
        mode === 'edit'
          ? 'Update the coupon details below.'
          : 'Configure how this coupon discounts the cart.'
      }
      actions={
        <>
          <AppButton variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSubmit(onValid)}
            loading={isSubmitting}
            disabled={isReadOnly}
          >
            {mode === 'edit' ? 'Save changes' : 'Create coupon'}
          </AppButton>
        </>
      }
    >
      <FormProvider {...methods}>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onValid)}
          noValidate
        >
          {topError ? (
            <Alert severity="error" className={styles.topError}>
              {topError}
            </Alert>
          ) : null}

          <FormSection title="Code" hint="Customers type this at checkout.">
            <div className={styles.codeRow}>
              <AppTextField
                label="Coupon code"
                placeholder="WELCOME10"
                {...register('code')}
                onBlur={handleCodeBlur}
                error={errors.code?.message}
                inputProps={{
                  maxLength: 20,
                  className: styles.monoInput,
                  'aria-label': 'Coupon code',
                }}
                fullWidth
                disabled={isReadOnly}
              />
              <AppButton
                variant="secondary"
                size="medium"
                type="button"
                icon={<AutorenewRoundedIcon fontSize="small" />}
                onClick={handleGenerate}
                disabled={isReadOnly}
              >
                Generate
              </AppButton>
            </div>
          </FormSection>

          <FormSection
            title="Discount"
            hint="Choose a percentage off the eligible subtotal or a fixed AED amount."
          >
            <div className={styles.grid2}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    {...field}
                    label="Discount type"
                    options={TYPE_OPTIONS}
                    error={errors.type?.message}
                    disabled={isReadOnly}
                  />
                )}
              />
              <AppTextField
                label={type === 'percent' ? 'Percent' : 'Amount'}
                type="number"
                inputProps={{ min: type === 'percent' ? 1 : 1, step: 1 }}
                {...register('value', { valueAsNumber: true })}
                error={errors.value?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {type === 'percent' ? '%' : 'AED'}
                    </InputAdornment>
                  ),
                }}
                fullWidth
                disabled={isReadOnly}
              />
            </div>
          </FormSection>

          <FormSection title="Limits" hint="Optional caps on cart size and uses.">
            <div className={styles.grid2}>
              <AppTextField
                label="Minimum subtotal (AED)"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                {...register('minSubtotal', { valueAsNumber: true })}
                error={errors.minSubtotal?.message}
                fullWidth
                disabled={isReadOnly}
              />
              <AppTextField
                label="Max redemptions"
                type="number"
                inputProps={{ min: 1, step: 1 }}
                {...register('maxRedemptions')}
                error={errors.maxRedemptions?.message}
                helperText="Leave blank for unlimited"
                fullWidth
                disabled={isReadOnly}
              />
            </div>
            {coupon?.redeemedCount != null ? (
              <p className={styles.usageHint}>
                Used {coupon.redeemedCount} time
                {coupon.redeemedCount === 1 ? '' : 's'} so far.
              </p>
            ) : null}
          </FormSection>

          <FormSection
            title="Schedule"
            hint="When the coupon becomes valid and when it expires."
          >
            <div className={styles.grid2}>
              <AppTextField
                label="Starts at"
                type="datetime-local"
                {...register('startsAt')}
                error={errors.startsAt?.message}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={isReadOnly}
              />
              <AppTextField
                label="Ends at"
                type="datetime-local"
                {...register('endsAt')}
                error={errors.endsAt?.message}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={isReadOnly}
              />
            </div>
          </FormSection>

          <FormSection title="Scope" hint="Limit which items are eligible.">
            <Controller
              name="appliesTo"
              control={control}
              render={({ field }) => (
                <AppSelect
                  {...field}
                  label="Applies to"
                  options={SCOPE_OPTIONS}
                  error={errors.appliesTo?.message}
                  disabled={isReadOnly}
                  onChange={(event) => {
                    field.onChange(event);
                    setValue('targetIds', [], {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              )}
            />

            {appliesTo !== 'all' ? (
              <Controller
                name="targetIds"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={targetOptions}
                    value={selectedTargets}
                    loading={loadingTargets}
                    disabled={isReadOnly}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    getOptionLabel={(opt) => opt.label || ''}
                    onChange={(_, next) => {
                      field.onChange(next.map((o) => o.id));
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((opt, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={opt.id}
                          label={opt.label}
                          size="small"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          appliesTo === 'categories'
                            ? 'Eligible categories'
                            : 'Eligible products'
                        }
                        placeholder="Search…"
                        error={Boolean(errors.targetIds?.message)}
                        helperText={
                          errors.targetIds?.message ||
                          (appliesTo === 'categories'
                            ? 'Discount applies only to items in these categories.'
                            : 'Discount applies only to these products.')
                        }
                      />
                    )}
                  />
                )}
              />
            ) : null}
          </FormSection>

          <FormSection title="Status">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <AppSwitch
                  label="Active"
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={isReadOnly}
                />
              )}
            />
          </FormSection>
        </form>
      </FormProvider>
    </AppDialog>
  );
}

export default CouponFormDialog;
