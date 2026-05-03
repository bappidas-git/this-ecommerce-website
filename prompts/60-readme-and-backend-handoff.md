# Prompt 60 — README and Laravel handoff doc

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
Write the project's `README.md` (setup/run/build/deploy/QA) and the Laravel handoff document `BACKEND-HANDOFF.md`. The handoff is the contract a backend engineer needs to ship a Laravel + MySQL implementation that the frontend swaps to with a single `.env` change.

## Tasks
1. **`README.md`** at repo root with sections:
   - **Overview** — one paragraph about the brand, the storefront, and the admin.
   - **Tech stack** — locked list (React 18 Vite JS, MUI v5, CSS Modules, Framer Motion, react‑router‑dom v6, RHF + yup, axios, json‑server + Express, recharts in admin).
   - **Local development** — Node version (`>=20`), install (`npm install`), run web only (`npm run dev`), run API only (`npm run server`), run both (`npm run dev:all`). Mock credentials (admin `admin@thisinteriors.com / Password123!`, customer `customer@thisinteriors.com / Password123!`).
   - **Environment** — `.env.example` reference (`VITE_API_BASE_URL`, `VITE_BRAND_NAME`, `VITE_DEFAULT_CURRENCY`, `VITE_SITE_URL`, optional `VITE_APP_VERSION`).
   - **Project structure** — high‑level tree (components/common, components/layout, components/product, features/*, admin/*, api/*, context/*, hooks/*, routes/*, theme/*, server/*, public/*).
   - **Scripts** — `dev`, `build`, `preview`, `lint`, `format`, `server`, `dev:all`, `analyze`, `sitemap`.
   - **Build & deploy** — `npm run build` produces `dist/`; static hosts (e.g., Netlify, Vercel, S3+CloudFront). All client‑side routing — configure host SPA fallback to `/index.html`. Sitemap is generated at build time.
   - **Brand identity** — palette, fonts, radii, motion. Brief note that all images are `placehold.co` placeholders pending real assets.
   - **Performance baseline** — recorded Lighthouse mobile scores from the perf pass.
   - **Responsive QA** — viewport checklist (from Prompt 59).
   - **Accessibility** — note that focus visible, semantic HTML, AA contrast, and reduced motion are enforced; document keyboard shortcut `Cmd/Ctrl + K` for search.
   - **Testing** — no automated test suite included; describe the manual QA checklist (smoke tests for cart, checkout, auth, admin status workflow, settings → storefront reflection).
   - **Known limitations / out of scope** — shipping integration, real payment gateway, multi‑currency/lang, mobile native apps, email server.
   - **Backend handoff** — a one‑line link to `BACKEND-HANDOFF.md`.
2. **`BACKEND-HANDOFF.md`** at repo root with sections:
   - **Goal** — Replace the json‑server mock with a Laravel + MySQL implementation. Frontend swap is a single env var; do not edit client code.
   - **Swap step** — change `VITE_API_BASE_URL` in `.env`. Rebuild. Done.
   - **Conventions**:
     - All responses use the envelope `{ data: <payload>, meta?: { ... } }`.
     - List endpoints include `meta.pagination = { page, perPage, total, totalPages }`.
     - Errors: HTTP error status with body `{ message, errors? }`.
     - Query parameters are **snake_case**.
     - Auth: Bearer JWT in `Authorization`. Two separate tokens (storefront + admin) — but a single Laravel guard with role claims is acceptable; the front sends whichever token the route requires.
   - **Endpoint catalog** — list every endpoint the front consumes. For each: HTTP method, path, query params, request body (if any), success response, error responses, role required. Include all of:
     - Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/forgot`, `POST /auth/reset`, `PUT /auth/password`, `PUT /auth/preferences`, `DELETE /auth/account`.
     - Catalog: `GET /products`, `GET /products/:slug`, `GET /products/:id`, `GET /products/related/:productId`, `GET /categories`, `GET /categories/:slug`.
     - Reviews: `GET /reviews`, `POST /reviews`.
     - Cart server‑side helpers: `POST /coupons/validate`.
     - Orders: `GET /orders`, `GET /orders/:id`, `POST /orders`, `POST /orders/:id/cancel`, `POST /orders/:id/reorder`, `GET /orders/has-purchased`.
     - Addresses: `GET /addresses`, `POST /addresses`, `PUT /addresses/:id`, `DELETE /addresses/:id`, `POST /addresses/:id/default`.
     - Wishlist: `GET /wishlists/me`, `POST /wishlists/me/toggle`.
     - Settings: `GET /settings`.
     - Contact: `POST /contact`.
     - Payments: `POST /payments/simulate` (replace with real gateway tokenization endpoints).
     - Admin auth: `POST /admin/auth/login`, `GET /admin/auth/me`.
     - Admin catalog: `GET/POST/PUT/DELETE /admin/products`, `POST /admin/products/bulk-archive`, `POST /admin/products/bulk-update`. `GET/POST/PUT/DELETE /admin/categories`, `POST /admin/categories/:id/move`, `POST /admin/categories/reassign`.
     - Admin inventory: `GET /admin/inventory`, `PUT /admin/inventory/:productId`, `POST /admin/inventory/:productId/adjust`, `GET /admin/inventory/activity`.
     - Admin orders: `GET /admin/orders`, `GET /admin/orders/:id`, `PUT /admin/orders/:id/status`, `POST /admin/orders/:id/notes`, `POST /admin/orders/:id/mark-paid`, `POST /admin/orders/:id/refund`, `POST /admin/orders/:id/cancel`, `GET /admin/orders/export?format=csv`.
     - Admin customers: `GET /admin/customers`, `GET /admin/customers/:id`, `POST /admin/customers/:id/notes`, `POST /admin/customers/:id/password-reset`, `POST /admin/customers/:id/disable`.
     - Admin reviews: `GET /admin/reviews`, `PUT /admin/reviews/:id`, `POST /admin/reviews/bulk-update`.
     - Admin coupons: `GET/POST/PUT/DELETE /admin/coupons`.
     - Admin settings: `GET/PUT /admin/settings/:group`.
     - Admin reports: `GET /admin/reports/sales-over-time`, `.../sales-by-category`, `.../top-products`, `.../top-customers`, `.../coupon-performance`, `.../inventory-turnover`. All accept `start_date`, `end_date`, `compare_previous`.
     - Admin users: `GET/POST/PUT/DELETE /admin/users`, `POST /admin/users/:id/disable`.
   - **Domain models** — minimal DDL hints for User, Address, Product, Category, Image, Review, Coupon, Order, OrderItem, OrderNote, InventoryLog, Setting, AdminUser. Indices and foreign keys called out.
   - **Authorization** — admin role gate on `/admin/*`; matrix `admin/manager/viewer` documented (matches `useCanAdminAccess`).
   - **Stock invariant** — `POST /orders` must atomically validate and decrement stock; cancel and refund actions restore stock; inventory adjustments append `inventory_log`.
   - **CSV export** — `?format=csv` returns `text/csv` with `Content-Disposition: attachment`.
   - **Where the swap happens** — `src/api/http.js` reads `VITE_API_BASE_URL`. No other client code references the URL.
3. **Verification checklist** — append a "Final verification" checklist at the bottom of `README.md`:
   - Storefront end‑to‑end (browse → PDP → add to cart → checkout → confirmation).
   - Admin end‑to‑end (login → product create → category create → order status workflow → review moderation → coupon validate from storefront).
   - Settings change reflects on storefront.
   - Permissions enforced (try a `viewer` user attempting writes).
   - Lighthouse mobile scores recorded.
   - Sitemap and robots present in `dist/`.
   - `.env.example` complete; secrets only in untracked `.env`.

## Acceptance criteria
- [ ] `README.md` covers setup, run, env, structure, scripts, build/deploy, brand, perf, responsive, a11y, QA, limitations, and backend handoff link.
- [ ] `BACKEND-HANDOFF.md` lists every endpoint with method, path, params, body, response, errors, and role.
- [ ] Both files refer to the single env var swap (`VITE_API_BASE_URL`) as the only change required.
- [ ] Domain models are clear enough that a Laravel engineer can scaffold migrations without further questions.
- [ ] Final verification checklist is present in README.

## Suggested commit message
`docs: add README and Laravel handoff with full endpoint catalog and swap instructions`
