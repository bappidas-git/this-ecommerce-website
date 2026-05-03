/* eslint-disable no-console */
/**
 * Deterministic db.json generator for THIS Interiors mock backend.
 *
 *   node server/utils/build-db.js
 *
 * Re-run any time to rebuild seed data. Output: <repo>/db.json
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.resolve(__dirname, '..', '..', 'db.json');

// ---------- deterministic helpers --------------------------------------------------
let _seed = 0xC0FFEE;
const rand = () => {
  // mulberry32
  let t = (_seed += 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
const fixed = (n, p = 2) => Number(n.toFixed(p));

// ---------- brand palette / images -------------------------------------------------
const COLORS = {
  bg: 'F7F3ED',
  ink: '1B1A17',
  brass: 'B8924F',
  emerald: '1F4034',
  line: 'E5DED2',
  surface: 'FFFFFF',
};
const img = (w, h, bg, fg, label) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(
    label,
  ).replace(/%20/g, '+')}&font=playfair`;
const productImg = (label, idx) =>
  img(1200, 1500, COLORS.bg, COLORS.ink, `${label} ${idx}`);
const categoryImg = (label) =>
  img(900, 600, COLORS.line, COLORS.ink, label);
const heroImg = (label) =>
  img(1920, 1080, COLORS.emerald, COLORS.bg, label);
const avatarImg = (initials) =>
  img(200, 200, COLORS.brass, COLORS.bg, initials);

// ---------- date helpers -----------------------------------------------------------
const ISO = (y, m, d, h = 9, mi = 0) =>
  new Date(Date.UTC(y, m - 1, d, h, mi, 0)).toISOString();
const daysAgo = (n) => {
  const ref = new Date(Date.UTC(2026, 4, 1, 9, 0, 0)); // 2026-05-01
  ref.setUTCDate(ref.getUTCDate() - n);
  return ref.toISOString();
};

// ---------- users ------------------------------------------------------------------
const PASSWORD = 'Password123!';
const passwordHash = bcrypt.hashSync(PASSWORD, 10);

const users = [
  {
    id: 1,
    firstName: 'Aaliyah',
    lastName: 'Hassan',
    email: 'admin@thisinteriors.test',
    role: 'admin',
    phone: '+971501110001',
    avatar: avatarImg('AH'),
    passwordHash,
    isActive: true,
    createdAt: ISO(2024, 1, 12),
    updatedAt: ISO(2026, 4, 20),
  },
  {
    id: 2,
    firstName: 'Marcus',
    lastName: 'Lawal',
    email: 'manager@thisinteriors.test',
    role: 'manager',
    phone: '+971501110002',
    avatar: avatarImg('ML'),
    passwordHash,
    isActive: true,
    createdAt: ISO(2024, 3, 4),
    updatedAt: ISO(2026, 3, 28),
  },
  {
    id: 3,
    firstName: 'Sana',
    lastName: 'Khoury',
    email: 'viewer@thisinteriors.test',
    role: 'viewer',
    phone: '+971501110003',
    avatar: avatarImg('SK'),
    passwordHash,
    isActive: true,
    createdAt: ISO(2024, 6, 18),
    updatedAt: ISO(2026, 2, 11),
  },
  {
    id: 4,
    firstName: 'Layla',
    lastName: 'Ibrahim',
    email: 'layla@example.com',
    role: 'customer',
    phone: '+971554441001',
    avatar: avatarImg('LI'),
    passwordHash,
    isActive: true,
    createdAt: ISO(2025, 5, 9),
    updatedAt: ISO(2026, 4, 14),
  },
  {
    id: 5,
    firstName: 'Omar',
    lastName: 'Saleh',
    email: 'omar@example.com',
    role: 'customer',
    phone: '+971554441002',
    avatar: avatarImg('OS'),
    passwordHash,
    isActive: true,
    createdAt: ISO(2025, 9, 21),
    updatedAt: ISO(2026, 4, 27),
  },
];

// ---------- categories -------------------------------------------------------------
const categoryDefs = [
  ['vases', 'Vases', 'Sculptural vessels in marble, glass, brass, and stoneware.'],
  ['lamps', 'Lamps', 'Quiet lighting — table, floor and pendant pieces.'],
  [
    'cushions-throws',
    'Cushions & Throws',
    'Linen, velvet, and cashmere comfort for sofa and bed.',
  ],
  ['wall-art', 'Wall Art', 'Limited prints, framed studies, and architectural plates.'],
  ['mirrors', 'Mirrors', 'Arched, round, and floor mirrors with brass and stone trim.'],
  [
    'candles-diffusers',
    'Candles & Diffusers',
    'Oud, fig, rose, sandalwood — slow-burn rituals for home.',
  ],
  ['planters', 'Planters', 'Terracotta, concrete, brass and marble vessels for greenery.'],
  [
    'table-accessories',
    'Table Accessories',
    'Napkins, candlesticks, coasters and serving pieces.',
  ],
];
const categories = categoryDefs.map(([slug, name, description], i) => ({
  id: i + 1,
  slug,
  name,
  description,
  parentId: null,
  image: categoryImg(name),
  sortOrder: (i + 1) * 10,
}));

// ---------- products ---------------------------------------------------------------
const productDefs = [
  // vases (cat 1)
  ['Marble Carrara Vase', 1, ['Carrara Marble'], ['Ivory'], '24 × 24 × 38 cm', 7800],
  ['Brass Stem Vase', 1, ['Brushed Brass'], ['Brass'], '12 × 12 × 32 cm', 4900],
  ['Linen Pottery Vase', 1, ['Stoneware'], ['Sand'], '18 × 18 × 26 cm', 3600],
  ['Smoked Glass Vase', 1, ['Hand-blown Glass'], ['Smoke'], '16 × 16 × 30 cm', 4200],
  ['Travertine Bud Vase', 1, ['Travertine'], ['Cream'], '8 × 8 × 14 cm', 2200],
  // lamps (cat 2)
  ['Brass Reading Lamp', 2, ['Solid Brass', 'Linen Shade'], ['Brass', 'Ivory'], '32 × 32 × 58 cm', 12800],
  ['Linen Drum Floor Lamp', 2, ['Oak', 'Linen'], ['Sand'], '46 × 46 × 162 cm', 18900],
  ['Pleated Silk Table Lamp', 2, ['Silk', 'Brass'], ['Champagne'], '34 × 34 × 56 cm', 9800],
  ['Onyx Glow Lamp', 2, ['Onyx Stone', 'Brass'], ['Honey'], '22 × 22 × 38 cm', 14500],
  ['Cylinder Pendant Lamp', 2, ['Brushed Brass'], ['Brass'], '18 × 18 × 32 cm', 7600],
  // cushions-throws (cat 3)
  ['Linen Sand Cushion', 3, ['Belgian Linen'], ['Sand'], '50 × 50 cm', 2400],
  ['Velvet Emerald Cushion', 3, ['Cotton Velvet'], ['Emerald'], '50 × 50 cm', 2600],
  ['Boucle Ivory Throw', 3, ['Wool Boucle'], ['Ivory'], '130 × 180 cm', 6800],
  ['Cashmere Quilted Throw', 3, ['Cashmere'], ['Stone'], '140 × 200 cm', 12400],
  // wall-art (cat 4)
  ['Olive Branch Print', 4, ['Archival Paper', 'Oak Frame'], ['Sage'], '60 × 80 cm', 3400],
  ['Charcoal Nude Study', 4, ['Charcoal on Paper'], ['Charcoal'], '70 × 100 cm', 4200],
  ['Brass Framed Mirror Print', 4, ['Glass', 'Brass'], ['Brass'], '50 × 70 cm', 3900],
  ['Architectural Plate', 4, ['Cotton Paper'], ['Ink'], '50 × 70 cm', 2800],
  // mirrors (cat 5)
  ['Arched Brass Mirror', 5, ['Solid Brass', 'Glass'], ['Brass'], '70 × 4 × 120 cm', 14800],
  ['Round Travertine Mirror', 5, ['Travertine', 'Glass'], ['Cream'], '90 × 6 × 90 cm', 12600],
  ['Slim Floor Mirror', 5, ['Oak', 'Glass'], ['Oak'], '60 × 4 × 180 cm', 9800],
  ['Beveled Wall Mirror', 5, ['Glass', 'Aluminum'], ['Silver'], '80 × 2 × 100 cm', 6400],
  // candles-diffusers (cat 6)
  ['Oud Amber Candle', 6, ['Soy Wax', 'Glass'], ['Amber'], '9 × 9 × 11 cm', 1800],
  ['Fig & Cassis Candle', 6, ['Coconut Wax', 'Glass'], ['Plum'], '9 × 9 × 11 cm', 1800],
  ['Rose Diffuser Set', 6, ['Glass', 'Rattan'], ['Rose'], '7 × 7 × 22 cm', 2200],
  ['Cedar Wax Pillar', 6, ['Beeswax'], ['Honey'], '8 × 8 × 18 cm', 1400],
  ['Sandalwood Reed Diffuser', 6, ['Glass', 'Rattan'], ['Sand'], '7 × 7 × 22 cm', 2100],
  // planters (cat 7)
  ['Terracotta Tall Planter', 7, ['Terracotta'], ['Clay'], '32 × 32 × 60 cm', 4400],
  ['Concrete Cube Planter', 7, ['Concrete'], ['Stone'], '30 × 30 × 30 cm', 3200],
  ['Brass Hanging Planter', 7, ['Brushed Brass'], ['Brass'], '22 × 22 × 60 cm', 3600],
  ['Marble Trough Planter', 7, ['Marble'], ['Ivory'], '60 × 22 × 22 cm', 8400],
  ['Stoneware Bowl Planter', 7, ['Stoneware'], ['Sand'], '36 × 36 × 18 cm', 2800],
  // table-accessories (cat 8)
  ['Linen Napkin Set', 8, ['Belgian Linen'], ['Sand'], 'Set of 4, 45 × 45 cm', 1800],
  ['Brass Candlesticks Pair', 8, ['Brass'], ['Brass'], 'Set of 2, ø8 × 22 cm', 2900],
  ['Marble Coaster Set', 8, ['Marble', 'Cork'], ['Ivory'], 'Set of 4, ø10 cm', 1600],
  ['Olive Wood Bowl', 8, ['Olive Wood'], ['Olive'], 'ø28 × 8 cm', 2200],
];

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const paragraph = (name, materials, color) =>
  [
    `${name} is part of the THIS Interiors core collection — a quietly considered piece for spaces that favour material over decoration. ` +
      `Crafted in ${materials.join(' and ').toLowerCase()}, the form is restrained and the finish is hand-worked.`,
    `Designed for everyday rituals: weighty in the hand, generous in proportion, easy to live with. ` +
      `The ${color.toLowerCase()} tone reads warm in daylight and recedes by lamplight, sitting comfortably alongside linen, oak, brass and stone.`,
    `Each piece is finished by hand, so subtle variation is part of the character. ` +
      `Care is straightforward: a soft, dry cloth is enough for most surfaces — avoid harsh detergents and direct sun.`,
    `Shipped from our Dubai studio in protective packaging. Pieces ship within 2–4 working days inside the UAE; international orders take 7–14 working days.`,
  ].join('\n\n');

const products = productDefs.map((def, i) => {
  const [name, categoryId, materials, colors, dimensions, basePrice] = def;
  const id = i + 1;
  const slug = slugify(name);
  const isOnSale = i % 5 === 0;
  const compareAtPrice = isOnSale ? Math.round(basePrice * 1.25 * 100) / 100 : null;
  const stock = between(0, 42);
  const rating = fixed(3.6 + rand() * 1.4, 1);
  const reviewCount = between(2, 38);
  const cat = categoryDefs[categoryId - 1];
  const sku = `TI-${cat[0].slice(0, 3).toUpperCase()}-${String(id).padStart(4, '0')}`;
  const imageCount = 3 + (i % 3); // 3-5
  const images = Array.from({ length: imageCount }, (_, n) => productImg(name, n + 1));
  const tags = [
    cat[1].toLowerCase(),
    materials[0].toLowerCase().split(' ')[0],
    isOnSale ? 'sale' : 'core',
    i % 4 === 0 ? 'new' : 'classic',
  ];
  return {
    id,
    slug,
    name,
    categoryId,
    description: paragraph(name, materials, colors[0]),
    price: basePrice,
    compareAtPrice,
    currency: 'AED',
    images,
    attributes: {
      color: colors,
      material: materials,
      dimensions,
      weight: `${fixed(0.4 + rand() * 4.6, 2)} kg`,
    },
    tags,
    sku,
    stock,
    isActive: true,
    isFeatured: i % 6 === 0,
    isNew: i % 4 === 0,
    isOnSale,
    rating,
    reviewCount,
    createdAt: daysAgo(180 - i * 3),
    updatedAt: daysAgo(30 - (i % 30)),
  };
});

// ---------- reviews (≥ 80) ---------------------------------------------------------
const reviewTitles = [
  'Quietly beautiful',
  'Better in person',
  'Exactly the weight I hoped for',
  'A small ritual',
  'Worth the wait',
  'Lives on our console',
  'The light it throws is wonderful',
  'Subtle and considered',
  'A grown-up gift to ourselves',
  'Pairs beautifully with linen',
];
const reviewBodies = [
  'Arrived well wrapped, no marks. The proportions are exactly right — substantial without being heavy.',
  'I was nervous about the colour from the photos but it reads warmer in person. Sits beautifully on a brass tray.',
  'Bought one for us and one as a gift. Both have been admired. The finish is genuinely hand-worked.',
  'Lovely object. The base is felted so it doesn\'t scratch the marble.',
  'Light is soft and warm, not yellow. Sketches well over a side table at night.',
  'Colour matched the website faithfully. Would buy again from this shop.',
  'Quick delivery inside Dubai. Packaging was reusable — small thing but appreciated.',
  'Slight variation on the rim which I love — feels handmade, not factory.',
];

const customerIds = users.filter((u) => u.role === 'customer').map((u) => u.id);
const reviews = [];
let reviewIdCounter = 1;
products.forEach((p, idx) => {
  const count = 2 + ((idx * 7) % 4); // 2-5 per product → 36*~3 ≈ 108
  for (let k = 0; k < count; k++) {
    const status =
      reviewIdCounter % 11 === 0
        ? 'rejected'
        : reviewIdCounter % 6 === 0
          ? 'pending'
          : 'published';
    reviews.push({
      id: reviewIdCounter++,
      productId: p.id,
      userId: pick(customerIds),
      rating: between(3, 5),
      title: pick(reviewTitles),
      body: pick(reviewBodies),
      status,
      verifiedPurchase: rand() > 0.25,
      createdAt: daysAgo(160 - reviewIdCounter * 1.3),
    });
  }
});

// ---------- addresses (≥ 6) --------------------------------------------------------
const addresses = [
  {
    id: 1,
    userId: 4,
    label: 'Home',
    firstName: 'Layla',
    lastName: 'Ibrahim',
    phone: '+971554441001',
    line1: 'Villa 14, Street 7',
    line2: 'Jumeirah 1',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'AE',
    isDefault: true,
  },
  {
    id: 2,
    userId: 4,
    label: 'Studio',
    firstName: 'Layla',
    lastName: 'Ibrahim',
    phone: '+971554441001',
    line1: 'Office 802, Boulevard Plaza Tower 1',
    line2: 'Downtown Dubai',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'AE',
    isDefault: false,
  },
  {
    id: 3,
    userId: 5,
    label: 'Home',
    firstName: 'Omar',
    lastName: 'Saleh',
    phone: '+971554441002',
    line1: 'Apartment 2104, Marina Gate 2',
    line2: 'Dubai Marina',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'AE',
    isDefault: true,
  },
  {
    id: 4,
    userId: 5,
    label: 'Parents',
    firstName: 'Hala',
    lastName: 'Saleh',
    phone: '+971501110099',
    line1: 'Villa 9, Al Bateen',
    line2: '',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'AE',
    isDefault: false,
  },
  {
    id: 5,
    userId: 4,
    label: 'Gift — Sister',
    firstName: 'Maya',
    lastName: 'Ibrahim',
    phone: '+971554441099',
    line1: 'Villa 21, Al Wasl Road',
    line2: 'Al Safa',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'AE',
    isDefault: false,
  },
  {
    id: 6,
    userId: 5,
    label: 'Office',
    firstName: 'Omar',
    lastName: 'Saleh',
    phone: '+971554441002',
    line1: 'Floor 18, One Central',
    line2: 'DWTC',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'AE',
    isDefault: false,
  },
];

// ---------- wishlists --------------------------------------------------------------
const wishlists = [
  { id: 1, userId: 4, productIds: [1, 6, 13, 19, 24] },
  { id: 2, userId: 5, productIds: [3, 9, 14, 23, 28, 32] },
];

// ---------- coupons (5) ------------------------------------------------------------
const coupons = [
  {
    id: 1,
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    minSubtotal: 0,
    maxRedemptions: 1000,
    redeemedCount: 142,
    startsAt: ISO(2025, 1, 1),
    endsAt: ISO(2026, 12, 31),
    isActive: true,
    appliesTo: 'all',
    targetIds: [],
  },
  {
    id: 2,
    code: 'BRASS20',
    type: 'percent',
    value: 20,
    minSubtotal: 5000,
    maxRedemptions: 200,
    redeemedCount: 24,
    startsAt: ISO(2026, 3, 1),
    endsAt: ISO(2026, 6, 30),
    isActive: true,
    appliesTo: 'categories',
    targetIds: [2, 5],
  },
  {
    id: 3,
    code: 'STUDIO150',
    type: 'fixed',
    value: 150,
    minSubtotal: 1500,
    maxRedemptions: 500,
    redeemedCount: 88,
    startsAt: ISO(2025, 12, 1),
    endsAt: ISO(2026, 12, 31),
    isActive: true,
    appliesTo: 'all',
    targetIds: [],
  },
  {
    id: 4,
    code: 'CUSHION25',
    type: 'percent',
    value: 25,
    minSubtotal: 2000,
    maxRedemptions: 100,
    redeemedCount: 17,
    startsAt: ISO(2026, 4, 1),
    endsAt: ISO(2026, 5, 31),
    isActive: true,
    appliesTo: 'categories',
    targetIds: [3],
  },
  {
    id: 5,
    code: 'EXPIRED',
    type: 'percent',
    value: 50,
    minSubtotal: 0,
    maxRedemptions: 50,
    redeemedCount: 50,
    startsAt: ISO(2024, 1, 1),
    endsAt: ISO(2024, 12, 31),
    isActive: false,
    appliesTo: 'all',
    targetIds: [],
  },
];

// ---------- orders (12) ------------------------------------------------------------
const orderStatuses = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'completed',
  'completed',
  'cancelled',
  'preparing',
  'confirmed',
  'completed',
  'completed',
];
const paymentMethods = ['card', 'cod', 'bank_transfer'];

const orderItemFromProduct = (p, qty) => ({
  productId: p.id,
  sku: p.sku,
  name: p.name,
  slug: p.slug,
  image: p.images[0],
  unitPrice: p.price,
  quantity: qty,
  lineTotal: fixed(p.price * qty),
});

const orders = [];
for (let i = 0; i < 12; i++) {
  const id = i + 1;
  const number = `TI-2026-${String(id).padStart(5, '0')}`;
  const userId = pick(customerIds);
  const itemsCount = between(1, 4);
  const used = new Set();
  const items = [];
  while (items.length < itemsCount) {
    const p = pick(products);
    if (used.has(p.id)) continue;
    used.add(p.id);
    items.push(orderItemFromProduct(p, between(1, 3)));
  }
  const subtotal = fixed(items.reduce((s, it) => s + it.lineTotal, 0));
  const couponCode = i % 4 === 0 ? 'WELCOME10' : null;
  const discount = couponCode ? fixed(subtotal * 0.1) : 0;
  const tax = fixed((subtotal - discount) * 0.05);
  const total = fixed(subtotal - discount + tax);
  const status = orderStatuses[i];
  const paymentStatus =
    status === 'cancelled'
      ? 'failed'
      : status === 'pending'
        ? 'pending'
        : status === 'completed'
          ? 'paid'
          : i % 3 === 0
            ? 'pending'
            : 'paid';
  const addr = addresses.find((a) => a.userId === userId && a.isDefault) ||
    addresses.find((a) => a.userId === userId) ||
    addresses[0];
  const created = daysAgo(60 - i * 4);
  orders.push({
    id,
    number,
    userId,
    items,
    subtotal,
    discount,
    tax,
    total,
    currency: 'AED',
    couponCode,
    paymentMethod: paymentMethods[i % paymentMethods.length],
    paymentStatus,
    status,
    shippingAddress: { ...addr, id: undefined },
    billingAddress: { ...addr, id: undefined },
    notes:
      i % 3 === 0
        ? [
            {
              id: 1,
              authorId: 1,
              body: 'Customer requested gift wrap.',
              createdAt: created,
              isInternal: false,
            },
          ]
        : [],
    createdAt: created,
    updatedAt: created,
  });
}

// ---------- inventory_log (≥ 20) ---------------------------------------------------
const inventoryReasons = [
  'restock',
  'order_fulfillment',
  'manual_adjustment',
  'damage',
  'return',
];
const inventory_log = [];
for (let i = 0; i < 24; i++) {
  const reason = inventoryReasons[i % inventoryReasons.length];
  inventory_log.push({
    id: i + 1,
    productId: pick(products).id,
    delta: reason === 'restock' || reason === 'return' ? between(1, 12) : -between(1, 4),
    reason,
    userId: i % 4 === 0 ? 1 : 2,
    createdAt: daysAgo(80 - i * 3),
  });
}

// ---------- settings (single object) -----------------------------------------------
const settings = {
  id: 1,
  general: {
    storeName: 'THIS Interiors',
    supportEmail: 'studio@thisinteriors.test',
    supportPhone: '+971 4 000 0000',
    currency: 'AED',
    address: 'Al Quoz Industrial 1, Warehouse 14, Dubai, United Arab Emirates',
  },
  branding: {
    logoText: 'THIS',
    faviconUrl: '/favicon.svg',
  },
  homepage: {
    heroTitle: 'Quiet objects for considered rooms.',
    heroSubtitle:
      'A small Dubai studio working in marble, brass, linen and stone — pieces designed to settle in and stay.',
    heroCta: 'Shop the collection',
    heroImage: heroImg('Quiet objects, considered rooms'),
    featuredCategoryIds: [1, 2, 5, 6],
    featuredProductIds: [1, 6, 13, 19, 23, 28],
  },
  announcement: {
    isActive: true,
    text: 'Complimentary gift wrap on orders over AED 800.',
    link: '/shop',
  },
  payment: {
    codEnabled: true,
    cardEnabled: true,
    bankTransferEnabled: true,
    bankDetails:
      'THIS Interiors LLC · Emirates NBD · IBAN AE000000000000000000000 · BIC EBILAEAD',
  },
  social: {
    instagram: 'https://instagram.com/thisinteriors',
    pinterest: 'https://pinterest.com/thisinteriors',
    facebook: '',
    tiktok: '',
  },
  emails: {
    orderConfirmation:
      'Thank you for your order. We are preparing it now and will share tracking once it ships.',
    shipping: 'Your order is on its way — please allow 2–4 working days inside the UAE.',
    passwordReset: 'Use the link below within 30 minutes to reset your password.',
    welcome: 'Welcome to THIS Interiors. We are glad you are here.',
  },
};

// ---------- write ------------------------------------------------------------------
const db = {
  users,
  categories,
  products,
  reviews,
  orders,
  addresses,
  wishlists,
  coupons,
  inventory_log,
  settings,
};

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n');

console.log(
  `db.json written → ${DB_PATH}\n` +
    `  users: ${users.length}\n` +
    `  categories: ${categories.length}\n` +
    `  products: ${products.length}\n` +
    `  reviews: ${reviews.length}\n` +
    `  orders: ${orders.length}\n` +
    `  addresses: ${addresses.length}\n` +
    `  wishlists: ${wishlists.length}\n` +
    `  coupons: ${coupons.length}\n` +
    `  inventory_log: ${inventory_log.length}\n` +
    `  default password: ${PASSWORD}`,
);
