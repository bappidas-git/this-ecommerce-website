import * as yup from 'yup';

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

export const TAX_CLASS_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'reduced', label: 'Reduced' },
  { value: 'zero', label: 'Zero-rated' },
  { value: 'exempt', label: 'Exempt' },
];

export const DEFAULT_ATTRIBUTE_ROWS = [
  { key: 'color', value: '' },
  { key: 'material', value: '' },
  { key: 'dimensions', value: '' },
  { key: 'weight', value: '' },
  { key: 'finish', value: '' },
];

export const DEFAULT_IMAGE_ROWS = [
  {
    url: 'https://placehold.co/600x750/E5DED2/1B1A17?text=THIS+Product+1&font=playfair',
    alt: '',
  },
  {
    url: 'https://placehold.co/600x750/E5DED2/1B1A17?text=THIS+Product+2&font=playfair',
    alt: '',
  },
];

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_PATTERN = /^https?:\/\/.+/i;

export const productSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be 120 characters or fewer'),
  slug: yup
    .string()
    .trim()
    .required('Slug is required')
    .matches(SLUG_PATTERN, 'Use lowercase letters, numbers, and hyphens')
    .max(140, 'Slug is too long'),
  description: yup.string().max(8000, 'Description is too long').default(''),
  tags: yup.array().of(yup.string().trim()).default([]),

  price: yup
    .number()
    .typeError('Price must be a number')
    .min(0, 'Price cannot be negative')
    .required('Price is required'),
  compareAtPrice: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .transform((value, original) =>
      original === '' || original === null || original === undefined ? null : value,
    )
    .test(
      'gte-price',
      'Compare-at price must be greater than or equal to price',
      function (value) {
        if (value === null || value === undefined) return true;
        const { price } = this.parent;
        if (price === null || price === undefined) return true;
        return Number(value) >= Number(price);
      },
    ),
  currency: yup.string().oneOf(['AED']).default('AED'),
  taxClass: yup
    .string()
    .oneOf(TAX_CLASS_OPTIONS.map((o) => o.value))
    .default('standard'),

  images: yup
    .array()
    .of(
      yup.object({
        url: yup
          .string()
          .trim()
          .required('URL is required')
          .matches(URL_PATTERN, 'Must be an http(s) URL'),
        alt: yup.string().max(160, 'Alt text is too long').default(''),
      }),
    )
    .min(1, 'Add at least one image')
    .default([]),

  sku: yup.string().trim().required('SKU is required').max(64, 'SKU is too long'),
  stock: yup
    .number()
    .typeError('Stock must be a number')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
  lowStockThreshold: yup
    .number()
    .typeError('Threshold must be a number')
    .integer('Threshold must be a whole number')
    .min(0, 'Threshold cannot be negative')
    .default(5),
  allowBackorder: yup.boolean().default(false),

  attributes: yup
    .array()
    .of(
      yup.object({
        key: yup.string().trim().max(40, 'Key is too long').default(''),
        value: yup.string().trim().max(240, 'Value is too long').default(''),
      }),
    )
    .default([]),

  seo: yup
    .object({
      metaTitle: yup.string().max(60, 'Keep meta title under 60 characters').default(''),
      metaDescription: yup
        .string()
        .max(160, 'Keep meta description under 160 characters')
        .default(''),
      ogImage: yup
        .string()
        .trim()
        .test('og-url', 'Must be an http(s) URL', (v) =>
          !v ? true : URL_PATTERN.test(v),
        )
        .default(''),
      canonical: yup
        .string()
        .trim()
        .test('canonical-url', 'Must be an http(s) URL', (v) =>
          !v ? true : URL_PATTERN.test(v),
        )
        .default(''),
    })
    .default({}),

  status: yup.string().oneOf(STATUS_OPTIONS.map((o) => o.value)).default('draft'),
  isFeatured: yup.boolean().default(false),
  isLimitedEdition: yup.boolean().default(false),

  categoryId: yup
    .mixed()
    .transform((value) =>
      value === '' || value === null || value === undefined ? null : value,
    )
    .nullable(),
  relatedProductIds: yup.array().of(yup.mixed()).default([]),
});

export const emptyDefaults = {
  name: '',
  slug: '',
  description: '',
  tags: [],

  price: 0,
  compareAtPrice: null,
  currency: 'AED',
  taxClass: 'standard',

  images: DEFAULT_IMAGE_ROWS.map((row) => ({ ...row })),

  sku: '',
  stock: 0,
  lowStockThreshold: 5,
  allowBackorder: false,

  attributes: DEFAULT_ATTRIBUTE_ROWS.map((row) => ({ ...row })),

  seo: {
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    canonical: '',
  },

  status: 'draft',
  isFeatured: false,
  isLimitedEdition: false,

  categoryId: null,
  relatedProductIds: [],
};

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

