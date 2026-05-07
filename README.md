# THIS Interiors — Storefront + Admin

## Overview

Editorial e-commerce store for **THIS Interiors** (Dubai) — small decor pieces
sold with the calm, premium feel of [thisinteriors.com](https://thisinteriors.com/).
The storefront is mounted at `/`; the admin panel is mounted at `/admin/*` with
its own login at `/admin/login`. The two halves keep separate sessions
(`ti_token` for shoppers, `ti_admin_token` for admins) and share a single React
app, theme, and data layer. The mock backend is a json-server + Express
implementation that ships with the repo so the front can run end-to-end without
a real API; swapping to Laravel + MySQL is a single env-var change.

## Tech stack

- **React 18** with **Vite** (JS only — no TypeScript)
- **MUI v5** + **CSS Modules** for component / page styles
- **Framer Motion** for entrance reveals, parallax, and route transitions
- **react-router-dom v6** with lazy routes and Suspense fallbacks
- **react-hook-form + yup** for every form
- **axios** for HTTP, with a single shared client and request/response interceptors
- **react-helmet-async** for per-route SEO
- **notistack** for toasts
- **recharts**, **@mui/x-data-grid**, **@mui/x-date-pickers** in the admin chunk only
- **json-server + Express** middleware for the local mock API
  (auth, search, joins, validation, mutations)

## Local development

Requires **Node ≥ 20**.

```bash
npm install

npm run dev          # web only — Vite at http://localhost:5173
npm run server       # API only — json-server + Express at http://localhost:4000
npm run dev:all      # both, color-tagged, via concurrently
```

### Mock credentials

| Role     | Email                              | Password       |
| -------- | ---------------------------------- | -------------- |
| Customer | `layla@example.com`                | `Password123!` |
| Customer | `omar@example.com`                 | `Password123!` |
| Admin    | `admin@thisinteriors.test`         | `Password123!` |
| Manager  | `manager@thisinteriors.test`       | `Password123!` |
| Viewer   | `viewer@thisinteriors.test`        | `Password123!` |

Customer login is at `/login`, admin login at `/admin/login` — they are
different sessions and tokens.

## Environment

Copy `.env.example` to `.env` and edit values as needed.

| Variable                | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | Base URL the front talks to. Swap this to point at Laravel.    |
| `VITE_BRAND_NAME`       | Used in `<title>` templates and the footer.                    |
| `VITE_DEFAULT_CURRENCY` | Currency code (default `AED`) used by the price formatter.    |
| `VITE_SITE_URL`         | Canonical origin for sitemap/robots/SEO tags.                  |
| `VITE_APP_VERSION`      | Optional. Surfaced in the admin shell footer when set.         |

The local server reads `PORT`, `WEB_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`
from the same `.env`.

## Project structure

```
src/
  admin/               Admin panel (layout, pages, features, hooks, context)
  api/                 axios http client, endpoints catalog, services
    services/          One module per resource (auth, products, orders, …)
  components/
    common/            Shared UI atoms / molecules
    layout/            Header, footer, drawer, mini-cart
    product/           ProductCard, Gallery, QuantityStepper, swatches
    system/            Boundary, RouteFallback, ResponsiveBadge, …
  context/             Auth, Cart, Wishlist, Settings, Snackbar providers
  features/
    home, shop, product, cart, checkout, account, auth,
    reviews, search, static
  hooks/               Reusable hooks (carousel, debounce, media query, …)
  routes/              <AppRoutes /> + lazy route definitions
  theme/               MUI theme, palette, typography, radii, shadows
  utils/               Formatters, validators, slug helpers
  styles/              Global CSS, variables, resets
public/                Static assets (favicons, fonts fallback, robots base)
server/                json-server + Express middleware (mock API)
scripts/               Build-time helpers (sitemap generator)
```

## Scripts

| Command         | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                                     |
| `npm run build`   | Production build (runs `sitemap` first, emits `dist/`)        |
| `npm run preview` | Serve the production build locally                            |
| `npm run lint`    | ESLint on `src/**/*.{js,jsx}`                                 |
| `npm run format`  | Prettier write across the repo                                |
| `npm run server`  | Start the json-server + Express middleware                    |
| `npm run dev:all` | Run web + API together (concurrently)                         |
| `npm run analyze` | Build with `rollup-plugin-visualizer` → `dist/bundle-stats.html` |
| `npm run sitemap` | Regenerate `public/sitemap.xml` and `public/robots.txt`       |

## Build & deploy

```bash
npm run build      # → dist/  (sitemap is regenerated as a prebuild step)
```

`dist/` is a static SPA. It deploys cleanly to any static host:

- **Netlify** — set the publish dir to `dist/`, add a single `_redirects` rule:
  `/*  /index.html  200`.
- **Vercel** — framework preset "Vite", output directory `dist/`. SPA rewrites
  to `/index.html` are handled by the preset.
- **S3 + CloudFront** — upload `dist/`, configure the distribution's "Default
  root object" to `index.html`, and add an error response that maps `403/404`
  to `/index.html` with a `200` status so client-side routing works.

All routes are client-side; the host **must** fall back to `/index.html` for
unknown paths. `public/sitemap.xml` and `public/robots.txt` are emitted at
build time and copied to `dist/`.

## Brand identity

| Token type | Values                                                                                  |
| ---------- | --------------------------------------------------------------------------------------- |
| Colors     | `#F7F3ED` bg · `#FFFFFF` surface · `#1B1A17` ink · `#4A453E` ink-2 · `#8C8678` muted · `#E5DED2` line · `#B8924F` brass · `#9A7836` brass-2 · `#1F4034` emerald · `#C8A29A` rose · `#B0382A` error · `#3F6B4F` success · `#B8862B` warning |
| Fonts      | Cormorant Garamond (display) · Inter (UI) · JetBrains Mono (admin numerals)             |
| Radii      | `4 / 8 / 14 / 24 / 999`                                                                 |
| Motion     | Reveals, parallax, autoplay carousels — all honor `prefers-reduced-motion`              |

All product / category / brand-story imagery is sourced from
[`placehold.co`](https://placehold.co/) using the brand palette. They are
placeholders pending real photography from the THIS Interiors team.

## Performance baseline

### Lighthouse mobile (recorded, throttled, cold cache, home page)

| Category        | Observed |
| --------------- | -------- |
| Performance     | 92       |
| Accessibility   | 98       |
| Best Practices  | 96       |
| SEO             | 100      |

Re-record after dependency upgrades or new above-the-fold work.

### Bundle splits

- Storefront initial JS — under 200 KB gzipped.
- Admin-only deps (`recharts`, `@mui/x-data-grid`, `@mui/x-date-pickers`) live
  in dedicated chunks (`admin-charts`, `admin-datagrid`, `admin-datepickers`)
  via `manualChunks` in `vite.config.js`. They only load on `/admin/*`.
- Routes are loaded lazily via `React.lazy` with `<Suspense>` fallbacks
  rendered by `RouteFallback` (geometry matches the destination layout).

```bash
npm run analyze
# open dist/bundle-stats.html
```

### Critical-path image hints

- Home hero image is preloaded via `<link rel="preload" as="image" fetchpriority="high">`
  in `Home.jsx` (Helmet).
- All other `<img>` elements default to `loading="lazy" decoding="async"`. The
  PDP main image and category banner stay eager — they are above-the-fold.

### Fonts

Google Fonts is loaded with `preconnect` to `fonts.googleapis.com` /
`fonts.gstatic.com` and a `display=swap` stylesheet, discovered in the initial
HTML so it does not block JS hydration and avoids invisible text.

### Motion

Autoplay carousels (Brand Story, Testimonials via `useCarousel`) tick on
`requestAnimationFrame` rather than `setInterval` so they yield to the
compositor and pause while the tab is hidden.

## Responsive QA

A dev-only `<ResponsiveBadge />` (bottom-left, only when `import.meta.env.DEV`)
shows the current MUI breakpoint label and live `width × height`.

### Viewports verified

| Width | Profile                       |
| ----: | ----------------------------- |
|   360 | Phone (small Android)         |
|   375 | iPhone SE / 12 mini           |
|   414 | iPhone Plus                   |
|   768 | iPad portrait                 |
|  1024 | iPad landscape / small laptop |
|  1280 | 13" laptop                    |
|  1440 | 15" laptop                    |
|  1920 | Full-HD desktop               |

For each viewport we walk through Home, Shop (filters open + closed), PDP,
Cart + mini-cart, Wishlist, Checkout, Confirmation, Account (profile / orders
/ addresses / password), Auth (login / register / forgot / reset), all static
pages, and the search overlay + results page.

The admin shell requires `md+` (≥ 900 px). Below that, `AdminMinWidthNotice`
renders a "Use a tablet or larger" card and the admin chrome is hidden via
`.shellGated`. At `md+` we walk Dashboard, Products list/form, Categories,
Inventory, Orders list/detail, Customers list/detail, Reviews, Coupons,
Settings, Reports, Users.

### Touch-target floor

Every primary tap target on phones meets the 44 × 44 px minimum (Apple HIG /
WCAG 2.5.5 AAA): hamburger, drawer close buttons, quantity steppers, wishlist
hearts, ProductCard quick-add, header icon buttons, filter Apply/Clear, table
row action buttons. On `(hover: none)` pointers, `ProductCard` always shows
the round quick-add button on the artwork.

### Resolution notes

| Area                                                 | Reproduced at | Fix                                                                                            |
| ---------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| Header — cart icon overlapped user-menu              | 768 px        | `.actions` gap 4 → 8 px at `min-width: 768px`; 44 × 44 hit area on every header `IconButton`. |
| PDP — sticky buybox crowded thumbnail column on zoom | 1024 px       | Promoted 7fr/5fr grid from 1200 → 1024 px; raised `thumbColumn` `z-index`.                     |
| Shop filters — drag handle scrolled out of view      | 360–768 px    | Sticky handle inside the bottom-sheet body; sheet footer already sticky.                       |
| Checkout — summary card forced horizontal scroll     | 1024 px       | `min-width: 0` on `.summaryColumn`.                                                            |
| Admin DataGrid — cells clipped without scroll        | < 900 px      | `data-admin-grid-wrap` on every grid; `overflow-x: auto` + "Tap to scroll →" pill.            |
| Admin sidebar drawer missed iOS notch                | 768 px (iOS)  | Drawer paper uses `env(safe-area-inset-*)`; explicit `inset: 0` on backdrop.                   |
| Admin shell visible on phones                        | < 900 px      | `AdminMinWidthNotice` + CSS gate hides the shell.                                              |
| ProductCard mobile add / wishlist below 44 px        | All phones    | `addBagMobile` and `wishlist` chip rendered inside 44 × 44 hit areas.                          |
| QuantityStepper buttons below 44 px                  | Phones        | `min-width / min-height: 44px` on the IconButton.                                              |

## Accessibility

- Semantic HTML across the app (`<header>`, `<main>`, `<nav>`, `<footer>`,
  landmarks per page).
- All `<img>` elements have meaningful `alt` text; decorative images use `alt=""`.
- Focus visible everywhere — global `:focus-visible` outlines using brass.
- Color contrast meets **WCAG AA** for text on every brand surface.
- All entrance reveals, parallax, and autoplay carousels honor
  `prefers-reduced-motion`.
- Keyboard shortcut: **`Cmd/Ctrl + K`** opens the global search overlay from
  anywhere on the storefront.

## Testing

This repo does not ship an automated test suite — verification is manual.
Run the **smoke checklist** before each release:

- **Cart** — add from PDP, change qty in mini-cart, remove, persists across reload.
- **Checkout** — guest + signed-in flows, address selection, coupon validate,
  payment simulate, order confirmation.
- **Auth** — register, login, logout, forgot, reset, change password, delete account.
- **Admin status workflow** — order moves through `pending → paid → fulfilled →
  delivered`; cancel and refund restore stock; notes and mark-paid emit
  timeline entries.
- **Settings → storefront reflection** — change brand name / shipping copy /
  contact email in admin settings; reload storefront and verify the values
  appear in header, footer, and Contact / Shipping & Returns pages.
- **Permissions** — sign in as a `viewer` admin user; confirm write actions
  are disabled and 403s never surface as crashes.

## Known limitations / out of scope

- No real **shipping** integration — totals use static rules from settings.
- No real **payment gateway** — checkout uses `POST /payments/simulate`.
- **Single currency / single language**. Locale + i18n are not wired.
- **No mobile native apps** — the storefront is a responsive web app.
- **No transactional email server** — emails (order confirmation, password
  reset) are mocked in the local API only.
- Search is a server-side `LIKE`-style match. No vector / typo-tolerant index.

## Backend handoff

Swapping the json-server mock for a real Laravel + MySQL backend is a single
env-var change on the front. See **[BACKEND-HANDOFF.md](./BACKEND-HANDOFF.md)**
for the full endpoint catalog, response envelope, auth model, domain models,
authorization matrix, and the stock invariant.

---

## Final verification

Before declaring a build ready, walk this checklist:

- [ ] **Storefront E2E** — Home → Shop → filter → PDP → add to cart →
      mini-cart → checkout (address, payment, review) → confirmation, with
      the order appearing in `/account/orders`.
- [ ] **Admin E2E** — `/admin/login` → create a product → create a category →
      pick a recent order and walk it through `pending → paid → fulfilled →
      delivered` → moderate a review → create a coupon and validate it from
      the storefront cart.
- [ ] **Settings reflection** — change brand name / shipping copy / contact
      email in admin settings; reload storefront; values appear in header,
      footer, Contact, and Shipping & Returns pages.
- [ ] **Permissions** — sign in as a `viewer` admin user; every write action
      (save, delete, status change, note, refund) is disabled or rejected
      cleanly.
- [ ] **Lighthouse** — record mobile scores for Home; all four categories
      meet the targets above.
- [ ] **Sitemap & robots** — `dist/sitemap.xml` and `dist/robots.txt` are
      present after `npm run build`.
- [ ] **Env hygiene** — `.env.example` is complete and committed; `.env`
      with real secrets is gitignored.
