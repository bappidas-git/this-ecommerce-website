import * as yup from 'yup';

import { priceField, quantityField } from '../../../utils/validators.js';

export const COUPON_CODE_RE = /^[A-Z0-9]{3,20}$/;

export const couponEmptyDefaults = {
  code: '',
  type: 'percent',
  value: 10,
  minSubtotal: 0,
  maxRedemptions: '',
  startsAt: '',
  endsAt: '',
  appliesTo: 'all',
  targetIds: [],
  isActive: true,
};

export const couponSchema = yup.object({
  code: yup
    .string()
    .trim()
    .transform((v) => (v ? String(v).toUpperCase() : v))
    .required('Please enter a code.')
    .matches(COUPON_CODE_RE, 'Use 3 to 20 uppercase letters or digits.'),
  type: yup
    .string()
    .oneOf(['percent', 'fixed'], 'Please choose a discount type.')
    .required('Please choose a discount type.'),
  value: yup
    .number()
    .typeError('Please enter a value.')
    .required('Please enter a value.')
    .when('type', {
      is: 'percent',
      then: (s) =>
        s
          .min(1, 'Percent must be between 1 and 100.')
          .max(100, 'Percent must be between 1 and 100.'),
      otherwise: (s) => s.min(1, 'Fixed amount must be at least 1 AED.'),
    }),
  minSubtotal: priceField({ required: false, label: 'minimum subtotal' })
    .transform((v, o) => (o === '' || o == null ? 0 : v))
    .default(0),
  maxRedemptions: quantityField({ required: false, label: 'max redemptions', min: 1 })
    .transform((v, o) => (o === '' || o == null ? null : v))
    .nullable(),
  startsAt: yup
    .string()
    .required('Please choose a start date.')
    .test('valid-date', 'Please enter a valid date.', (v) =>
      v ? !Number.isNaN(Date.parse(v)) : false,
    ),
  endsAt: yup
    .string()
    .required('Please choose an end date.')
    .test('valid-date', 'Please enter a valid date.', (v) =>
      v ? !Number.isNaN(Date.parse(v)) : false,
    )
    .test(
      'after-start',
      'The end date must be after the start date.',
      function (value) {
        const { startsAt } = this.parent;
        if (!value || !startsAt) return true;
        return Date.parse(value) > Date.parse(startsAt);
      },
    ),
  appliesTo: yup
    .string()
    .oneOf(['all', 'categories', 'products'])
    .required(),
  targetIds: yup
    .array()
    .of(yup.number())
    .when('appliesTo', {
      is: (v) => v === 'categories' || v === 'products',
      then: (s) => s.min(1, 'Please select at least one target.'),
      otherwise: (s) => s.transform(() => []),
    }),
  isActive: yup.boolean().default(true),
});

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateCouponCode(length = 8) {
  let code = '';
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const buf = new Uint32Array(length);
    window.crypto.getRandomValues(buf);
    for (let i = 0; i < length; i++) {
      code += ALPHABET[buf[i] % ALPHABET.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }
  return code;
}

const toLocalInputValue = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function couponToFormValues(coupon) {
  if (!coupon) return { ...couponEmptyDefaults };
  return {
    code: coupon.code || '',
    type: coupon.type || 'percent',
    value: coupon.value ?? 10,
    minSubtotal: coupon.minSubtotal ?? 0,
    maxRedemptions:
      coupon.maxRedemptions == null || coupon.maxRedemptions >= 999999
        ? ''
        : coupon.maxRedemptions,
    startsAt: toLocalInputValue(coupon.startsAt),
    endsAt: toLocalInputValue(coupon.endsAt),
    appliesTo: coupon.appliesTo || 'all',
    targetIds: Array.isArray(coupon.targetIds) ? coupon.targetIds : [],
    isActive: coupon.isActive !== false,
  };
}

export function formValuesToPayload(values) {
  const startsAt = values.startsAt
    ? new Date(values.startsAt).toISOString()
    : null;
  const endsAt = values.endsAt ? new Date(values.endsAt).toISOString() : null;
  return {
    code: String(values.code || '').toUpperCase().trim(),
    type: values.type,
    value: Number(values.value),
    minSubtotal: Number(values.minSubtotal) || 0,
    maxRedemptions:
      values.maxRedemptions === '' || values.maxRedemptions == null
        ? null
        : Number(values.maxRedemptions),
    startsAt,
    endsAt,
    appliesTo: values.appliesTo,
    targetIds:
      values.appliesTo === 'all'
        ? []
        : (values.targetIds || []).map((n) => Number(n)),
    isActive: Boolean(values.isActive),
  };
}
