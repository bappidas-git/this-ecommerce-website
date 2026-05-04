/* eslint-disable no-console */
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');

const {
  attachUser,
  requireAuth,
  requireRole,
  signToken,
  sanitizeUser,
  hashPassword,
  verifyPassword,
} = require('./utils/auth');
const { wrapList, wrapItem, error: errorEnvelope } = require('./utils/envelope');

// ---------- bootstrap --------------------------------------------------------------
const PORT = Number(process.env.PORT) || 4000;
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:5173';
const DB_FILE = path.resolve(__dirname, '..', 'db.json');

const router = jsonServer.router(DB_FILE);
const db = router.db; // lowdb instance

const app = express();
app.use(cors({ origin: WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Quiet request log
app.use((req, _res, next) => {
  const t = new Date().toISOString().slice(11, 19);
  console.log(`[${t}] ${req.method} ${req.originalUrl}`);
  next();
});

// Express 5 makes req.query an immutable getter. json-server (Express 4) and
// our snake-case rewriter both mutate the query object, so re-define it as a
// normal writable property on every request.
app.use((req, _res, next) => {
  const q = { ...req.query };
  Object.defineProperty(req, 'query', {
    value: q,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

// ---------- helpers ----------------------------------------------------------------
const round = (n) => Math.round(Number(n) * 100) / 100;
const isTrue = (v) => v === true || v === 'true' || v === '1' || v === 1;
const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (v == null || v === '') return [];
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

// ---------- snake_case query rewriter ----------------------------------------------
// Rewrites incoming query params into json-server's expected names BEFORE the router runs.
// Some keys (colors, materials) are kept on req.snakeFilters and applied by custom handlers.
const snakeCaseQuery = (req, _res, next) => {
  const q = req.query;
  if (q.per_page) {
    q._limit = q.per_page;
    delete q.per_page;
  }
  if (q.page) {
    q._page = q.page;
    delete q.page;
  }
  if (q.sort) {
    const fields = [];
    const orders = [];
    String(q.sort)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => {
        const desc = s.startsWith('-');
        fields.push(desc ? s.slice(1) : s);
        orders.push(desc ? 'desc' : 'asc');
      });
    q._sort = fields.join(',');
    q._order = orders.join(',');
    delete q.sort;
  }
  if (q.category_id) {
    q.categoryId = q.category_id;
    delete q.category_id;
  }
  if (q.min_price) {
    q.price_gte = q.min_price;
    delete q.min_price;
  }
  if (q.max_price) {
    q.price_lte = q.max_price;
    delete q.max_price;
  }
  if (q.in_stock != null) {
    if (isTrue(q.in_stock)) q.stock_gte = 1;
    delete q.in_stock;
  }
  if (q.on_sale != null) {
    if (isTrue(q.on_sale)) q.isOnSale = true;
    delete q.on_sale;
  }
  if (q.featured != null) {
    if (isTrue(q.featured)) q.isFeatured = true;
    delete q.featured;
  }
  // Stash array filters for custom handlers (json-server can't filter on nested arrays)
  req.snakeFilters = {
    colors: toArray(q.colors).map((s) => s.toLowerCase()),
    materials: toArray(q.materials).map((s) => s.toLowerCase()),
    q: q.q ? String(q.q).toLowerCase() : null,
  };
  delete q.colors;
  delete q.materials;
  next();
};

// ---------- envelope wrapping for json-server --------------------------------------
router.render = (req, res) => {
  const status = res.statusCode;
  const data = res.locals.data;
  if (status >= 400) {
    const message =
      (data && data.message) ||
      (typeof data === 'string' ? data : 'Request failed');
    return res.status(status).jsonp(errorEnvelope(message, data && data.errors));
  }
  if (Array.isArray(data)) {
    const total = Number(res.get('X-Total-Count')) || data.length;
    const page = Number(req.query._page) || 1;
    const perPage = Number(req.query._limit) || (data.length || total || 1);
    return res.jsonp(wrapList(data, { page, perPage, total }));
  }
  return res.jsonp(wrapItem(data));
};

// ============================================================================
// AUTH ROUTES
// ============================================================================
const buildAuthResponse = (user) => ({
  user: sanitizeUser(user),
  token: signToken(user),
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body || {};
  const errors = {};
  if (!firstName) errors.firstName = 'First name is required';
  if (!lastName) errors.lastName = 'Last name is required';
  if (!email) errors.email = 'Email is required';
  if (!password || String(password).length < 8)
    errors.password = 'Password must be at least 8 characters';
  if (Object.keys(errors).length) {
    return res.status(422).json(errorEnvelope('Invalid input', errors));
  }
  const existing = db.get('users').find({ email: String(email).toLowerCase() }).value();
  if (existing) {
    return res
      .status(409)
      .json(errorEnvelope('Email already registered', { email: 'taken' }));
  }
  const lastId = db.get('users').value().reduce((m, u) => Math.max(m, u.id), 0);
  const now = new Date().toISOString();
  const user = {
    id: lastId + 1,
    firstName,
    lastName,
    email: String(email).toLowerCase(),
    role: 'customer',
    phone: phone || null,
    avatar: null,
    passwordHash: hashPassword(password),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  db.get('users').push(user).write();
  res.status(201).json(wrapItem(buildAuthResponse(user)));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(422).json(errorEnvelope('Email and password are required'));
  }
  const user = db
    .get('users')
    .find({ email: String(email).toLowerCase() })
    .value();
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json(errorEnvelope('Invalid credentials'));
  }
  res.json(wrapItem(buildAuthResponse(user)));
});

app.post('/api/auth/forgot', (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(422).json(errorEnvelope('Email is required'));
  }
  const user = db
    .get('users')
    .find({ email: String(email).toLowerCase() })
    .value();
  if (user) {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    db.get('users')
      .find({ id: user.id })
      .assign({ resetToken: token, resetTokenExpires: expires })
      .write();
    console.log(
      `[auth] password reset link → ${WEB_ORIGIN}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`,
    );
  }
  // Always succeed — don't leak whether the email exists.
  res.json(wrapItem({ ok: true }));
});

app.post('/api/auth/reset', (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res
      .status(422)
      .json(errorEnvelope('Token and password are required', {
        ...(token ? {} : { token: 'Token is required' }),
        ...(password ? {} : { password: 'Password is required' }),
      }));
  }
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return res
      .status(422)
      .json(errorEnvelope('Password does not meet the required rules', {
        password: 'Use 8+ characters with a number and a capital letter.',
      }));
  }
  const user = db.get('users').find({ resetToken: token }).value();
  if (
    !user ||
    !user.resetTokenExpires ||
    Date.parse(user.resetTokenExpires) < Date.now()
  ) {
    return res
      .status(410)
      .json(errorEnvelope('Reset token is invalid or expired'));
  }
  db.get('users')
    .find({ id: user.id })
    .assign({
      passwordHash: hashPassword(password),
      resetToken: null,
      resetTokenExpires: null,
      updatedAt: new Date().toISOString(),
    })
    .write();
  res.json(wrapItem({ ok: true }));
});

app.use(attachUser(db));

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(wrapItem(req.user));
});

