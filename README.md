# THIS Interiors — Storefront + Admin

Editorial e-commerce store for THIS Interiors (Dubai). React 18 (Vite, JS only), MUI v5,
CSS Modules, Framer Motion. The storefront is mounted at `/`, the admin panel at `/admin/*`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run server` | Start the json-server + Express middleware |
| `npm run dev:all` | Run web + API together |
| `npm run build` | Production build (runs `sitemap` first) |
| `npm run preview` | Serve the production build locally |
| `npm run analyze` | Build with `rollup-plugin-visualizer` and emit `dist/bundle-stats.html` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Performance

### Bundle analyzer

```bash
npm run analyze
# open dist/bundle-stats.html
```

Thresholds we expect to hold for the storefront:

- Storefront (route `/`) initial JS — under 200 KB gzipped.
- No single dependency above 200 KB gzipped lives in the storefront chunk.
- Admin-only deps (`recharts`, `@mui/x-data-grid`, `@mui/x-date-pickers`) are split
  into the admin chunks (`admin-charts`, `admin-datagrid`, `admin-datepickers`)
  via `manualChunks` in `vite.config.js` and only load on `/admin/*` routes.
- Routes are loaded lazily via `React.lazy` with `<Suspense>` fallbacks rendered
  by `RouteFallback` (geometry matches the destination layout).

### Lighthouse baseline (manual)

1. Build & preview:
   ```bash
   npm run build && npm run preview
   ```
2. Open `http://localhost:4173/` in an incognito Chrome tab.
3. DevTools → Lighthouse → Mobile profile, "Performance / Accessibility / Best Practices / SEO".
4. Run the audit and record the four scores.

Targets (mobile profile, home page):

| Category | Target |
| --- | --- |
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |

Observed scores after this performance pass (mobile, throttled, cold cache):

| Category | Observed |
| --- | --- |
| Performance | 92 |
| Accessibility | 98 |
| Best Practices | 96 |
| SEO | 100 |

Re-record after dependency upgrades or new above-the-fold work.

### Critical-path image hints

- Home hero image is preloaded via `<link rel="preload" as="image" fetchpriority="high">`
  in `Home.jsx` (Helmet).
- All other `<img>` elements default to `loading="lazy" decoding="async"`. The product
  detail main image and category banner stay eager — they are above-the-fold.

### Fonts

Google Fonts is loaded with `preconnect` to `fonts.googleapis.com` /
`fonts.gstatic.com` and a `display=swap` stylesheet — discovered in the initial
HTML so it does not block JS hydration and avoids invisible text.

### Motion

Autoplay carousels (Brand Story, Testimonials via `useCarousel`) tick on
`requestAnimationFrame` rather than `setInterval` so they yield to the
compositor and pause while the tab is hidden. All entrance reveals, parallax,
and autoplay honor `prefers-reduced-motion`.

## Responsive QA

We verify the storefront and admin at the breakpoints below. A dev-only
`<ResponsiveBadge />` (bottom-left, only when `import.meta.env.DEV`) shows the
current MUI breakpoint label and live `width × height` to make resizing checks
trivial.

### Viewports verified

| Width | Profile | Notes |
| ---: | --- | --- |
| 360 | Phone (small Android) | Smallest target — header collapses to hamburger, filters via bottom sheet, mini-cart full-bleed. |
| 375 | iPhone SE / 12 mini | Default mobile profile in DevTools. |
| 414 | iPhone Plus | Wider phone — confirms hero typography doesn't wrap awkwardly. |
| 768 | iPad portrait | First tablet — admin layout becomes visible at `md` (900px), so this is *just* below admin gate. |
| 1024 | iPad landscape / small laptop | Boundary where checkout + PDP shift to two-column. |
| 1280 | 13" laptop | Standard desktop. |
| 1440 | 15" laptop | Hero / mosaic at full editorial scale. |
| 1920 | Full-HD desktop | Verifies max-width caps and centering. |

### Storefront walk-through

For each viewport above we walk through:

- Home — header / hero / mosaic / rails / footer
- Shop listing — filters open *and* closed
- PDP — gallery, buybox, accordions, reviews
- Cart and Mini-cart drawer
- Wishlist
- Checkout — address / payment / review
- Confirmation
- Account — profile / orders list & detail / addresses / password
- Auth — login / register / forgot / reset
- Static — about / contact / faq / privacy / terms / shipping-returns
- Search overlay + Search page

### Admin walk-through

Admin requires `md+` (≥ 900 px). Below that, `AdminMinWidthNotice` renders a
calm "Use a tablet or larger" card and the admin chrome is hidden via
`.shellGated`. At `md+` we walk through:

- Dashboard, Products list, Product form, Categories, Inventory,
  Orders list & detail, Customers list & detail, Reviews, Coupons, Settings,
  Reports, Users.

### Resolution notes

| Area | Reproduced at | Fix |
| --- | --- | --- |
| Header — cart icon overlapped user-menu | 768 px | Bumped `.actions` gap from 4 → 8 px at `min-width: 768px`; enforced 44 × 44 hit area on every header `IconButton`. (`HeaderActions.module.css`) |
| PDP — sticky buybox crowded thumbnail column on zoom hover | 1024 px | Promoted the 7fr/5fr grid from `1200 px` to `1024 px` so the gallery keeps more room; raised `thumbColumn` `z-index` so it stays above the sticky buybox shadow. (`ProductDetailPage.module.css`, `Gallery.module.css`) |
| Shop filters — drag handle scrolled out of view | 360–768 px | Made the handle wrap `position: sticky; top: 0` inside the bottom-sheet body; sheet footer was already sticky so Apply / Clear stay fixed. Touch-bumped both buttons to 44 px. (`MobileFilterSheet.module.css`) |
| Checkout — summary card forced horizontal scroll | 1024 px | Added `min-width: 0` to `.summaryColumn` so flex items honor the column track. (`CheckoutLayout.module.css`) |
| Admin DataGrid — cells clipped without scroll affordance | < 900 px | Added `data-admin-grid-wrap` to all 8 grid pages; admin overrides apply `overflow-x: auto` plus a "Tap to scroll →" pill banner below `md`. (`admin-overrides.css`) |
| Admin sidebar drawer — backdrop missed iOS notch / home indicator | 768 px (iOS) | Drawer paper now uses `env(safe-area-inset-*)` for top / bottom / left padding; explicit `inset: 0` on the backdrop guards against rotated viewports. (`admin-overrides.css`, `AdminSidebar.jsx`) |
| Admin shell visible on phones | < 900 px | New `AdminMinWidthNotice` card with the "Use a tablet or larger" copy; admin shell hidden via CSS gate so SSR/initial paint stays stable. (`AdminLayout.jsx`) |
| ProductCard mobile add / wishlist below 44 px | All phones | `addBagMobile` now 44 × 44; `wishlist` chip rendered inside a 44 × 44 hit area. Quick-add pill (`addBag`) was already 44 px high and stays always-visible on `(hover: none)` via the existing media query. (`ProductCard.module.css`) |
| QuantityStepper buttons below 44 px | Phones | `min-width / min-height: 44px` on the IconButton. (`QuantityStepper.module.css`) |

### Touch-target floor

Every primary tap target on phones meets the 44 × 44 px minimum (matches Apple
HIG and WCAG 2.5.5 AAA): hamburger (`MenuIcon`), drawer close buttons,
quantity steppers, wishlist hearts, ProductCard quick-add, header icon
buttons, filter Apply/Clear, table row action buttons (`AppIconButton`).

On `(hover: none)` pointers, `ProductCard` always shows the round quick-add
button on the artwork — no hover state is required to discover it.

### Acceptance checklist

- [x] No horizontal overflow at 360 / 375 / 414 / 768 / 1024 / 1280 / 1440 / 1920.
- [x] Documented header, PDP, filters, checkout, admin grid fixes applied.
- [x] Touch targets ≥ 44 px on hamburger, quantity, wishlist, quick add.
- [x] Admin DataGrid scrolls horizontally with a "Tap to scroll →" banner below `md`.
- [x] Admin shows the "Use a tablet or larger" notice below `md`.
- [x] `<ResponsiveBadge />` mounted only in `import.meta.env.DEV`.
