import { useEffect, useMemo } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';

import AdminCard from '../../components/AdminCard.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSwitch from '../../../components/common/AppSwitch/AppSwitch.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';

import {
  generalSchema,
  brandingSchema,
  homepageSchema,
  announcementSchema,
  paymentSchema,
  socialSchema,
  emailsSchema,
} from '../../features/settings/settingsSchemas.js';

import styles from './SettingsPage.module.css';

function FormShell({
  methods,
  onSubmit,
  topError,
  canWrite,
  isSaving,
  children,
}) {
  const { handleSubmit, formState, reset } = methods;
  const { isDirty } = formState;

  return (
    <FormProvider {...methods}>
      <form
        className={styles.formArea}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {topError ? <Alert severity="error">{topError}</Alert> : null}
        {children}
        <div className={styles.formActions}>
          <div>
            {isDirty ? (
              <span className={styles.dirtyPill}>
                <span className={styles.dirtyDot} aria-hidden />
                Unsaved changes
              </span>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <AppButton
              variant="ghost"
              type="button"
              onClick={() => reset()}
              disabled={!isDirty || isSaving}
            >
              Reset
            </AppButton>
            <AppButton
              variant="primary"
              type="submit"
              loading={isSaving}
              disabled={!canWrite || !isDirty}
            >
              Save changes
            </AppButton>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function useGroupForm(schema, defaults) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaults,
    mode: 'onBlur',
  });
  // re-sync when defaults change (after save / refetch)
  useEffect(() => {
    methods.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaults)]);
  return methods;
}

/* -------------------------------------------------------------------------- */
/* General                                                                     */
/* -------------------------------------------------------------------------- */

export function GeneralTab({ initial, onSave, canWrite, isSaving, topError }) {
  const defaults = useMemo(
    () => ({
      storeName: initial?.storeName || '',
      supportEmail: initial?.supportEmail || initial?.email || '',
      supportPhone: initial?.supportPhone || initial?.phone || '',
      currency: 'AED',
      language: 'en',
      address: initial?.address || '',
      openingHours:
        typeof initial?.openingHours === 'string'
          ? initial.openingHours
          : Array.isArray(initial?.openingHours)
            ? initial.openingHours
                .map((h) => `${h.label}: ${h.value}`)
                .join('\n')
            : '',
      mapEmbedUrl: initial?.mapEmbedUrl || '',
    }),
    [initial],
  );

  const methods = useGroupForm(generalSchema, defaults);
  const isDisabled = !canWrite;

  return (
    <FormShell
      methods={methods}
      onSubmit={(v) => onSave({ ...v, email: v.supportEmail, phone: v.supportPhone })}
      topError={topError}
      canWrite={canWrite}
      isSaving={isSaving}
    >
      <AdminCard eyebrow="Store" title="Storefront identity">
        <div className={`${styles.formGrid} ${styles.formGrid2}`}>
          <AppTextField
            name="storeName"
            label="Store name"
            disabled={isDisabled}
          />
          <AppSelect
            name="currency"
            label="Currency"
            options={[{ value: 'AED', label: 'AED — UAE Dirham' }]}
            disabled
            helperText="Locked to AED for now."
          />
          <AppTextField
            name="supportEmail"
            label="Support email"
            type="email"
            disabled={isDisabled}
          />
          <AppTextField
            name="supportPhone"
            label="Support phone"
            disabled={isDisabled}
          />
          <AppSelect
            name="language"
            label="Default language"
            options={[{ value: 'en', label: 'English' }]}
            disabled
            helperText="Additional languages coming soon."
          />
        </div>
      </AdminCard>

      <AdminCard eyebrow="Studio" title="Address & opening hours">
        <AppTextField
          name="address"
          label="Studio address"
          multiline
          minRows={2}
          disabled={isDisabled}
        />
        <AppTextField
          name="openingHours"
          label="Opening hours"
          multiline
          minRows={3}
          helperText="One line per row. Format: Monday – Friday: 10:00 – 19:00"
          disabled={isDisabled}
        />
        <AppTextField
          name="mapEmbedUrl"
          label="Map embed URL"
          placeholder="https://www.google.com/maps?…&output=embed"
          disabled={isDisabled}
        />
      </AdminCard>
    </FormShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Branding                                                                    */
/* -------------------------------------------------------------------------- */

const ACCENT_COLOR = '#B8924F';
const DEFAULT_FAVICON = 'https://placehold.co/64x64/F7F3ED/B8924F?text=T';
const DEFAULT_OG = 'https://placehold.co/1200x630/F7F3ED/1B1A17?text=THIS+Interiors';

export function BrandingTab({ initial, onSave, canWrite, isSaving, topError }) {
  const defaults = useMemo(
    () => ({
      logoText: initial?.logoText || 'THIS Interiors',
      faviconUrl: initial?.faviconUrl || DEFAULT_FAVICON,
      accentColor: initial?.accentColor || ACCENT_COLOR,
      ogImageUrl: initial?.ogImageUrl || DEFAULT_OG,
    }),
    [initial],
  );

  const methods = useGroupForm(brandingSchema, defaults);
  const { control } = methods;
  const isDisabled = !canWrite;

  const logoText = useWatch({ control, name: 'logoText' });
  const faviconUrl = useWatch({ control, name: 'faviconUrl' });

  return (
    <FormShell
      methods={methods}
      onSubmit={onSave}
      topError={topError}
      canWrite={canWrite}
      isSaving={isSaving}
    >
      <AdminCard eyebrow="Identity" title="Wordmark & favicon">
        <div className={styles.previewWrap}>
          <p className={styles.previewLabel}>Live preview</p>
          <div className={styles.logoPreview} aria-hidden>
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                className={styles.logoFavicon}
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden';
                }}
              />
            ) : null}
            <span className={styles.logoWordmark}>{logoText || 'THIS'}</span>
          </div>
        </div>
        <div className={`${styles.formGrid} ${styles.formGrid2}`}>
          <AppTextField
            name="logoText"
            label="Logo wordmark"
            disabled={isDisabled}
          />
          <AppTextField
            name="faviconUrl"
            label="Favicon URL"
            placeholder={DEFAULT_FAVICON}
            disabled={isDisabled}
          />
        </div>
      </AdminCard>

      <AdminCard eyebrow="Palette" title="Accent colour">
        <p className={styles.helpText}>
          The brass accent is locked to keep brand consistency across the
          storefront.
        </p>
        <span className={styles.swatch}>
          <span
            className={styles.swatchDot}
            style={{ background: ACCENT_COLOR }}
            aria-hidden
          />
          {ACCENT_COLOR.toUpperCase()} — Brass
        </span>
        <Controller
          name="accentColor"
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
      </AdminCard>

      <AdminCard eyebrow="Sharing" title="Default OG image">
        <AppTextField
          name="ogImageUrl"
          label="OG image URL"
          placeholder={DEFAULT_OG}
          helperText="Used when storefront pages don't supply their own."
          disabled={isDisabled}
        />
      </AdminCard>
    </FormShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Homepage                                                                    */
