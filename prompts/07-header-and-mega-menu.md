# Prompt 07 — Header and mega menu

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
Build the storefront `Header` — sticky, editorial, elegantly empty by default — with a configurable announcement bar, wordmark logo, primary nav with a mega‑menu for "Shop", search overlay trigger, wishlist button, cart button with badge that opens the mini‑cart drawer (placeholder ok), user menu, and a hamburger that opens the mobile drawer (Prompt 09).

## Tasks
1. Create `src/components/layout/Header/Header.jsx` and `Header.module.css`. Structure:
   - `<AnnouncementBar />` (only renders when `settings.announcement.isActive`).
   - Sticky `<AppBar>` with translucent cream background that solidifies on scroll past 8px.
   - Three‑column row: left (mobile menu button + logo), center (primary nav, hidden < md), right (icons).
2. `AnnouncementBar.jsx` (`Header/AnnouncementBar.jsx`):
   - Reads `settings.announcement` via a placeholder `useSettings()` hook (returns mocked data for now; Prompt 52 wires it to the API).
   - Slim band on emerald, 36px tall, centered text, optional link, dismiss button that persists dismissal in `sessionStorage`.
3. `Logo.jsx` (`Header/Logo.jsx`):
   - Wordmark "THIS Interiors" in Cormorant Garamond 22px, letter‑spacing 0.16em uppercased.
   - On click → `PATHS.home`.
4. `PrimaryNav.jsx` and `MegaMenu.jsx`:
   - Top‑level items: `Shop`, `New Arrivals`, `Bestsellers`, `Story`, `Journal` (Story → /about, Journal → /faq for now).
   - `Shop` opens a full‑width mega menu beneath the header on hover (desktop) or click (touch). Three columns:
     - **Browse by category** (8 categories list).
     - **Curated edits** ("New arrivals", "Bestsellers", "On sale", "Limited editions").
     - **Editorial card** featuring an image (placehold.co category card) and a "Discover" link.
   - Animate with Framer Motion `initial={{ opacity: 0, y: -6 }}` `animate={{ opacity: 1, y: 0 }}` `exit={{ opacity: 0, y: -6 }}`, duration 220ms.
   - Closes on Escape, outside click, or route change.
5. `HeaderActions.jsx`:
   - Search button (icon `Search`) → opens search overlay (Prompt 36).
   - Wishlist button (icon `FavoriteBorder`) → links to `/wishlist`. Shows count badge when wishlist has items (read placeholder count for now).
   - Cart button (icon `ShoppingBagOutlined`) → opens mini‑cart drawer (Prompt 18 placeholder ok). Shows count badge.
   - User menu button:
     - Logged out → links to `/login` (icon `PersonOutline`).
     - Logged in → opens menu with Profile, Orders, Wishlist, Sign out.
6. Subtle scroll behavior:
   - Use a small `useScrollState` hook (under `src/hooks/`) that returns `{ y, dir }`.
   - When `y > 8` add a `.scrolled` modifier (background fades from `rgba(247,243,237,0.85)` blurred to opaque `--color-bg`, bottom border becomes `1px solid var(--color-line)`).
   - Hide on scroll down past 240px, reveal on scroll up — only on `< md` to keep desktop stable.
7. Accessibility:
   - Each icon button has `aria-label`.
   - Mega menu uses `role="menu"`, items `role="menuitem"`, focus is trapped while open.
   - Cart badge uses MUI Badge with `aria-live="polite"`.
8. Wire `Header` into `MainLayout`. Replace the placeholder header used in Prompt 06.

## Visual / UX spec
- Header height 72 px desktop, 60 px mobile.
- Logo is centered‑left (column 1) on mobile; centered nav columns on desktop.
- Mega menu fills 100vw, max content width 1200px, padded 32–48px, background `--color-surface`, drop shadow `--shadow-2`.
- Hover underlines for nav links: 1px brass underline animating in from left, 200ms.

## Acceptance criteria
- [ ] Header renders on every storefront page via `MainLayout`.
- [ ] Announcement bar shows when active in settings (mocked) and dismisses for the session.
- [ ] Mega menu opens on hover/click, closes on Escape, outside click, and route change.
- [ ] Cart and wishlist badges display counts and are screen‑reader friendly.
- [ ] Header solidifies on scroll and hides/reveals correctly on mobile.
- [ ] All icons are MUI icons; `lucide-react` is used only for icons MUI lacks.

## Suggested commit message
`feat(layout): add storefront header with mega menu, search/cart/wishlist actions`
