# Prompt 09 — Mobile drawer navigation

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
Build the mobile/tablet navigation drawer that opens from the hamburger button. It includes a search field at the top, full category tree, account section, and a quiet language/currency footer note. Calm motion, full focus management.

## Tasks
1. Create `src/components/layout/MobileNavDrawer/MobileNavDrawer.jsx` and a CSS module:
   - Anchored left, full height, 88vw max 360px wide.
   - Sections (top to bottom):
     1. Top bar: brand wordmark left, close button right.
     2. Search input (full width, autofocus on open). On Enter or submit, navigate to `/search?q=...` and close.
     3. Primary nav links: Shop, New Arrivals, Bestsellers, Story, Journal.
     4. Categories accordion: collapsible "Browse by category" group listing all 8 categories.
     5. Account block: when logged out, "Sign in" / "Create account" buttons. When logged in, name + Profile/Orders/Wishlist/Sign out links.
     6. Footer note: "Designed in Dubai" + social icon row.
2. Wire it from the `Header` hamburger button via a top‑level `useUI` context (created here under `src/context/UIContext.jsx`) that exposes `{ isMobileNavOpen, openMobileNav, closeMobileNav, isCartOpen, openCart, closeCart, isSearchOpen, openSearch, closeSearch }`. Provide `<UIProvider>` once in `MainLayout`.
3. Animation:
   - Backdrop fades 220ms; panel slides from left with `translateX(-100% → 0)` 280ms `--motion-ease`.
   - Lock body scroll while open (`overflow:hidden` on `<body>`).
4. Accessibility:
   - `role="dialog"`, `aria-modal="true"`, `aria-label="Site navigation"`.
   - Focus is trapped while open; first focus goes to the search input; pressing Escape or tapping the backdrop closes.
   - Restore focus to the hamburger button on close.
5. Close drawer on route change (subscribe to `useLocation()`).
6. Hide drawer at `md+` (always closed when viewport is desktop).

## Visual / UX spec
- Background `--color-surface`, body text `--color-ink`, dividers `--color-line`.
- Eyebrow labels "BROWSE", "ACCOUNT", "FOLLOW" in muted, Inter, tracking 0.18em.
- Touch targets ≥ 44px tall.

## Acceptance criteria
- [ ] Drawer opens from the hamburger button and closes on Escape/backdrop/route change.
- [ ] Body scroll is locked while open.
- [ ] Focus is trapped; first focus is the search input; focus returns to the hamburger on close.
- [ ] Drawer never opens at `md+`.
- [ ] Categories accordion expands/collapses with chevron rotation animation.

## Suggested commit message
`feat(layout): add mobile nav drawer with search, categories, account, focus trap`
