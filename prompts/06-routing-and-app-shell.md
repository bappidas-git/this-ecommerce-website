# Prompt 06 — Routing and app shell

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
Wire the application's full route map with nested layouts. Storefront pages share a `MainLayout` (header + footer); admin uses an `AdminLayout`; checkout uses a minimal `CheckoutLayout`. Add `RequireAuth` and `RequireAdmin` placeholders. Build a polished `NotFound` and `ServerError` page. No business logic yet — page stubs only.

## Tasks
1. Create `src/routes/paths.js` — single source of truth for every URL string in the app:
   ```js
   export const PATHS = Object.freeze({
     home: '/',
     shop: '/shop',
     category: (slug) => `/shop/${slug}`,
     product: (slug) => `/products/${slug}`,
     search: '/search',
     cart: '/cart',
     wishlist: '/wishlist',
     checkout: '/checkout',
     checkoutAddress: '/checkout/address',
     checkoutPayment: '/checkout/payment',
     checkoutReview: '/checkout/review',
     orderConfirmation: (id) => `/order/confirmation/${id}`,
     auth: { login: '/login', register: '/register', forgot: '/forgot-password', reset: '/reset-password' },
     account: {
       root: '/account', profile: '/account/profile',
       orders: '/account/orders', orderDetail: (id) => `/account/orders/${id}`,
       addresses: '/account/addresses', wishlist: '/account/wishlist',
       password: '/account/password', preferences: '/account/preferences',
     },
     about: '/about', contact: '/contact', faq: '/faq',
     privacy: '/privacy', terms: '/terms', shippingReturns: '/shipping-returns',
     admin: {
       root: '/admin', login: '/admin/login',
       dashboard: '/admin', products: '/admin/products', productNew: '/admin/products/new',
       productEdit: (id) => `/admin/products/${id}`,
       categories: '/admin/categories', inventory: '/admin/inventory',
       orders: '/admin/orders', orderDetail: (id) => `/admin/orders/${id}`,
       customers: '/admin/customers', customerDetail: (id) => `/admin/customers/${id}`,
       reviews: '/admin/reviews', coupons: '/admin/coupons',
       settings: '/admin/settings', reports: '/admin/reports', users: '/admin/users',
     },
     notFound: '*',
   });
   ```
2. Create layout stubs:
   - `src/components/layout/MainLayout.jsx` — renders `<Header />`, `<Outlet />`, `<Footer />`. Header/Footer are placeholders for now (Prompts 07/08 fill them).
   - `src/components/layout/CheckoutLayout.jsx` — minimal header (logo + secure padlock + back link), `<Outlet />`, slim footer.
   - `src/admin/layout/AdminLayout.jsx` — placeholder with sidebar + topbar shell (Prompt 41 will fill it). Wraps in `<ThemeProvider theme={adminTheme}>`.
   - `src/components/layout/AccountLayout.jsx` — sidebar (desktop) / tab bar (mobile) shell (Prompt 27 will fill it).
3. Create page stubs (one component per page) inside each `features/<area>/pages/` folder. Each stub renders `<Section><Container><h1>{name}</h1></Container></Section>` so routing works end‑to‑end.
4. Create `src/routes/RequireAuth.jsx`:
   - Reads from `AuthContext` (placeholder — returns `{ user: null, isLoading: false }` for now). If unauth, navigate to `PATHS.auth.login` with `redirect` search param. Show a small spinner during initial auth check.
5. Create `src/routes/RequireAdmin.jsx`:
   - Reads from `AdminAuthContext` placeholder. If unauth, navigate to `PATHS.admin.login`. If role lacks required permission, navigate to `/admin` with a toast (queue toast via `sessionStorage` for next mount).
6. Create `src/routes/AppRoutes.jsx` defining the nested route tree:
   - `/` → `<MainLayout>` → home, shop (with `:slug?`), product, search, cart, wishlist, auth (login/register/forgot/reset), about/contact/faq/privacy/terms/shipping‑returns.
   - `/checkout/*` → `<CheckoutLayout>` → address/payment/review (wrapped in `RequireAuth` or guest checkout context — guest is allowed).
   - `/order/confirmation/:id` → `<CheckoutLayout>`.
   - `/account/*` → `<MainLayout>` → `<AccountLayout>` → all account pages, wrapped in `RequireAuth`.
   - `/admin/login` → standalone (no AdminLayout).
   - `/admin/*` → `<RequireAdmin>` → `<AdminLayout>` → all admin pages.
   - `*` → polished NotFound.
7. Polish `NotFound.jsx`:
   - Editorial layout. Big `404` in Cormorant, eyebrow "Lost in the gallery", kicker copy "We couldn't find that page.", brass primary CTA "Return home", secondary "Browse the shop". Subtle Framer Motion fade.
8. Polish `ServerError.jsx`:
   - Same layout language with `500`, "Something went wrong", "Try again" CTA.
9. Replace `App.jsx` to render `<AppRoutes />` and remove the placeholder content.
10. Remove the temporary `/_kitchen-sink` developer route from `App.jsx` and re‑add it inside `AppRoutes` only when `import.meta.env.DEV`.

## Acceptance criteria
- [ ] `src/routes/paths.js` is the only source for URL strings.
- [ ] Every page in §5 of the master spec has a stub at the right path and renders without crashing.
- [ ] Hitting `/admin` without admin auth navigates to `/admin/login` (RequireAdmin works).
- [ ] Hitting `/account/profile` without auth navigates to `/login?redirect=...` (RequireAuth works).
- [ ] `NotFound` and `ServerError` pages are editorial and on‑brand.
- [ ] No `<a href>` to internal routes — all use `<Link to={...}>`.

## Suggested commit message
`feat(routes): wire nested layouts, RequireAuth/RequireAdmin guards, page stubs`
