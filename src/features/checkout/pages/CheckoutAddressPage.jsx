import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AddressForm, {
  AddressFormFields,
  ADDRESS_FIELD_ORDER,
  addressSchema,
  buildAddressDefaults,
  normaliseAddressPayload,
} from '../../account/components/AddressForm.jsx';

import AddressRadioCard from '../components/AddressRadioCard.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import Loader from '../../../components/common/Loader/Loader.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { useCheckout } from '../../../context/CheckoutContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import addressService from '../../../api/services/addressService.js';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './CheckoutAddressPage.module.css';

const PHONE_REGEX = /^\+?[0-9\s\-()]{6,20}$/;

const NEW_ADDRESS_VALUE = 'new';

const guestExtras = {
  contactEmail: yup
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .required('Email is required.'),
  contactPhone: yup
    .string()
    .trim()
    .required('Phone number is required.')
    .matches(PHONE_REGEX, 'Enter a valid international number.'),
  saveContact: yup.boolean().default(true),
};

const memberExtras = {
  saveAddress: yup.boolean().default(true),
};

const guestShippingSchema = addressSchema
  .shape(guestExtras)
  // For guests we don't ask for a label — give it a sensible default.
  .shape({
    label: yup.string().trim().default('Shipping').max(40),
  });

const memberShippingSchema = addressSchema
  .shape(memberExtras)
  .shape({
    label: yup.string().trim().required('Give this address a label.').max(40),
  });

function buildShippingDefaults({ initialAddress, isGuest, contact }) {
  const defaults = buildAddressDefaults(initialAddress);
  if (isGuest) {
    return {
      ...defaults,
      label: defaults.label || 'Shipping',
      contactEmail: contact?.email || '',
      contactPhone: contact?.phone || defaults.phone || '+971 ',
      saveContact: contact?.saveContact ?? true,
    };
  }
  return {
    ...defaults,
    saveAddress: true,
  };
}

