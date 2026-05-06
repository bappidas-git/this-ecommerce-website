import * as yup from 'yup';

const optionalUrl = () =>
  yup
    .string()
    .trim()
    .transform((v) => (v === '' ? undefined : v))
    .url('Enter a valid URL')
    .nullable();

const requiredUrl = () =>
  yup.string().trim().url('Enter a valid URL').required('Required');

const requiredEmail = () =>
  yup.string().trim().email('Enter a valid email').required('Required');

export const generalSchema = yup.object({
  storeName: yup.string().trim().required('Store name is required').max(80),
  supportEmail: requiredEmail(),
  supportPhone: yup.string().trim().max(40).nullable(),
  currency: yup.string().oneOf(['AED']).required(),
  language: yup.string().oneOf(['en']).required(),
  address: yup.string().max(500).nullable(),
  openingHours: yup.string().max(500).nullable(),
  mapEmbedUrl: optionalUrl(),
});

export const brandingSchema = yup.object({
  logoText: yup.string().trim().required('Logo wordmark is required').max(40),
  faviconUrl: optionalUrl(),
  accentColor: yup.string().required(),
  ogImageUrl: optionalUrl(),
});

export const homepageSchema = yup.object({
  heroTitle: yup.string().trim().required('Hero title is required').max(120),
  heroSubtitle: yup.string().trim().max(280).nullable(),
  heroCta: yup.string().trim().max(40).nullable(),
  heroImage: optionalUrl(),
  featuredCategoryIds: yup.array().of(yup.number()).default([]),
  featuredProductIds: yup.array().of(yup.number()).default([]),
});

export const announcementSchema = yup.object({
  isActive: yup.boolean().required(),
  text: yup.string().trim().max(180).nullable(),
  link: yup
    .string()
    .trim()
    .transform((v) => (v === '' ? undefined : v))
    .test('link', 'Enter a valid URL or path starting with /', (v) => {
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
  codFee: yup
    .number()
    .transform((v, orig) => (orig === '' || orig == null ? undefined : v))
    .min(0, 'Must be 0 or greater')
    .nullable(),
  bankDetails: yup.object({
    bankName: yup.string().trim().max(80).nullable(),
    accountName: yup.string().trim().max(80).nullable(),
    iban: yup.string().trim().max(64).nullable(),
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
