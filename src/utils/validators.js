/**
 * Shared yup validators for THIS Interiors forms.
 *
 * Convention for every form in this codebase:
 *  1. Compose the form's yup schema from the field builders below where the
 *     field type matches one of the shared kinds (email, password, name,
 *     phone, url, slug, price, quantity, address, credit card, coupon code).
 *     Only define a custom rule inline when no shared validator fits.
 *  2. Wrap the submit catch block with `useApiFormError(formMethods)` so
 *     server-side errors are mapped to the matching fields, the first
 *     invalid field is focused, and any top-level message reaches the
 *     toast `error` channel.
 *  3. Call `useFocusFirstInvalid(formMethods)` once in the component so the
 *     first invalid field is focused on every submit failure.
 *  4. Mark non-required inputs with the `optional` prop on `<AppTextField />`
 *     so the "(optional)" tag is shown consistently.
 *  5. Error copy stays calm, sentence-cased, and never uses exclamation
 *     marks. Prefer "Please …" or descriptive nouns.
 *
 * All builders are functions so callers can extend, label, or relax them
 * (`emailField({ required: false })`, `priceField().max(99999)`, etc.) without
 * mutating shared state.
 */

import * as yup from 'yup';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Permissive international phone matcher: allows leading +, spaces, dashes,
// parentheses, and 7-15 digits in total (libphonenumber-style without the
// dependency).
const PHONE_PATTERN = /^\+?[0-9 ()\-.]{7,20}$/;
const PHONE_DIGITS = /\d{7,15}/;
const URL_PATTERN = /^https?:\/\/[^\s]+\.[^\s]+$/i;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COUPON_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;
// Credit card: 13-19 digits with optional spaces.
const CARD_NUMBER_PATTERN = /^[0-9 ]{13,23}$/;
const CARD_EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\s*\/\s*([0-9]{2}|[0-9]{4})$/;
const CARD_CVV_PATTERN = /^[0-9]{3,4}$/;

function applyRequired(schema, required, message) {
  return required ? schema.required(message) : schema.optional();
}

export function emailField({ required = true, label = 'email' } = {}) {
  let schema = yup
    .string()
    .trim()
    .matches(EMAIL_PATTERN, `That ${label} doesn't look right.`)
    .max(254, `Please keep your ${label} under 254 characters.`);
  schema = applyRequired(schema, required, `Please enter your ${label}.`);
  return schema;
}

export function passwordField({
  required = true,
  label = 'password',
  min = 8,
} = {}) {
  let schema = yup
    .string()
    .min(min, `Use at least ${min} characters.`)
    .matches(/[a-z]/, 'Add a lowercase letter.')
    .matches(/[A-Z]/, 'Add an uppercase letter.')
    .matches(/\d/, 'Add a number.');
  schema = applyRequired(schema, required, `Please choose a ${label}.`);
  return schema;
}

export function nameField({
  required = true,
  label = 'name',
  min = 1,
  max = 80,
} = {}) {
  let schema = yup
    .string()
    .trim()
    .min(min, `Please enter your ${label}.`)
    .max(max, `Please keep ${label} under ${max} characters.`);
  schema = applyRequired(schema, required, `Please enter your ${label}.`);
  return schema;
}

export function phoneField({ required = true, label = 'phone number' } = {}) {
  let schema = yup
    .string()
    .trim()
    .test('phone-shape', `That ${label} doesn't look right.`, (value) => {
      if (!value) return true;
      if (!PHONE_PATTERN.test(value)) return false;
      const digits = value.replace(/[^0-9]/g, '');
      return PHONE_DIGITS.test(digits);
    });
  schema = applyRequired(schema, required, `Please enter your ${label}.`);
  return schema;
}

export function urlField({ required = false, label = 'URL' } = {}) {
  let schema = yup
    .string()
    .trim()
    .test('url-shape', `Please enter a valid ${label}.`, (value) => {
      if (!value) return true;
      return URL_PATTERN.test(value);
    });
  schema = applyRequired(schema, required, `Please enter a ${label}.`);
  return schema;
}