export function attributesArrayToObject(rows) {
  const out = {};
  for (const row of rows || []) {
    const k = String(row?.key || '').trim();
    const v = String(row?.value || '').trim();
    if (!k) continue;
    out[k] = v;
  }
  return out;
}

export function attributesObjectToArray(obj) {
  if (!obj || typeof obj !== 'object') return DEFAULT_ATTRIBUTE_ROWS.map((r) => ({ ...r }));
  const known = new Set(DEFAULT_ATTRIBUTE_ROWS.map((r) => r.key));
  const rows = DEFAULT_ATTRIBUTE_ROWS.map((r) => ({
    key: r.key,
    value: formatAttributeValue(obj[r.key]),
  }));
  for (const [k, v] of Object.entries(obj)) {
    if (known.has(k)) continue;
    rows.push({ key: k, value: formatAttributeValue(v) });
  }
  return rows;
}

function formatAttributeValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined) return '';
  return String(value);
}

export function productToFormValues(product) {
  if (!product) return { ...emptyDefaults };
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) =>
        typeof img === 'string'
          ? { url: img, alt: '' }
          : { url: img?.url || '', alt: img?.alt || '' },
      )
    : DEFAULT_IMAGE_ROWS.map((row) => ({ ...row }));

  return {
    ...emptyDefaults,
    ...product,
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    tags: Array.isArray(product.tags) ? product.tags.slice() : [],
    price: typeof product.price === 'number' ? product.price : Number(product.price) || 0,
    compareAtPrice:
      product.compareAtPrice === null || product.compareAtPrice === undefined
        ? null
        : Number(product.compareAtPrice),
    currency: 'AED',
    taxClass: product.taxClass || 'standard',
    images,
    sku: product.sku || '',
    stock: Number(product.stock) || 0,
    lowStockThreshold:
      typeof product.lowStockThreshold === 'number' ? product.lowStockThreshold : 5,
    allowBackorder: Boolean(product.allowBackorder),
    attributes: attributesObjectToArray(product.attributes),
    seo: {
      metaTitle: product?.seo?.metaTitle || '',
      metaDescription: product?.seo?.metaDescription || '',
      ogImage: product?.seo?.ogImage || '',
      canonical: product?.seo?.canonical || '',
    },
    status: deriveStatusValue(product),
    isFeatured: Boolean(product.isFeatured),
    isLimitedEdition: Boolean(product.isLimitedEdition),
    categoryId: product.categoryId ?? null,
    relatedProductIds: Array.isArray(product.relatedProductIds)
      ? product.relatedProductIds.slice()
      : [],
  };
}

function deriveStatusValue(product) {
  const raw = String(product?.status || '').toLowerCase();
  if (raw === 'active' || raw === 'draft' || raw === 'archived') return raw;
  if (product?.isArchived) return 'archived';
  if (product?.isActive === false) return 'draft';
  return 'active';
}

export function formValuesToPayload(values) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description || '',
    tags: (values.tags || []).map((t) => String(t).trim()).filter(Boolean),
    price: Number(values.price) || 0,
    compareAtPrice:
      values.compareAtPrice === null || values.compareAtPrice === undefined
        ? null
        : Number(values.compareAtPrice),
    currency: 'AED',
    taxClass: values.taxClass,
    images: (values.images || []).map((img) => img.url.trim()),
    imagesAlt: (values.images || []).map((img) => img.alt || ''),
    sku: values.sku.trim(),
    stock: Number(values.stock) || 0,
    lowStockThreshold: Number(values.lowStockThreshold) || 0,
    allowBackorder: Boolean(values.allowBackorder),
    attributes: attributesArrayToObject(values.attributes),
    seo: {
      metaTitle: values.seo.metaTitle.trim(),
      metaDescription: values.seo.metaDescription.trim(),
      ogImage: values.seo.ogImage.trim(),
      canonical: values.seo.canonical.trim(),
    },
    status: values.status,
    isActive: values.status === 'active',
    isArchived: values.status === 'archived',
    isFeatured: Boolean(values.isFeatured),
    isLimitedEdition: Boolean(values.isLimitedEdition),
    categoryId: values.categoryId ?? null,
    relatedProductIds: values.relatedProductIds || [],
  };
}
