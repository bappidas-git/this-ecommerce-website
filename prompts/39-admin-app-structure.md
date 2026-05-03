# Prompt 39 — Admin app structure

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
Lay the admin foundation: a separate `AdminAuthContext` keyed to `ti_admin_token`, separate endpoints already defined in `endpoints.admin`, an admin theme override scoped within `<AdminLayout>`, and a role‑gating hook the sidebar will use.

## Tasks
1. Create `src/admin/context/AdminAuthContext.jsx`:
   - Mirror `AuthContext` (Prompt 22) but with admin endpoints and `ti_admin_token` storage.
   - Methods: `login`, `logout`, `me`, `updateUser` (no register/forgot/reset — those are storefront only; password reset for admins is handled by an admin user dialog later).
   - Listens to `ti:admin-auth-expired` event from axios interceptor.
   - On login dispatches `ti:admin-auth-login`. On logout `ti:admin-auth-logout`.
   - User shape includes `role` ∈ `'admin' | 'manager' | 'viewer'`.
2. Create `src/admin/context/AdminUIContext.jsx`:
   - State: `{ isSidebarCollapsed, isMobileSidebarOpen, breadcrumbs, setBreadcrumbs }`.
   - Persists `isSidebarCollapsed` to `localStorage` (`ti_admin_sidebar_collapsed`).
3. Create `src/admin/hooks/useCanAdminAccess.js`:
   - Signature: `useCanAdminAccess(area)` where `area` ∈ `'dashboard' | 'products' | 'categories' | 'inventory' | 'orders' | 'customers' | 'reviews' | 'coupons' | 'settings' | 'reports' | 'users'`.
   - Permission matrix:
     ```js
     const PERMS = {
       admin:   ['*'],
       manager: ['dashboard', 'products', 'categories', 'inventory', 'orders', 'customers', 'reviews', 'coupons', 'settings', 'reports'],
       viewer:  ['dashboard', 'products', 'categories', 'inventory', 'orders', 'customers', 'reviews', 'reports'],
     };
     ```
   - Returns `{ canRead, canWrite }`. `viewer` is read‑only across allowed areas.
4. Refine `src/routes/RequireAdmin.jsx` to:
   - Read from `AdminAuthContext`.
   - Accept an optional `area` prop (e.g. `area="users"`).
   - When unauth → redirect to `/admin/login`.
   - When authed but `useCanAdminAccess(area).canRead === false` → render in‑place permission‑denied state.
5. Refine `src/admin/layout/AdminLayout.jsx` (placeholder created in Prompt 06):
   - Wraps children inside a nested `<ThemeProvider theme={adminTheme}>`. The admin theme:
     - Background `#0E1414` (very dark ink, leave inside `theme.palette.brand.adminBg`), surface `#16201D`, ink `#F7F3ED`, muted `#8C8678`, line `#243030`, primary brass.
     - Numerals use `var(--font-mono)` via component overrides on `MuiTableCell` and `Typography` variant `numeric`.
   - Provides `<AdminAuthProvider>` and `<AdminUIProvider>` once.
   - Placeholder shell: top bar 64px + sidebar 240px + main area. Real wiring comes in Prompt 41.
6. Update `src/api/http.js` `tokenForUrl(url)` to use the admin token for any URL containing `/admin/` (already required from Prompt 5; verify).
7. Add `src/admin/utils/adminQueryClient.js` (or a simple cache util) — just a module‑level `Map` keyed by URL+params with TTL, used by admin list pages to avoid refetch storm. Optional but lean (≤ 60 lines).
8. Wire `<RequireAdmin>` around the admin routes in `AppRoutes.jsx` if not already done. `/admin/login` route remains unwrapped.

## Acceptance criteria
- [ ] `AdminAuthContext` is fully separate from storefront `AuthContext` and uses `ti_admin_token`.
- [ ] `useCanAdminAccess` returns the correct matrix for each role.
- [ ] `RequireAdmin` blocks unauth and renders permission‑denied for under‑privileged roles.
- [ ] Admin theme is applied only inside `<AdminLayout>`; storefront theme remains unchanged.
- [ ] No leakage between storefront and admin tokens.
- [ ] Admin event names (`ti:admin-auth-*`) are listened to only by admin context.

## Suggested commit message
`feat(admin): add AdminAuthContext, AdminUIContext, role-gating hook, scoped theme`
