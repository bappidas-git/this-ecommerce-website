import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';

import styles from './AddressForm.module.css';

export const EMIRATE_OPTIONS = [
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Sharjah', label: 'Sharjah' },
  { value: 'Ajman', label: 'Ajman' },
  { value: 'Umm Al Quwain', label: 'Umm Al Quwain' },
  { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
  { value: 'Fujairah', label: 'Fujairah' },
];

export const COUNTRY_OPTIONS = [
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia', disabled: true },
  { value: 'QA', label: 'Qatar', disabled: true },
  { value: 'KW', label: 'Kuwait', disabled: true },
  { value: 'OM', label: 'Oman', disabled: true },
  { value: 'BH', label: 'Bahrain', disabled: true },
];

const FIELD_ORDER = [
  'label',
  'firstName',
  'lastName',
  'phone',
  'line1',
  'line2',
  'city',
  'emirate',
  'country',
  'isDefault',
];

const PHONE_REGEX = /^\+?[0-9\s\-()]{6,20}$/;

const schema = yup
  .object({
    label: yup
      .string()
      .trim()
      .required('Give this address a label, e.g. "Home" or "Office".')
      .max(40, 'Keep the label under 40 characters.'),
    firstName: yup
      .string()
      .trim()
      .required('Please enter a first name.')
      .max(50, 'Keep first name under 50 characters.'),
    lastName: yup
      .string()
      .trim()
      .required('Please enter a last name.')
      .max(50, 'Keep last name under 50 characters.'),
    phone: yup
      .string()
      .trim()
      .required('Phone number is required.')
      .matches(PHONE_REGEX, 'Enter a valid international number.'),
    line1: yup
      .string()
      .trim()
      .required('Please enter the street address.')
      .max(120, 'Keep the address under 120 characters.'),
    line2: yup
      .string()
      .trim()
      .max(120, 'Keep the address under 120 characters.'),
    city: yup.string().trim().required('City is required.'),
    emirate: yup
      .string()
      .required('Please choose an emirate.')
      .oneOf(EMIRATE_OPTIONS.map((o) => o.value), 'Please choose an emirate.'),
    country: yup
      .string()
      .required()
      .oneOf(['AE'], 'Only United Arab Emirates is supported right now.'),
    isDefault: yup.boolean().default(false),
  })
  .required();

const buildDefaults = (initial) => ({
  label: initial?.label || '',
  firstName: initial?.firstName || '',
  lastName: initial?.lastName || '',
  phone: initial?.phone || '+971 ',
  line1: initial?.line1 || '',
  line2: initial?.line2 || '',
  city: initial?.city || '',
  emirate: initial?.emirate || '',
  country: initial?.country || 'AE',
  isDefault: Boolean(initial?.isDefault),
});

function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save address',
  lockDefault = false,
}) {
  const defaultValues = useMemo(() => buildDefaults(initial), [initial]);

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isSubmitting, errors, submitCount },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!submitCount) return;
    const first = FIELD_ORDER.find((name) => errors[name]);
    if (first) setFocus(first);
  }, [errors, setFocus, submitCount]);

  const submit = handleSubmit(async (values) => {
    const payload = {
      label: values.label.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      line1: values.line1.trim(),
      line2: values.line2 ? values.line2.trim() : '',
      city: values.city.trim(),
      emirate: values.emirate,
      country: values.country,
      isDefault: Boolean(values.isDefault),
    };
    try {
      await onSubmit?.(payload);
    } catch (err) {
      const fieldErrors = err?.errors;
      let mapped = false;
      if (fieldErrors && typeof fieldErrors === 'object') {
        for (const key of Object.keys(fieldErrors)) {
          if (!FIELD_ORDER.includes(key)) continue;
          const raw = fieldErrors[key];
          const message = Array.isArray(raw) ? raw[0] : raw;
          if (!message) continue;
          setError(
            key,
            { type: 'server', message: String(message) },
            { shouldFocus: !mapped },
          );
          mapped = true;
        }
      }
      if (!mapped) throw err;
    }
  });

  return (
    <FormProvider {...methods}>
      <form
        id="address-form"
        className={styles.form}
        noValidate
        onSubmit={submit}
      >
        <AppTextField
          name="label"
          label="Label"
          placeholder="Home, Office, Studio…"
          autoComplete="off"
          required
        />

        <div className={styles.row2}>
          <AppTextField
            name="firstName"
            label="First name"
            autoComplete="given-name"
            required
          />
          <AppTextField
            name="lastName"
            label="Last name"
            autoComplete="family-name"
            required
          />
        </div>

        <AppTextField
          name="phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+971 50 000 0000"
        />

        <AppTextField
          name="line1"
          label="Address line 1"
          autoComplete="address-line1"
          required
          placeholder="Villa / building, street"
        />
        <AppTextField
          name="line2"
          label="Address line 2"
          autoComplete="address-line2"
          optional
          placeholder="Area, landmark"
        />

        <div className={styles.row2}>
          <AppTextField
            name="city"
            label="City"
            autoComplete="address-level2"
            required
          />
          <AppSelect
            name="emirate"
            label="Emirate"
            options={EMIRATE_OPTIONS}
            required
            placeholder="Select an emirate"
          />
        </div>

        <AppSelect
          name="country"
          label="Country"
          options={COUNTRY_OPTIONS}
          disabled
          helperText="Shipping is currently limited to the UAE."
        />

        <AppCheckbox
          name="isDefault"
          label="Set as default delivery address"
          disabled={lockDefault}
          description={
            lockDefault
              ? 'This is your only address, so it must remain default.'
              : undefined
          }
        />

        <div className={styles.actions}>
          {onCancel ? (
            <AppButton variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </AppButton>
          ) : null}
          <AppButton type="submit" variant="primary" loading={isSubmitting}>
            {submitLabel}
          </AppButton>
        </div>
      </form>
    </FormProvider>
  );
}

export default AddressForm;
