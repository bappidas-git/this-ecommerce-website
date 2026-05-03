# Prompt 27 — Account layout

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
Build the account area shell. Desktop: vertical sidebar with sections. Mobile: a horizontal scrollable tab bar pinned below the page header. Includes greeting, current section title, and a sign‑out button.

## Tasks
1. Create `src/components/layout/AccountLayout.jsx` and CSS module:
   - Wraps children with a `<Container maxWidth="lg">` and a 12‑column grid: 3 cols sidebar / 9 cols content at `md+`. Single column at `xs–sm` with the tab bar pinned below the page heading.
   - Greeting block at top: Cormorant "Welcome, {firstName}" + small caption "Member since {month year}".
   - Right side of greeting (desktop): `Sign out` ghost button.
2. Sidebar items (`AccountSidebar.jsx`):
   - `Profile` — `/account/profile`
   - `Orders` — `/account/orders`
   - `Addresses` — `/account/addresses`
   - `Wishlist` — `/account/wishlist`
   - `Password` — `/account/password`
   - `Preferences` — `/account/preferences`
   - Active item: brass left bar (3px), ink text; inactive: ink2 hover ink.
3. Mobile tab bar (`AccountTabs.jsx`):
   - Horizontally scrollable row of pill links matching the sidebar items.
   - Active pill: brass background, cream text; inactive: outline.
   - Auto‑scroll the active pill into view on mount.
4. Right‑side content slot: rendered via `<Outlet />`.
5. Section header inside content area:
   - Eyebrow uppercase ("MY ACCOUNT") in muted; current section title in Cormorant 28px.
   - Optional `descriptor` prop on each child page for a small kicker line.
6. Sign out:
   - On click, calls `auth.logout()`, navigates to `/`, queues a "You've signed out" toast.
7. Wire `<AccountLayout>` into the route tree under `/account/*` (already stubbed in Prompt 06) wrapped in `<RequireAuth>`.
8. Helmet: each child page sets its own title; account layout doesn't override.

## Visual / UX spec
- Sidebar background `--color-surface` with subtle `--color-line` border.
- Mobile tabs: 56px tall row, sticky to the top of the content section while scrolling that section (use `position: sticky`, `top: 72px` to clear the header).
- Greeting block padding 24px top.

## Acceptance criteria
- [ ] `/account/*` renders the layout with sidebar (desktop) and tab bar (mobile).
- [ ] Active item highlights match the current path.
- [ ] Mobile tabs are horizontally scrollable and auto‑scroll the active pill into view.
- [ ] Sign‑out button works and queues a toast.
- [ ] `<Outlet />` renders child routes; section header reads from each page.
- [ ] Layout is accessible (semantic `<aside>`/`<nav>`, current page indicated via `aria-current="page"`).

## Suggested commit message
`feat(account): add account layout with sidebar (desktop) and tab bar (mobile)`