app.post('/api/auth/logout', (_req, res) => {
  res.json(wrapItem({ ok: true }));
});

// Update profile (firstName, lastName, phone, dateOfBirth)
app.patch('/api/auth/profile', requireAuth, (req, res) => {
  const { firstName, lastName, phone, dateOfBirth } = req.body || {};
  const errors = {};
  if (firstName !== undefined && !String(firstName).trim()) {
    errors.firstName = 'First name is required';
  }
  if (lastName !== undefined && !String(lastName).trim()) {
    errors.lastName = 'Last name is required';
  }
  if (phone && !/^\+?[0-9\s\-()]{6,20}$/.test(String(phone))) {
    errors.phone = 'Enter a valid phone number';
  }
  if (dateOfBirth && Number.isNaN(Date.parse(dateOfBirth))) {
    errors.dateOfBirth = 'Enter a valid date';
  }
  if (Object.keys(errors).length) {
    return res.status(422).json(errorEnvelope('Invalid input', errors));
  }
  const patch = {
    ...(firstName !== undefined ? { firstName: String(firstName).trim() } : {}),
    ...(lastName !== undefined ? { lastName: String(lastName).trim() } : {}),
    ...(phone !== undefined ? { phone: phone || null } : {}),
    ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth || null } : {}),
    updatedAt: new Date().toISOString(),
  };
  db.get('users').find({ id: req.user.id }).assign(patch).write();
  const updated = db.get('users').find({ id: req.user.id }).value();
  res.json(wrapItem(sanitizeUser(updated)));
});

