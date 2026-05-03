# Prompt 04 — JSON server, db.json, and custom middleware

## Project context (do not change)
- Brand: THIS Interiors (Dubai). Reference: https://thisinteriors.com/
- We are building an e‑commerce store for small decor items + an admin panel.
- Admin is reachable only via `/admin/*` with its own login at `/admin/login`.
- Brand feel: editorial, premium, calm. Cream + brass + ink + emerald. Cormorant Garamond + Inter.
- Stack: React 18 (Vite), JS only (no TS), MUI v5, CSS Modules, Framer Motion, react‑router‑dom v6, react‑hook‑form + yup, axios, json‑server with custom Express middleware, swap‑ready for Laravel + MySQL via `VITE_API_BASE_URL`.
- All images via `https://placehold.co/` using brand colors.
- API envelope: `{ data, meta }`; errors: `{ message, errors }`; query params snake_case.
- Storefront persists `ti_token`; admin persists `ti_admin_token` — two separate sessions.

## Brand tokens (use these — never invent)
- Colors: `#F7F3ED` bg, `#FFFFFF` surface, `#1B1A17` ink, `#4A453E` ink‑2, `#8C8678` muted, `#E5DED2` line, `#B8924F` brass, `#9A7836` brass‑2, `#1F4034` emerald, `#C8A29A` rose, `#B0382A` error, `#3F6B4F` success, `#B8862B` warning.
- Fonts: Cormorant Garamond (display), Inter (UI), JetBrains Mono (admin numerals).
- Radii: 4 / 8 / 14 / 24 / 999.

## Universal rules
1. Do not break work from previous prompts. Edit surgically; preserve existing files.
2. JS/JSX only — no `.ts` / `.tsx`.
3. No inline hex in components — use `theme.palette.*` or CSS variables.
4. Components → hooks → services → axios. Never call axios from components.
5. Mobile‑first; verify at 360, 375, 768, 1024, 1440 px.
6. Accessibility: semantic HTML, alt text, focus visible, AA contrast.
7. All placeholder images via `placehold.co` with brand colors.

## Goal of this prompt
Stand up the mock backend: a complete `db.json` seeded with realistic small‑decor inventory, plus a custom Express server (`server/server.js`) that wraps json‑server with auth, role‑based admin gating, response envelopes, snake_case query parsing, and custom routes for cart/checkout/auth that don't fit json‑server's defaults. The shape exactly mirrors what a future Laravel API will return.

## Tasks
1. Create `db.json` at the repo root with these collections (seed counts in parentheses):
   - `users` (5: 1 admin, 1 manager, 1 viewer, 2 customers). Passwords stored as bcrypt hashes (use a setup script or precomputed hashes for `Password123!`).
   - `categories` (8: vases, lamps, cushions & throws, wall art, mirrors, candles & diffusers, planters, table accessories) — each with `id`, `slug`, `name`, `description`, `parentId` (null for top‑level), `image` (placehold.co category card), `sortOrder`.
   - `products` (~36; 4–5 per category) — each with `id`, `slug`, `name`, `categoryId`, `description` (3–4 paragraphs), `price`, `compareAtPrice` (some null), `currency: 'AED'`, `images` (3–5 placehold.co URLs), `attributes` (color, material, dimensions, weight), `tags`, `sku`, `stock`, `isActive`, `isFeatured`, `isNew`, `isOnSale`, `rating` (1–5 float), `reviewCount`, `createdAt`, `updatedAt`.
   - `reviews` (~80, distributed across products) — `id`, `productId`, `userId`, `rating`, `title`, `body`, `status` (`pending|published|rejected`), `verifiedPurchase`, `createdAt`.
   - `orders` (~12, varied statuses) — `id`, `number` (e.g. `TI-2026-00001`), `userId`, `items` (snapshot of products), `subtotal`, `discount`, `tax`, `total`, `currency`, `couponCode` (nullable), `paymentMethod` (`card|cod|bank_transfer`), `paymentStatus` (`pending|paid|refunded|failed`), `status` (`pending|confirmed|preparing|ready|completed|cancelled`), `shippingAddress`, `billingAddress`, `notes` (array of `{ id, authorId, body, createdAt, isInternal }`), `createdAt`, `updatedAt`.
   - `addresses` (~6 across customer users) — `id`, `userId`, `label`, `firstName`, `lastName`, `phone`, `line1`, `line2`, `city`, `emirate`, `country` (default `AE`), `isDefault`.
   - `wishlists` (per user) — `id`, `userId`, `productIds`.
   - `coupons` (~5) — `id`, `code`, `type` (`percent|fixed`), `value`, `minSubtotal`, `maxRedemptions`, `redeemedCount`, `startsAt`, `endsAt`, `isActive`, `appliesTo` (`all|categories|products`), `targetIds`.
   - `inventory_log` (~20) — `id`, `productId`, `delta`, `reason`, `userId`, `createdAt`.
   - `settings` (single object, `id: 1`) — `general` (storeName, supportEmail, supportPhone, currency, address), `branding` (logoText, faviconUrl), `homepage` (heroTitle, heroSubtitle, heroCta, heroImage, featuredCategoryIds, featuredProductIds), `announcement` (`isActive`, `text`, `link`), `payment` (`codEnabled`, `cardEnabled`, `bankTransferEnabled`, `bankDetails`), `social` (instagram, pinterest, facebook, tiktok), `emails` (placeholder text fields).
