# Prompt 41 — Admin layout

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
Build the admin layout: a collapsible dark sidebar grouped by section, a topbar with breadcrumbs and the admin user menu, a mobile drawer variant, and a content area that stretches gracefully on large screens.

## Tasks
1. Refine `src/admin/layout/AdminLayout.jsx`:
   - Three regions: sidebar (left), topbar (top), main content (right of sidebar, below topbar).
   - Wraps in `<ThemeProvider theme={adminTheme}>` (already from Prompt 39).
2. `AdminSidebar.jsx`:
   - Sections (eyebrow uppercase muted) with items, role‑gated by `useCanAdminAccess`:
     - **Overview**: Dashboard (`/admin`).
     - **Catalog**: Products, Categories, Inventory.
     - **Sales**: Orders, Coupons.
     - **People**: Customers, Reviews.
     - **Site**: Settings, Reports, Users (admin role only).
   - Width 240px expanded / 72px collapsed (icons only with tooltips).
   - Active item: brass left bar 3px, brass icon, ink (cream) text.
   - Bottom: collapse toggle button.
   - Mobile (`< md`): sidebar is hidden by default; opens from a hamburger in the topbar (`AdminUIContext.openMobileSidebar`). Slides from left, dimmed backdrop.
3. `AdminTopbar.jsx`:
   - Left (mobile): hamburger button.
   - Center‑left: page breadcrumbs reading from `AdminUIContext.breadcrumbs` (each page calls `setBreadcrumbs([{label,to},...])` on mount).
   - Right cluster: a small notification bell (placeholder, opens an empty popover with "All caught up"), a search input (placeholder, opens an admin command palette later), and the admin user menu.
   - Admin user menu:
     - Avatar (placehold.co `B8924F` initials), name, role pill.
     - Items: Profile (placeholder), Switch to storefront (opens `/` in new tab), Sign out.
4. Shell behavior:
   - Sidebar collapse persists via `AdminUIContext`.
   - Topbar height 64px; sidebar starts at top: 0 (with topbar overlapping in z‑order so the "TI Admin" mark sits at the corner).
   - Main content uses `<Container maxWidth="xl">` with horizontal padding 24px desktop / 16px mobile.
   - Outlet at the bottom: `<Outlet />`.
5. Section header (page chrome):
   - Create `src/admin/components/AdminPageHeader.jsx` consumed by every admin page:
     - Props: `title`, `description`, `actions`, `eyebrow`.
     - Renders a small horizontal flex row with eyebrow above title, optional description below, and actions on the right. Includes a thin 1px line border bottom.
6. Mobile QA notes:
   - Sidebar drawer locks body scroll while open and traps focus.
   - Mobile topbar is sticky with reduced shadow when scrolled.

## Visual / UX spec
- Sidebar background admin surface (`#16201D`), text cream, dividers 1px `#243030`.
- Active item background uses a 6% brass tint.
- Topbar background admin bg (`#0E1414`) with 1px bottom border.
- Numerals (e.g. counts in nav) use `var(--font-mono)`.

## Acceptance criteria
- [ ] Admin layout renders sidebar + topbar + outlet content correctly on `md+`.
- [ ] Sidebar collapses to 72px and persists across reloads.
- [ ] Mobile drawer opens from hamburger; backdrop closes; focus trapped.
- [ ] Sidebar items hide based on `useCanAdminAccess`.
- [ ] Breadcrumbs update from each page via `AdminUIContext.setBreadcrumbs`.
- [ ] Numerals in nav use the mono font; admin theme stays scoped.

## Suggested commit message
`feat(admin): add admin layout, dark sidebar with role gating, topbar with breadcrumbs`