// Change password
app.post('/api/auth/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Current password is required';
  if (!newPassword) errors.newPassword = 'New password is required';
  else if (
    newPassword.length < 8 ||
    !/[a-z]/.test(newPassword) ||
    !/[A-Z]/.test(newPassword) ||
    !/\d/.test(newPassword)
  ) {
    errors.newPassword = 'Use 8+ characters with a number and a capital letter.';
  }
  if (Object.keys(errors).length) {
    return res.status(422).json(errorEnvelope('Invalid input', errors));
  }
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    return res
      .status(422)
      .json(errorEnvelope('Current password is incorrect', {
        currentPassword: 'Current password is incorrect',
      }));
  }
  db.get('users')
    .find({ id: req.user.id })
    .assign({
      passwordHash: hashPassword(newPassword),
      updatedAt: new Date().toISOString(),
    })
    .write();
  const updated = db.get('users').find({ id: req.user.id }).value();
  res.json(wrapItem({ user: sanitizeUser(updated), token: signToken(updated) }));
});

// Update preferences
app.patch('/api/auth/preferences', requireAuth, (req, res) => {
  const incoming = req.body || {};
  const user = db.get('users').find({ id: req.user.id }).value();
  const prev = user?.preferences || {};
  const next = {
    newsletter: Boolean(incoming.newsletter ?? prev.newsletter ?? false),
    restockAlerts: Boolean(incoming.restockAlerts ?? prev.restockAlerts ?? false),
    saleAlerts: Boolean(incoming.saleAlerts ?? prev.saleAlerts ?? false),
    orderUpdates: true,
    language: 'en',
    currency: 'AED',
  };
  db.get('users')
    .find({ id: req.user.id })
    .assign({ preferences: next, updatedAt: new Date().toISOString() })
    .write();
  const updated = db.get('users').find({ id: req.user.id }).value();
  res.json(wrapItem(sanitizeUser(updated)));
});

// Delete account
app.delete('/api/auth/account', requireAuth, (req, res) => {
  const { confirm } = req.body || {};
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json(errorEnvelope('Account not found'));
  if (!confirm || String(confirm).toLowerCase() !== String(user.email).toLowerCase()) {
    return res.status(422).json(errorEnvelope('Confirmation does not match', {
      confirm: 'Type your email exactly to confirm',
    }));
  }
  db.get('users').remove({ id: req.user.id }).write();
  res.json(wrapItem({ ok: true }));
});

// ============================================================================
// SNAKE-CASE QUERY for everything under /api
// ============================================================================
app.use('/api', snakeCaseQuery);

// ============================================================================
// CUSTOM STOREFRONT ROUTES (must come before json-server router)
// ============================================================================