export function slugField({ required = true, max = 140 } = {}) {
  let schema = yup
    .string()
    .trim()
    .matches(SLUG_PATTERN, 'Use lowercase letters, numbers, and hyphens.')
    .max(max, 'That slug is a little long.');
  schema = applyRequired(schema, required, 'Please enter a slug.');
  return schema;
}

export function priceField({
  required = true,
  label = 'price',
  min = 0,
  max,
} = {}) {
  let schema = yup
    .number()
    .typeError(`Please enter a number for ${label}.`)
    .min(min, `${capitalize(label)} cannot be below ${min}.`);
  if (typeof max === 'number') {
    schema = schema.max(max, `${capitalize(label)} cannot exceed ${max}.`);
  }
  schema = applyRequired(schema, required, `Please enter a ${label}.`);
  return schema;
}

export function quantityField({
  required = true,
  label = 'quantity',
  min = 0,
  max,
} = {}) {
  let schema = yup
    .number()
    .typeError(`Please enter a whole number for ${label}.`)
    .integer(`${capitalize(label)} must be a whole number.`)
    .min(min, `${capitalize(label)} cannot be below ${min}.`);
  if (typeof max === 'number') {
    schema = schema.max(max, `${capitalize(label)} cannot exceed ${max}.`);
  }
  schema = applyRequired(schema, required, `Please enter a ${label}.`);
  return schema;
}

export function couponCodeField({ required = true } = {}) {
  let schema = yup
    .string()
    .trim()
    .transform((value) => (typeof value === 'string' ? value.toUpperCase() : value))
    .matches(COUPON_PATTERN, 'Use letters, numbers, dashes, or underscores.');
  schema = applyRequired(schema, required, 'Please enter a coupon code.');
  return schema;
}

export function addressFieldsObject({
  requireLine2 = false,
  requirePhone = true,
} = {}) {
  return {
    firstName: nameField({ label: 'first name', max: 50 }),
    lastName: nameField({ label: 'last name', max: 50 }),
    phone: phoneField({ required: requirePhone, label: 'phone' }),
    line1: yup
      .string()
      .trim()
      .required('Please enter a street address.')
      .max(160, 'Please keep the address under 160 characters.'),
    line2: requireLine2
      ? yup
          .string()
          .trim()
          .required('Please enter the second line.')
          .max(160, 'Please keep the address under 160 characters.')
      : yup
          .string()
          .trim()
          .max(160, 'Please keep the address under 160 characters.')
          .optional(),
    city: yup
      .string()
      .trim()
      .required('Please enter a city.')
      .max(80, 'Please keep the city under 80 characters.'),
    emirate: yup
      .string()
      .trim()
      .required('Please choose an emirate.')
      .max(80, 'Please keep the emirate under 80 characters.'),
    country: yup
      .string()
      .trim()
      .required('Please choose a country.')
      .max(80, 'Please keep the country under 80 characters.'),
  };
}

export function creditCardFieldsObject() {
  return {
    cardNumber: yup
      .string()
      .trim()
      .required('Please enter your card number.')
      .matches(CARD_NUMBER_PATTERN, "That card number doesn't look right."),
    cardName: nameField({ label: 'name on card', max: 80 }),
    expiry: yup
      .string()
      .trim()
      .required('Please enter the expiry date.')
      .matches(CARD_EXPIRY_PATTERN, 'Use the MM/YY format.'),
    cvv: yup
      .string()
      .trim()
      .required('Please enter the security code.')
      .matches(CARD_CVV_PATTERN, 'The security code is 3 or 4 digits.'),
  };
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const PATTERNS = {
  EMAIL: EMAIL_PATTERN,
  PHONE: PHONE_PATTERN,
  URL: URL_PATTERN,
  SLUG: SLUG_PATTERN,
  COUPON: COUPON_PATTERN,
  CARD_NUMBER: CARD_NUMBER_PATTERN,
  CARD_EXPIRY: CARD_EXPIRY_PATTERN,
  CARD_CVV: CARD_CVV_PATTERN,
};