2. Use `https://placehold.co/{w}x{h}/{bg}/{fg}?text={label}&font=playfair` exclusively for every image. Vary the label (`Marble+Vase+1`, `Marble+Vase+2`, etc.). Match brand palette: `F7F3ED`/`1B1A17` for product, `1F4034`/`F7F3ED` for hero, `E5DED2`/`1B1A17` for category, `B8924F`/`F7F3ED` for avatars.
3. Create `server/server.js` (Express + json‑server middleware):
   - Mount json‑server at `/api/...` for `categories`, `products`, `orders`, `addresses`, `wishlists`, `coupons`, `inventory_log`, `settings`, `reviews`, `users`.
   - `cors()` enabled for `http://localhost:5173`.
   - **Envelope middleware**: rewrite responses for list endpoints to `{ data, meta: { pagination: { page, perPage, total, totalPages } } }` and single endpoints to `{ data }`. Errors come back `{ message, errors? }`.
   - **Snake_case query parser**: translate `per_page`, `page`, `sort`, `q`, `category_id`, `min_price`, `max_price`, `in_stock`, `on_sale`, `colors`, `materials` into json‑server's expected params before forwarding.
   - **Auth routes**:
     - `POST /api/auth/register` → create customer user, return `{ data: { user, token } }`.
     - `POST /api/auth/login` → verify credentials, return `{ data: { user, token } }`. Tokens are JWTs signed with `process.env.JWT_SECRET || 'dev-secret'`, payload `{ id, email, role }`, expiresIn `7d`.
     - `POST /api/auth/forgot` → simulate sending reset email; respond `{ data: { ok: true } }` and log a fake reset URL with a token.
     - `POST /api/auth/reset` → consume token, set new password.
     - `GET /api/auth/me` → return current user from JWT.
     - `POST /api/auth/logout` → no‑op success.
   - **Admin gate**: any `Authorization` Bearer token whose `role !== 'admin' && role !== 'manager' && role !== 'viewer'` is rejected with 403 on `/api/admin/*` routes. Add `/api/admin/*` aliases that proxy to the same collections but enforce role; for write operations, require `admin` or `manager`.
   - **Custom routes**:
     - `POST /api/orders` → atomic order placement: validates stock, decrements `products.stock`, creates an `inventory_log` row per item, generates a sequential `number`, returns `{ data: order }`.
     - `POST /api/coupons/validate` → `{ data: { valid, discount, type, code, message } }`.
     - `GET /api/products/:slug` → resolve by slug.
     - `GET /api/categories/:slug` → resolve by slug.
     - `GET /api/admin/reports/*` → returns aggregated objects (sales-over-time, sales-by-category, top-products, top-customers, coupon-performance, inventory-turnover).
   - Server listens on port `4000` and prints `API: http://localhost:4000/api`.
4. Create `server/utils/` with helpers: `auth.js` (JWT sign/verify, requireAuth, requireRole), `paginate.js`, `envelope.js`, `seed-passwords.js` (one‑time util that prints bcrypt hashes for known passwords).
5. Wire `npm run server` to run `node server/server.js`. Confirm `npm run dev:all` boots both web (5173) and API (4000).
6. Document the contract briefly in `server/README.md`: collections, envelope shapes, auth, admin gating, swap path note ("Replace `VITE_API_BASE_URL` with the Laravel base URL — no client edits").

## Acceptance criteria
- [ ] `db.json` exists with all collections seeded; product count ≥ 30; reviews ≥ 50; orders ≥ 10; settings present.
- [ ] Every image URL in `db.json` is on `placehold.co` with brand colors.
- [ ] `server/server.js` runs on port 4000 via `npm run server`.
- [ ] List endpoints return `{ data, meta: { pagination } }`. Single endpoints return `{ data }`. Errors return `{ message, errors? }`.
- [ ] `/api/auth/login` returns a JWT and `/api/auth/me` validates it.
- [ ] `/api/admin/products` rejects 403 for non‑admin/manager/viewer tokens.
- [ ] `POST /api/orders` decrements stock and writes to `inventory_log`.
- [ ] `npm run dev:all` boots the web app and the API together without errors.

## Suggested commit message
`feat(api): add json-server db.json and custom Express middleware (auth, envelope, admin gate)`