// GET /api/products  — full filter/sort/paginate with color & material support
app.get('/api/products', (req, res) => {
  const q = req.query;
  let items = db.get('products').value().filter((p) => p.isActive !== false);

  if (q.categoryId) {
    items = items.filter((p) => String(p.categoryId) === String(q.categoryId));
  }
  if (q.price_gte != null) items = items.filter((p) => p.price >= Number(q.price_gte));
  if (q.price_lte != null) items = items.filter((p) => p.price <= Number(q.price_lte));
  if (q.stock_gte != null) items = items.filter((p) => p.stock >= Number(q.stock_gte));
  if (q.isOnSale != null) items = items.filter((p) => p.isOnSale === isTrue(q.isOnSale));
  if (q.isFeatured != null)
    items = items.filter((p) => p.isFeatured === isTrue(q.isFeatured));

  const { colors, materials, q: search } = req.snakeFilters || {};
  if (colors && colors.length) {
    items = items.filter((p) =>
      (p.attributes?.color || []).some((c) =>
        colors.some((needle) => String(c).toLowerCase().includes(needle)),
      ),
    );
  }
  if (materials && materials.length) {
    items = items.filter((p) =>
      (p.attributes?.material || []).some((m) =>
        materials.some((needle) => String(m).toLowerCase().includes(needle)),
      ),
    );
  }
  if (search) {
    items = items.filter((p) => {
      const hay = [
        p.name,
        p.description,
        p.sku,
        ...(p.tags || []),
        ...(p.attributes?.color || []),
        ...(p.attributes?.material || []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(search);
    });
  }

  // sort
  if (q._sort) {
    const fields = String(q._sort).split(',');
    const orders = String(q._order || '').split(',');
    items = [...items].sort((a, b) => {
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        const dir = (orders[i] || 'asc') === 'desc' ? -1 : 1;
        const av = a[f];
        const bv = b[f];
        if (av === bv) continue;
        if (av == null) return 1;
        if (bv == null) return -1;
        return av > bv ? dir : -dir;
      }
      return 0;
    });
  }

  const total = items.length;
  const page = Math.max(1, Number(q._page) || 1);
  const perPage = Math.max(1, Number(q._limit) || 12);
  const start = (page - 1) * perPage;
  const slice = items.slice(start, start + perPage);
  res.json(wrapList(slice, { page, perPage, total }));
});

// GET /api/products/:id/related  — same category, excludes self
app.get('/api/products/:id/related', (req, res) => {
  const { id } = req.params;
  const products = db.get('products').value().filter((p) => p.isActive !== false);
  const source =
    products.find((p) => String(p.id) === String(id)) ||
    products.find((p) => p.slug === String(id));
  if (!source) return res.json(wrapList([], { page: 1, perPage: 0, total: 0 }));
  const limit = Math.max(1, Number(req.query._limit) || 8);
  const related = products
    .filter((p) => p.id !== source.id && p.categoryId === source.categoryId)
    .slice(0, limit);
  res.json(wrapList(related, { page: 1, perPage: related.length, total: related.length }));
});

// GET /api/products/:slug  — slug or numeric id
app.get('/api/products/:slug', (req, res) => {
  const { slug } = req.params;
  const item =
    db.get('products').find({ slug }).value() ||
    (Number.isFinite(Number(slug))
      ? db.get('products').find({ id: Number(slug) }).value()
      : null);
  if (!item) return res.status(404).json(errorEnvelope('Product not found'));
  res.json(wrapItem(item));
});

// GET /api/categories/:slug
app.get('/api/categories/:slug', (req, res) => {
  const { slug } = req.params;
  const item =
    db.get('categories').find({ slug }).value() ||
    (Number.isFinite(Number(slug))
      ? db.get('categories').find({ id: Number(slug) }).value()
      : null);
  if (!item) return res.status(404).json(errorEnvelope('Category not found'));
  res.json(wrapItem(item));
});

// POST /api/coupons/validate
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal = 0 } = req.body || {};
  const coupon = db
    .get('coupons')
    .find({ code: String(code || '').toUpperCase() })
    .value();
  const fail = (message) =>
    res.json(wrapItem({ valid: false, code, type: null, discount: 0, message }));

  if (!coupon || !coupon.isActive) return fail('Coupon is invalid');
  if (Date.parse(coupon.endsAt) < Date.now()) return fail('Coupon has expired');
  if (Date.parse(coupon.startsAt) > Date.now()) return fail('Coupon is not yet active');
  if (coupon.redeemedCount >= coupon.maxRedemptions)
    return fail('Coupon is fully redeemed');
  if (Number(subtotal) < coupon.minSubtotal)
    return fail(`Minimum subtotal AED ${coupon.minSubtotal}`);

  const discount =
    coupon.type === 'percent'
      ? round((Number(subtotal) * coupon.value) / 100)
      : Math.min(coupon.value, Number(subtotal));
  res.json(
    wrapItem({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      discount,
      message: 'Coupon applied',
    }),
  );
});

