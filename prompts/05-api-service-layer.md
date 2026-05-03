# Prompt 05 — API service layer

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
Build the single, swap‑ready axios service layer. After this prompt, no React component imports axios. Components use hooks; hooks use services; services use one axios instance. Replacing the json‑server backend with Laravel later requires only changing `VITE_API_BASE_URL`.

## Tasks
1. Create `src/api/http.js`:
   - Export an axios instance: `baseURL: import.meta.env.VITE_API_BASE_URL`, `timeout: 15000`, JSON content type.
   - Request interceptor: read `localStorage.getItem('ti_token')` for storefront calls and `localStorage.getItem('ti_admin_token')` for `/admin/*` paths. Attach `Authorization: Bearer ...` accordingly. Helper `tokenForUrl(url)` selects which key to use.
   - Response interceptor: pass through. On error, normalize to `{ message, errors, status }` and `throw normalized`. On 401, dispatch a `window` custom event `ti:auth-expired` (storefront) or `ti:admin-auth-expired` (admin) so contexts can react.
2. Create `src/api/endpoints.js` exporting frozen path constants — every URL the app uses lives here:
   ```js
   export const ENDPOINTS = Object.freeze({
     auth: {
       login: '/auth/login', register: '/auth/register', me: '/auth/me',
       logout: '/auth/logout', forgot: '/auth/forgot', reset: '/auth/reset',
     },
     products: { list: '/products', bySlug: (s) => `/products/${s}`, byId: (id) => `/products/${id}` },
     categories: { list: '/categories', bySlug: (s) => `/categories/${s}` },
     reviews: { list: '/reviews', create: '/reviews', byId: (id) => `/reviews/${id}` },
     orders: { list: '/orders', byId: (id) => `/orders/${id}`, create: '/orders' },
     addresses: { list: '/addresses', byId: (id) => `/addresses/${id}` },
     wishlists: { mine: '/wishlists/me' },
     coupons: { validate: '/coupons/validate' },
     settings: { public: '/settings' },
     admin: {
       login: '/admin/auth/login', me: '/admin/auth/me',
       products: '/admin/products', categories: '/admin/categories',
       inventory: '/admin/inventory', orders: '/admin/orders',
       customers: '/admin/customers', reviews: '/admin/reviews',
       coupons: '/admin/coupons', settings: '/admin/settings',
       users: '/admin/users',
       reports: {
         salesOverTime: '/admin/reports/sales-over-time',
         salesByCategory: '/admin/reports/sales-by-category',
         topProducts: '/admin/reports/top-products',
         topCustomers: '/admin/reports/top-customers',
         couponPerformance: '/admin/reports/coupon-performance',
         inventoryTurnover: '/admin/reports/inventory-turnover',
       },
     },
   });
   ```
3. Create `src/api/queryString.js`:
   - `toSnakeCase(obj)` returns a query string that converts client filter keys to snake_case (`perPage` → `per_page`, `categoryId` → `category_id`, `minPrice` → `min_price`, etc.) and skips `null/undefined/''` values; arrays → `key=a&key=b`.
   - `unwrap(response)` returns `response.data` (envelope payload) so callers don't repeat `.data.data`.
   - `unwrapList(response)` returns `{ items: response.data.data, meta: response.data.meta }`.
4. Create one service file per resource under `src/api/services/`:
   - `authService.js` — `login`, `register`, `me`, `logout`, `forgot`, `reset`.
   - `productService.js` — `list(filters)`, `getBySlug(slug)`, `getById(id)`, `getRelated(productId)`.
   - `categoryService.js` — `list()`, `getBySlug(slug)`.
   - `reviewService.js` — `listForProduct(productId, params)`, `create(payload)`.
   - `orderService.js` — `list(params)`, `getById(id)`, `create(payload)`, `cancel(id)`, `reorder(id)`.
   - `addressService.js` — `list()`, `create(payload)`, `update(id, payload)`, `remove(id)`, `setDefault(id)`.
   - `wishlistService.js` — `get()`, `toggle(productId)`.
   - `couponService.js` — `validate(code, subtotal)`.
   - `settingsService.js` — `getPublic()`.
   - `admin/` subfolder mirrors: `adminAuthService.js`, `adminProductService.js`, `adminCategoryService.js`, `adminInventoryService.js`, `adminOrderService.js`, `adminCustomerService.js`, `adminReviewService.js`, `adminCouponService.js`, `adminSettingsService.js`, `adminUserService.js`, `adminReportService.js`.
   - Every method calls `http`, returns `unwrap(...)` or `unwrapList(...)`. Method signatures take a typed object (`{ page, perPage, sort, q, ... }` etc.) and pass it through `toSnakeCase`.
5. Create `src/api/README.md` documenting:
   - The envelope (`{ data, meta }`), error shape, snake_case params, two‑token auth model.
   - **The single swap step**: change `VITE_API_BASE_URL` in `.env` to point at the Laravel base URL. No client code edits.
6. Update `.env.example` (and `.env`) so it includes a commented Laravel example:
   ```
   VITE_API_BASE_URL=http://localhost:4000/api
   # Example for Laravel: VITE_API_BASE_URL=https://shop.thisinteriors.com/api/v1
   ```

## Acceptance criteria
- [ ] `src/api/http.js` exists with both interceptors and emits the auth‑expired event on 401.
- [ ] `src/api/endpoints.js` is the only place that contains URL strings.
- [ ] Every resource has a service file under `src/api/services/` (storefront + admin).
- [ ] `toSnakeCase` correctly converts camelCase keys, drops empty values, and supports arrays.
- [ ] No React component imports `axios` directly.
- [ ] `src/api/README.md` documents the envelope and the one‑env‑var swap path.

## Suggested commit message
`feat(api): add axios instance, endpoints registry, and per‑resource service layer`
