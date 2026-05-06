import * as yup from 'yup';

import {
  emailField,
  phoneField,
  priceField,
  urlField,
} from '../../../utils/validators.js';

const optionalUrl = () =>
  urlField({ required: false, label: 'URL' })
    .transform((v) => (v === '' ? undefined : v))
    .nullable();

const requiredUrl = () => urlField({ required: true, label: 'URL' });

const requiredEmail = () => emailField();

export const generalSchema = yup.object({
  storeName: yup
    .string()
    .trim()
    .required('Please enter the store name.')
    .max(80, 'Please keep the store name under 80 characters.'),
  supportEmail: emailField({ label: 'support email' }),
  supportPhone: phoneField({ required: false, label: 'support phone' }).nullable(),
  currency: yup.string().oneOf(['AED']).required(),
  language: yup.string().oneOf(['en']).required(),
  address: yup
    .string()
    .max(500, 'Please keep the address under 500 characters.')
    .nullable(),
  openingHours: yup
    .string()
    .max(500, 'Please keep opening hours under 500 characters.')
    .nullable(),
  mapEmbedUrl: optionalUrl(),
});

export const brandingSchema = yup.object({
  logoText: yup
    .string()
    .trim()
    .required('Please enter the logo wordmark.')
    .max(40, 'Please keep the wordmark under 40 characters.'),
  faviconUrl: optionalUrl(),
  accentColor: yup.string().required(),
  ogImageUrl: optionalUrl(),
});

export const homepageSchema = yup.object({
  heroTitle: yup
    .string()
    .trim()
    .required('Please enter the hero title.')
    .max(120, 'Please keep the hero title under 120 characters.'),
  heroSubtitle: yup
    .string()
    .trim()
    .max(280, 'Please keep the hero subtitle under 280 characters.')
    .nullable(),
  heroCta: yup
    .string()
    .trim()
    .max(40, 'Please keep the call-to-action under 40 characters.')
    .nullable(),
  heroImage: optionalUrl(),
  featuredCategoryIds: yup.array().of(yup.number()).default([]),
  featuredProductIds: yup.array().of(yup.number()).default([]),
});

export const announcementSchema = yup.object({
  isActive: yup.boolean().required(),
  text: yup
    .string()
    .trim()
    .max(180, 'Please keep the announcement under 180 characters.')
    .nullable(),
  link: yup
    .string()
    .trim()
    .transform((v) => (v === '' ? undefined : v))
    .test('link', 'Please enter a valid URL or a path starting with /.', (v) => {
      if (!v) return true;
      if (v.startsWith('/')) return true;
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    })
    .nullable(),
  dismissible: yup.boolean().required(),
});

export const paymentSchema = yup.object({
  cardEnabled: yup.boolean().required(),
  codEnabled: yup.boolean().required(),
  bankTransferEnabled: yup.boolean().required(),
  codFee: priceField({ required: false, label: 'COD fee' })
    .transform((v, orig) => (orig === '' || orig == null ? undefined : v))
    .nullable(),
  bankDetails: yup.object({
    bankName: yup
      .string()
      .trim()
      .max(80, 'Please keep the bank name under 80 characters.')
      .nullable(),
    accountName: yup
      .string()
      .trim()
      .max(80, 'Please keep the account name under 80 characters.')
      .nullable(),
    iban: yup
      .string()
      .trim()
      .max(64, 'Please keep the IBAN under 64 characters.')
      .nullable(),
  }),
});

export const socialSchema = yup.object({
  instagram: optionalUrl(),
  pinterest: optionalUrl(),
  facebook: optionalUrl(),
  tiktok: optionalUrl(),
});

export const emailsSchema = yup.object({
  welcome: yup.string().trim().max(2000).nullable(),
  orderConfirmation: yup.string().trim().max(2000).nullable(),
  shipped: yup.string().trim().max(2000).nullable(),
  refund: yup.string().trim().max(2000).nullable(),
});

export { requiredUrl, requiredEmail };