/* -------------------------------------------------------------------------- */

export function HomepageTab({
  initial,
  onSave,
  canWrite,
  isSaving,
  topError,
  categoryOptions = [],
  productOptions = [],
  loadingOptions = false,
}) {
  const defaults = useMemo(
    () => ({
      heroTitle: initial?.heroTitle || '',
      heroSubtitle: initial?.heroSubtitle || '',
      heroCta: initial?.heroCta || '',
      heroImage: initial?.heroImage || '',
      featuredCategoryIds: Array.isArray(initial?.featuredCategoryIds)
        ? initial.featuredCategoryIds
        : [],
      featuredProductIds: Array.isArray(initial?.featuredProductIds)
        ? initial.featuredProductIds
        : [],
    }),
    [initial],
  );

  const methods = useGroupForm(homepageSchema, defaults);
  const { control, formState } = methods;
  const isDisabled = !canWrite;

  const watchedCategoryIds = useWatch({ control, name: 'featuredCategoryIds' });
  const watchedProductIds = useWatch({ control, name: 'featuredProductIds' });

  const selectedCategories = useMemo(
    () =>
      categoryOptions.filter((o) =>
        Array.isArray(watchedCategoryIds) ? watchedCategoryIds.includes(o.id) : false,
      ),
    [categoryOptions, watchedCategoryIds],
  );
  const selectedProducts = useMemo(
    () =>
      productOptions.filter((o) =>
        Array.isArray(watchedProductIds) ? watchedProductIds.includes(o.id) : false,
      ),
    [productOptions, watchedProductIds],
  );

  return (
    <FormShell
      methods={methods}
      onSubmit={onSave}
      topError={topError}
      canWrite={canWrite}
      isSaving={isSaving}
    >
      <AdminCard eyebrow="Hero" title="Above the fold">
        <AppTextField
          name="heroTitle"
          label="Hero title"
          disabled={isDisabled}
        />
        <AppTextField
          name="heroSubtitle"
          label="Hero subtitle"
          multiline
          minRows={2}
          disabled={isDisabled}
        />
        <div className={`${styles.formGrid} ${styles.formGrid2}`}>
          <AppTextField
            name="heroCta"
            label="Call-to-action label"
            disabled={isDisabled}
          />
          <AppTextField
            name="heroImage"
            label="Hero image URL"
            placeholder="https://placehold.co/1600x900/E5DED2/1B1A17"
            disabled={isDisabled}
          />
        </div>
      </AdminCard>

      <AdminCard eyebrow="Curation" title="Featured collections">
        <Controller
          name="featuredCategoryIds"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={categoryOptions}
              value={selectedCategories}
              loading={loadingOptions}
              disabled={isDisabled}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              getOptionLabel={(o) => o.label || ''}
              onChange={(_, next) => field.onChange(next.map((o) => o.id))}
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
                  label="Featured categories"
                  placeholder="Search categories…"
                  error={Boolean(formState.errors.featuredCategoryIds)}
                  helperText={
                    formState.errors.featuredCategoryIds?.message ||
                    'Showcased on the homepage rail.'
                  }
                />
              )}
            />
          )}
        />

        <Controller
          name="featuredProductIds"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={productOptions}
              value={selectedProducts}
              loading={loadingOptions}
              disabled={isDisabled}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              getOptionLabel={(o) => o.label || ''}
              onChange={(_, next) => field.onChange(next.map((o) => o.id))}
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
                  label="Featured products"
                  placeholder="Search products…"
                  error={Boolean(formState.errors.featuredProductIds)}
                  helperText={
                    formState.errors.featuredProductIds?.message ||
                    'Highlighted in the homepage editorial grid.'
                  }
                />
              )}
            />
          )}
        />
      </AdminCard>
    </FormShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Announcement                                                                */