// POST /api/orders  — atomic placement
app.post('/api/orders', requireAuth, (req, res) => {
  const { items, shippingAddress, billingAddress, paymentMethod, couponCode, notes } =
    req.body || {};

  if (!Array.isArray(items) || !items.length) {
    return res
      .status(422)
      .json(errorEnvelope('No items in order', { items: 'required' }));
  }
  if (!shippingAddress) {
    return res
      .status(422)
      .json(errorEnvelope('Shipping address is required', {
        shippingAddress: 'required',
      }));
  }

  const productsCol = db.get('products');
  const snapshot = [];
  for (const it of items) {
    const p = productsCol.find({ id: Number(it.productId) }).value();
    if (!p) {
      return res
        .status(422)
        .json(errorEnvelope(`Unknown product ${it.productId}`));
    }
    const qty = Math.max(1, Number(it.quantity) || 1);
    if (p.stock < qty) {
      return res
        .status(409)
        .json(errorEnvelope(`Insufficient stock for ${p.name}`, {
          productId: p.id,
          stock: p.stock,
        }));
    }
    snapshot.push({
      productId: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] || null,
      unitPrice: p.price,
      quantity: qty,
      lineTotal: round(p.price * qty),
    });
  }

  const subtotal = round(snapshot.reduce((s, it) => s + it.lineTotal, 0));

  let discount = 0;
  let appliedCode = null;
  if (couponCode) {
    const coupon = db
      .get('coupons')
      .find({ code: String(couponCode).toUpperCase() })
      .value();
    if (
      coupon &&
      coupon.isActive &&
      Date.parse(coupon.endsAt) > Date.now() &&
      coupon.redeemedCount < coupon.maxRedemptions &&
      subtotal >= coupon.minSubtotal
    ) {
      discount =
        coupon.type === 'percent'
          ? round((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal);
      appliedCode = coupon.code;
      db.get('coupons')
        .find({ id: coupon.id })
        .update('redeemedCount', (n) => n + 1)
        .write();
    }
  }
  const tax = round((subtotal - discount) * 0.05);
  const total = round(subtotal - discount + tax);

  const ordersCol = db.get('orders');
  const lastId = ordersCol.value().reduce((m, o) => Math.max(m, o.id), 0);
  const year = new Date().getUTCFullYear();
  const number = `TI-${year}-${String(lastId + 1).padStart(5, '0')}`;
  const now = new Date().toISOString();

  const order = {
    id: lastId + 1,
    number,
    userId: req.user.id,
    items: snapshot,
    subtotal,
    discount,
    tax,
    total,
    currency: 'AED',
    couponCode: appliedCode,
    paymentMethod: paymentMethod || 'card',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    status: 'pending',
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    notes: Array.isArray(notes) ? notes : [],
    createdAt: now,
    updatedAt: now,
  };

  // Decrement stock + write inventory_log per item
  const logCol = db.get('inventory_log');
  let logId = logCol.value().reduce((m, l) => Math.max(m, l.id), 0);
  for (const it of snapshot) {
    productsCol
      .find({ id: it.productId })
      .update('stock', (s) => Math.max(0, s - it.quantity))
      .write();
    logId += 1;
    logCol
      .push({
        id: logId,
        productId: it.productId,
        delta: -it.quantity,
        reason: 'order_fulfillment',
        userId: req.user.id,
        createdAt: now,
      })
      .write();
  }
  ordersCol.push(order).write();

  res.status(201).json(wrapItem(order));
});

// ============================================================================
// ADMIN GATE + REPORTS  (must come before /api/admin json-server proxy)
// ============================================================================
const ADMIN_ROLES = ['admin', 'manager', 'viewer'];
const WRITE_ROLES = ['admin', 'manager'];
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const adminGate = (req, res, next) => {
  if (!req.user) return res.status(401).json(errorEnvelope('Unauthorized'));
  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json(errorEnvelope('Forbidden'));
  }
  if (WRITE_METHODS.has(req.method) && !WRITE_ROLES.includes(req.user.role)) {
    return res.status(403).json(errorEnvelope('Read-only role'));
  }
  next();
};

const dayKey = (iso) => String(iso).slice(0, 10);

app.get('/api/admin/reports/sales-over-time', adminGate, (req, res) => {
  const days = Number(req.query.days) || 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    buckets[dayKey(d.toISOString())] = { date: dayKey(d.toISOString()), revenue: 0, orders: 0 };
  }
  db.get('orders')
    .value()
    .filter((o) => Date.parse(o.createdAt) >= cutoff && o.status !== 'cancelled')
    .forEach((o) => {
      const k = dayKey(o.createdAt);
      if (!buckets[k]) buckets[k] = { date: k, revenue: 0, orders: 0 };
      buckets[k].revenue = round(buckets[k].revenue + o.total);
      buckets[k].orders += 1;
    });
  res.json(wrapItem(Object.values(buckets)));
});