function CheckoutAddressPage() {
  const { isAuthenticated } = useAuth();
  const checkout = useCheckout();
  const toast = useToast();
  const isGuest = !isAuthenticated;

  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editError, setEditError] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------- Shipping form (also holds guest contact + save toggle)
  const shippingDefaults = useMemo(
    () =>
      buildShippingDefaults({
        initialAddress: checkout.address,
        isGuest,
        contact: isGuest ? checkout.address : null,
      }),
    // Only recompute when the auth flow flips; per-keystroke updates would reset the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGuest],
  );

  const shippingForm = useForm({
    resolver: yupResolver(isGuest ? guestShippingSchema : memberShippingSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: shippingDefaults,
  });

  // -------------- Billing form (separate, only relevant when toggle is off)
  const billingDefaults = useMemo(
    () => buildAddressDefaults(checkout.billingAddress || null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const billingForm = useForm({
    resolver: yupResolver(addressSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { ...billingDefaults, label: billingDefaults.label || 'Billing' },
  });

  const [billingSame, setBillingSame] = useState(checkout.billingSameAsShipping);

  useEffect(() => {
    setBillingSame(checkout.billingSameAsShipping);
  }, [checkout.billingSameAsShipping]);

  // -------------- Load saved addresses (logged-in only)
  const refreshAddresses = useCallback(async () => {
    if (isGuest) return;
    setIsLoadingAddresses(true);
    try {
      const result = await addressService.list();
      const items = Array.isArray(result?.items) ? result.items : [];
      setAddresses(items);
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err) || 'Could not load addresses.');
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [isGuest]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  // Pre-select default / restored address once addresses load.
  const hydratedSelectionRef = useRef(false);
  useEffect(() => {
    if (isGuest || hydratedSelectionRef.current || addresses.length === 0) return;
    hydratedSelectionRef.current = true;
    if (checkout.address?.id) {
      const match = addresses.find((a) => a.id === checkout.address.id);
      if (match) {
        setSelectedId(match.id);
        return;
      }
    }
    const def = addresses.find((a) => a.isDefault);
    if (def) {
      setSelectedId(def.id);
    } else {
      setSelectedId(addresses[0].id);
    }
  }, [addresses, checkout.address, isGuest]);

  // Live-sync checkout context when shipping fields validate.
  const shippingWatched = useWatch({ control: shippingForm.control });
  const lastSyncedRef = useRef('');
  useEffect(() => {
    if (isSubmitting) return;
    // Only push to context when a new-address form is in play (not a saved selection).
    const usingNew = isGuest || selectedId === NEW_ADDRESS_VALUE || selectedId === null;
    if (!usingNew) return;
    if (!shippingForm.formState.isValid) return;
    const payload = normaliseAddressPayload(shippingWatched);
    if (isGuest) {
      payload.email = (shippingWatched.contactEmail || '').trim();
      payload.phone = (shippingWatched.contactPhone || payload.phone || '').trim();
    }
    const stamp = JSON.stringify(payload);
    if (stamp === lastSyncedRef.current) return;
    lastSyncedRef.current = stamp;
    checkout.setAddress(payload);
    if (billingSame) checkout.setBillingAddress(null);
  }, [
    shippingWatched,
    shippingForm.formState.isValid,
    isGuest,
    selectedId,
    billingSame,
    isSubmitting,
    checkout,
  ]);

  // -------------- Saved address Edit dialog
  const openEditDialog = (address) => {
    setEditError(null);
    setEditingAddress(address);
  };

  const closeEditDialog = () => {
    if (isSavingEdit) return;
    setEditingAddress(null);
    setEditError(null);
  };

  const handleEditSubmit = useCallback(
    async (payload) => {
      if (!editingAddress) return;
      setIsSavingEdit(true);
      setEditError(null);
      try {
        await addressService.update(editingAddress.id, payload);
        await refreshAddresses();
        toast.success('Address updated.');
        setEditingAddress(null);
      } catch (err) {
        setEditError(getApiErrorMessage(err) || 'Could not save changes.');
        if (err?.errors) throw err;
      } finally {
        setIsSavingEdit(false);
      }
    },
    [editingAddress, refreshAddresses, toast],
  );

  // -------------- Continue handler
  const focusFirstError = useCallback(
    (errors, prefix = '') => {
      const first = ADDRESS_FIELD_ORDER.find((name) => errors[name]);
      if (first) {
        const id = `${prefix}${first}`;
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
    [],
  );

  const handleContinue = useCallback(async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // 1) Shipping address selection / submission
      let shippingPayload = null;
      const useSaved = !isGuest && selectedId && selectedId !== NEW_ADDRESS_VALUE;

      if (useSaved) {
        const saved = addresses.find((a) => a.id === selectedId);
        if (!saved) {
          setSubmitError('Please choose an address to continue.');
          return;
        }
        shippingPayload = { ...saved };
      } else {
        const valid = await shippingForm.trigger(undefined, { shouldFocus: true });
        if (!valid) {
          focusFirstError(shippingForm.formState.errors);
          shippingForm.handleSubmit(() => {})();
          return;
        }
        const values = shippingForm.getValues();
        shippingPayload = normaliseAddressPayload(values);
        if (isGuest) {
          shippingPayload.email = (values.contactEmail || '').trim();
          shippingPayload.phone = (values.contactPhone || shippingPayload.phone || '').trim();
        }

        if (!isGuest && values.saveAddress) {
          try {
            const created = await addressService.create(shippingPayload);
            if (created?.id) {
              shippingPayload = { ...created };
            }
            await refreshAddresses();
          } catch (err) {
            setSubmitError(
              getApiErrorMessage(err) || 'Could not save your address. Please try again.',
            );
            return;
          }
        }
      }

      // 2) Billing
      let billingPayload = null;
      if (!billingSame) {
        const valid = await billingForm.trigger(undefined, { shouldFocus: true });
        if (!valid) {
          focusFirstError(billingForm.formState.errors, 'billing-');
          billingForm.handleSubmit(() => {})();
          return;
        }
        const values = billingForm.getValues();
        billingPayload = normaliseAddressPayload(values);
      }

      // 3) Persist + advance
      checkout.setAddress(shippingPayload);
      checkout.setBillingSameAsShipping(billingSame);
      checkout.setBillingAddress(billingSame ? null : billingPayload);
      checkout.goNext();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    addresses,
    billingForm,
    billingSame,
    checkout,
    focusFirstError,
    isGuest,
    refreshAddresses,
    selectedId,
    shippingForm,
  ]);

  const showInlineForm =
    isGuest || selectedId === NEW_ADDRESS_VALUE || (!isLoadingAddresses && addresses.length === 0);

  return (
    <>
      <Seo title="Checkout — Address | THIS Interiors" noindex />

      <div className={styles.page}>
        <header className={styles.sectionHeader}>
          <span className={styles.kicker}>Where should we send your pieces?</span>
          <h1 className={styles.title}>Delivery details</h1>
        </header>

        {submitError ? (
          <div className={styles.errorBanner} role="alert">
            {submitError}
          </div>
        ) : null}

        {/* Guest contact card */}
        {isGuest ? (
          <FormProvider {...shippingForm}>
            <section className={styles.section} aria-labelledby="contact-heading">
              <div className={styles.sectionHeader}>
                <h2 id="contact-heading" className={styles.subhead}>
                  Contact
                </h2>
                <p className={styles.subtitle}>
                  We&apos;ll send order updates here.
                </p>
              </div>
              <div className={styles.contactCard}>
                <AppTextField
                  name="contactEmail"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  id="contactEmail"
                />
                <AppTextField
                  name="contactPhone"
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="+971 50 000 0000"
                  id="contactPhone"
                />
                <AppCheckbox
                  name="saveContact"
                  label="Save my information for next time"
                  description="We'll offer to create an account after checkout — no commitment now."
                />
              </div>
            </section>
          </FormProvider>
        ) : null}

        {/* Shipping address */}
        <section className={styles.section} aria-labelledby="shipping-heading">
          <div className={styles.sectionHeader}>
            <h2 id="shipping-heading" className={styles.subhead}>
              {isGuest ? 'Shipping address' : 'Choose a delivery address'}
            </h2>
            {!isGuest ? (
              <p className={styles.subtitle}>
                Pick a saved address or add a new one.
              </p>
            ) : null}
          </div>

          {!isGuest ? (
            isLoadingAddresses ? (
              <div className={styles.loaderWrap}>
                <Loader label="Loading saved addresses…" />
              </div>
            ) : loadError ? (
              <div className={styles.errorBanner} role="alert">
                {loadError}
              </div>
            ) : (
              <ul className={styles.savedList}>
                {addresses.map((address) => (
                  <li key={address.id}>
                    <AddressRadioCard
                      name="shipping-address"
                      value={String(address.id)}
                      address={address}
                      selected={selectedId === address.id}
                      onSelect={() => setSelectedId(address.id)}
                      onEdit={openEditDialog}
                    />
                  </li>
                ))}
                <li>
                  <AddressRadioCard
                    name="shipping-address"
                    value={NEW_ADDRESS_VALUE}
                    variant="add"
                    addLabel="Use a new address"
                    addHint="We'll deliver to a new address this time."
                    selected={selectedId === NEW_ADDRESS_VALUE}
                    onSelect={() => setSelectedId(NEW_ADDRESS_VALUE)}
                  />
                </li>
              </ul>
            )
          ) : null}

          {showInlineForm ? (
            <FormProvider {...shippingForm}>
              <div className={styles.newAddressBlock}>
                <form
                  id="checkout-shipping-form"
                  className={styles.formGrid}
                  noValidate
                  onSubmit={(e) => e.preventDefault()}
                >
                  <AddressFormFields
                    hideDefaultToggle
                    hideLabel={isGuest}
                    fieldIdPrefix=""
                  />
                  {!isGuest ? (
                    <AppCheckbox
                      name="saveAddress"
                      label="Save this address for next time"
                      description="We'll add it to your account so checkout is faster next time."
                    />
                  ) : null}
                </form>
              </div>
            </FormProvider>
          ) : null}
        </section>

        {/* Billing */}
        <section className={styles.section} aria-labelledby="billing-heading">
          <div className={styles.sectionHeader}>
            <h2 id="billing-heading" className={styles.subhead}>
              Billing address
            </h2>
          </div>
          <div className={styles.billingToggle}>
            <AppCheckbox
              checked={billingSame}
              onChange={(e) => setBillingSame(e.target.checked)}
              label="Billing address same as shipping"
            />
          </div>

          {!billingSame ? (
            <FormProvider {...billingForm}>
              <div className={styles.newAddressBlock}>
                <form
                  id="checkout-billing-form"
                  className={styles.formGrid}
                  noValidate
                  onSubmit={(e) => e.preventDefault()}
                >
                  <AddressFormFields
                    hideDefaultToggle
                    hideLabel
                    fieldIdPrefix="billing-"
                  />
                </form>
              </div>
            </FormProvider>
          ) : null}
        </section>

        <div className={styles.footer}>
          <AppButton
            variant="ghost"
            to={PATHS.cart}
            className={styles.ghostBtn}
          >
            Back to bag
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleContinue}
            loading={isSubmitting}
            className={styles.primaryBtn}
          >
            Continue to payment
          </AppButton>
        </div>
      </div>

      <AppDialog
        open={Boolean(editingAddress)}
        onClose={closeEditDialog}
        size="md"
        title="Edit address"
        description="Update the details below — used at checkout."
      >
        {editingAddress ? (
          <>
            {editError ? (
              <div className={styles.errorBanner} role="alert">
                {editError}
              </div>
            ) : null}
            <AddressForm
              initial={editingAddress}
              submitLabel="Save changes"
              onSubmit={handleEditSubmit}
              onCancel={closeEditDialog}
            />
          </>
        ) : null}
      </AppDialog>
    </>
  );
}

export default CheckoutAddressPage;