/* -------------------------------------------------------------------------- */

export function AnnouncementTab({
  initial,
  onSave,
  canWrite,
  isSaving,
  topError,
}) {
  const defaults = useMemo(
    () => ({
      isActive: Boolean(initial?.isActive),
      text: initial?.text || '',
      link: initial?.link || '',
      dismissible:
        initial?.dismissible === undefined ? true : Boolean(initial.dismissible),
    }),
    [initial],
  );

  const methods = useGroupForm(announcementSchema, defaults);
  const { control } = methods;
  const isDisabled = !canWrite;

  const text = useWatch({ control, name: 'text' });
  const isActive = useWatch({ control, name: 'isActive' });

  return (
    <FormShell
      methods={methods}
      onSubmit={onSave}
      topError={topError}
      canWrite={canWrite}
      isSaving={isSaving}
    >
      <AdminCard eyebrow="Preview" title="Announcement bar">
        <div className={styles.previewWrap}>
          <p className={styles.previewLabel}>Live preview</p>
          {isActive && text ? (
            <div className={styles.announcementPreview}>{text}</div>
          ) : (
            <div
              className={`${styles.announcementPreview} ${styles.announcementPreviewMuted}`}
            >
              {isActive
                ? 'Add text to see the announcement preview.'
                : 'Announcement bar is hidden on the storefront.'}
            </div>
          )}
        </div>
      </AdminCard>

      <AdminCard eyebrow="Content" title="Message">
        <AppSwitch
          name="isActive"
          label="Show announcement bar"
          disabled={isDisabled}
        />
        <AppTextField
          name="text"
          label="Announcement text"
          disabled={isDisabled || !isActive}
          inputProps={{ maxLength: 180 }}
        />
        <AppTextField
          name="link"
          label="Link (optional)"
          placeholder="/shop or https://…"
          disabled={isDisabled || !isActive}
        />
        <AppSwitch
          name="dismissible"
          label="Allow shoppers to dismiss"
          disabled={isDisabled || !isActive}
        />
      </AdminCard>
    </FormShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Payment                                                                     */
/* -------------------------------------------------------------------------- */

export function PaymentTab({ initial, onSave, canWrite, isSaving, topError }) {
  const defaults = useMemo(() => {
    const bankInitial =
      typeof initial?.bankDetails === 'object' && initial?.bankDetails !== null
        ? initial.bankDetails
        : {};
    return {
      cardEnabled: Boolean(initial?.cardEnabled ?? true),
      codEnabled: Boolean(initial?.codEnabled ?? true),
      bankTransferEnabled: Boolean(initial?.bankTransferEnabled ?? true),
      codFee: typeof initial?.codFee === 'number' ? initial.codFee : 0,
      bankDetails: {
        bankName: bankInitial.bankName || '',
        accountName: bankInitial.accountName || '',
        iban: bankInitial.iban || '',
      },
    };
  }, [initial]);

  const methods = useGroupForm(paymentSchema, defaults);
  const { control } = methods;
  const isDisabled = !canWrite;

  const codEnabled = useWatch({ control, name: 'codEnabled' });
  const bankEnabled = useWatch({ control, name: 'bankTransferEnabled' });

  return (
    <FormShell
      methods={methods}
      onSubmit={onSave}
      topError={topError}
      canWrite={canWrite}
      isSaving={isSaving}
    >
      <AdminCard eyebrow="Methods" title="Payment options">
        <AppSwitch
          name="cardEnabled"
          label="Card payments"
          disabled={isDisabled}
        />
        <AppSwitch
          name="codEnabled"
          label="Cash on delivery"
          disabled={isDisabled}
        />
        {codEnabled ? (
          <div className={styles.subFields}>
            <AppTextField
              name="codFee"
              label="COD fee (AED)"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              disabled={isDisabled}
            />
          </div>
        ) : null}
        <AppSwitch
          name="bankTransferEnabled"
          label="Bank transfer"
          disabled={isDisabled}
        />
      </AdminCard>

      {bankEnabled ? (
        <AdminCard eyebrow="Bank transfer" title="Account details">
          <p className={styles.helpText}>
            Shown to customers who choose bank transfer at checkout.
          </p>
          <div className={`${styles.formGrid} ${styles.formGrid2}`}>
            <AppTextField
              name="bankDetails.bankName"
              label="Bank name"
              disabled={isDisabled}
            />
            <AppTextField
              name="bankDetails.accountName"
              label="Account name"
              disabled={isDisabled}
            />
          </div>
          <AppTextField
            name="bankDetails.iban"
            label="IBAN"
            disabled={isDisabled}
          />
        </AdminCard>
      ) : null}
    </FormShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Social                                                                      */
/* -------------------------------------------------------------------------- */

export function SocialTab({ initial, onSave, canWrite, isSaving, topError }) {
  const defaults = useMemo(
    () => ({
      instagram: initial?.instagram || '',
      pinterest: initial?.pinterest || '',
      facebook: initial?.facebook || '',
      tiktok: initial?.tiktok || '',
    }),
    [initial],
  );

  const methods = useGroupForm(socialSchema, defaults);
  const isDisabled = !canWrite;

  return (
    <FormShell
      methods={methods}
      onSubmit={onSave}
      topError={topError}
      canWrite={canWrite}
      isSaving={isSaving}
    >
      <AdminCard eyebrow="Profiles" title="Social links">
        <AppTextField
          name="instagram"
          label="Instagram URL"
          placeholder="https://instagram.com/…"
          disabled={isDisabled}
        />
        <AppTextField
          name="pinterest"
          label="Pinterest URL"
          placeholder="https://pinterest.com/…"
          disabled={isDisabled}
        />
        <AppTextField
          name="facebook"
          label="Facebook URL"
          placeholder="https://facebook.com/…"
          disabled={isDisabled}
        />
        <AppTextField
          name="tiktok"
          label="TikTok URL"
          placeholder="https://tiktok.com/@…"
          disabled={isDisabled}
        />
      </AdminCard>
    </FormShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Emails                                                                      */
/* -------------------------------------------------------------------------- */

export function EmailsTab({ initial, onSave, canWrite, isSaving, topError }) {
  const defaults = useMemo(
    () => ({
      welcome: initial?.welcome || '',
      orderConfirmation: initial?.orderConfirmation || '',
      shipped: initial?.shipped || initial?.shipping || '',
      refund: initial?.refund || '',
    }),
    [initial],
  );

  const methods = useGroupForm(emailsSchema, defaults);
  const isDisabled = !canWrite;

  return (
    <FormShell
      methods={methods}
      onSubmit={onSave}
      topError={topError}
      canWrite={canWrite}
      isSaving={isSaving}
    >
      <AdminCard eyebrow="Templates" title="Transactional copy">
        <p className={styles.helpText}>
          Plain-text copy used as the body of transactional emails. Future
          releases will support full templates with merge tags.
        </p>
        <AppTextField
          name="welcome"
          label="Welcome email"
          multiline
          minRows={3}
          disabled={isDisabled}
        />
        <AppTextField
          name="orderConfirmation"
          label="Order confirmation"
          multiline
          minRows={3}
          disabled={isDisabled}
        />
        <AppTextField
          name="shipped"
          label="Order shipped"
          multiline
          minRows={3}
          disabled={isDisabled}
        />
        <AppTextField
          name="refund"
          label="Refund issued"
          multiline
          minRows={3}
          disabled={isDisabled}
        />
      </AdminCard>
    </FormShell>
  );
}