app.get('/api/admin/reports/sales-by-category', adminGate, (_req, res) => {
  const cats = db.get('categories').value();
  const products = db.get('products').value();
  const orders = db.get('orders').value().filter((o) => o.status !== 'cancelled');
  const totals = Object.fromEntries(
    cats.map((c) => [c.id, { categoryId: c.id, name: c.name, revenue: 0, units: 0 }]),
  );
  for (const o of orders) {
    for (const it of o.items) {
      const p = products.find((pp) => pp.id === it.productId);
      if (!p) continue;
      const t = totals[p.categoryId];
      if (!t) continue;
      t.revenue = round(t.revenue + it.lineTotal);
      t.units += it.quantity;
    }
  }
  res.json(wrapItem(Object.values(totals)));
});

app.get('/api/admin/reports/top-products', adminGate, (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const totals = new Map();
  db.get('orders')
    .value()
    .filter((o) => o.status !== 'cancelled')
    .forEach((o) => {
      for (const it of o.items) {
        const cur = totals.get(it.productId) || {
          productId: it.productId,
          name: it.name,
          slug: it.slug,
          units: 0,
          revenue: 0,
        };
        cur.units += it.quantity;
        cur.revenue = round(cur.revenue + it.lineTotal);
        totals.set(it.productId, cur);
      }
    });
  const list = [...totals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
  res.json(wrapItem(list));
});

app.get('/api/admin/reports/top-customers', adminGate, (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const users = db.get('users').value();
  const totals = new Map();
  db.get('orders')
    .value()
    .filter((o) => o.status !== 'cancelled')
    .forEach((o) => {
      const cur = totals.get(o.userId) || {
        userId: o.userId,
        orders: 0,
        revenue: 0,
      };
      cur.orders += 1;
      cur.revenue = round(cur.revenue + o.total);
      totals.set(o.userId, cur);
    });
  const list = [...totals.values()]
    .map((row) => {
      const u = users.find((x) => x.id === row.userId);
      return {
        ...row,
        name: u ? `${u.firstName} ${u.lastName}` : `User ${row.userId}`,
        email: u?.email || null,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
  res.json(wrapItem(list));
});

app.get('/api/admin/reports/coupon-performance', adminGate, (_req, res) => {
  const orders = db.get('orders').value();
  const list = db
    .get('coupons')
    .value()
    .map((c) => {
      const used = orders.filter((o) => o.couponCode === c.code);
      const revenue = round(used.reduce((s, o) => s + o.total, 0));
      const discount = round(used.reduce((s, o) => s + o.discount, 0));
      return {
        code: c.code,
        type: c.type,
        value: c.value,
        redeemedCount: c.redeemedCount,
        ordersUsed: used.length,
        revenue,
        discount,
        isActive: c.isActive,
      };
    });
  res.json(wrapItem(list));
});

app.get('/api/admin/reports/inventory-turnover', adminGate, (_req, res) => {
  const log = db.get('inventory_log').value();
  const products = db.get('products').value();
  const list = products.map((p) => {
    const movements = log.filter((l) => l.productId === p.id);
    const sold = -movements
      .filter((l) => l.delta < 0)
      .reduce((s, l) => s + l.delta, 0);
    const restocked = movements
      .filter((l) => l.delta > 0)
      .reduce((s, l) => s + l.delta, 0);
    return {
      productId: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      sold,
      restocked,
      lowStock: p.stock < 5,
    };
  });
  res.json(wrapItem(list));
});

// /api/admin/* → role gate, then proxy to json-server router under stripped path.
app.use('/api/admin', adminGate, router);

// ============================================================================
// JSON-SERVER ROUTER — storefront resources
// ============================================================================
app.use('/api', router);

// ---------- 404 + error envelope ---------------------------------------------------
app.use('/api', (_req, res) => {
  res.status(404).json(errorEnvelope('Not found'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server] error:', err);
  res
    .status(err.status || 500)
    .json(errorEnvelope(err.message || 'Internal server error'));
});

// ---------- listen -----------------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
