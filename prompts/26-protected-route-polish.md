# Prompt 26 — Protected route polish

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
Polish the auth guards: `RequireAuth` (storefront) handles hydration without flicker, has a calm loading state, never causes redirect loops, and queues a toast on session expiry. Establish a parallel `RequireAdmin` (admin) that checks role permissions without leaking storefront tokens.

## Tasks
1. Refine `src/routes/RequireAuth.jsx`:
   - Read `{ user, isAuthenticated, isHydrating }` from `useAuth()`.
   - While `isHydrating`, render a centered `<Loader size="md" label="Just a moment…" />` inside the protected route's layout (preserves the page chrome to avoid flash).
   - When unauth and finished hydrating, navigate to `/login?redirect=<encoded location>` using `useLocation`. Use `replace: true` so the back button doesn't return to the protected page.
   - Queue a polite toast `Please sign in to continue.` exactly once per redirect (track via a ref so multiple `RequireAuth` re‑mounts don't double‑toast).
2. Create/refine `src/routes/RequireAdmin.jsx`:
   - Reads from `AdminAuthContext` (Prompt 39 builds it; add a placeholder context that exposes `{ user: null, isHydrating: false }` for now and mark it `// TODO Prompt 39`).
   - Behavior:
     - Hydrating → centered loader.
     - Unauthenticated → `<Navigate to="/admin/login" replace state={{ from }}/>`.
     - Authenticated but role lacks permission → render an in‑place `<EmptyState>` "You don't have access to this area." with CTA "Back to dashboard" → `/admin`. Do **not** redirect — that creates loops if the user has access to no areas.
   - Accept an optional `area` prop (e.g. `'reports' | 'users' | 'orders'`) used by the admin role gate later.
3. Add `src/hooks/useSessionExpiredHandler.js`:
   - Subscribes to `ti:auth-expired` and `ti:admin-auth-expired` window events.
   - Pushes a queued toast and triggers `auth.logout()` (or admin equivalent) silently to clear local state.
   - Mounted once in `<MainLayout>` and once in `<AdminLayout>` (admin variant runs only the admin event handler).
4. Avoid redirect loops:
   - When on `/login`, `RequireAuth` should not be applied — confirm route definitions don't accidentally wrap auth pages.
   - When on `/admin/login`, `RequireAdmin` should not be applied — confirm same.
   - In `RequireAuth`, if `redirect` decoded resolves to itself, drop the param.
5. Add a `useScrollToTop` hook that scrolls to top on `useLocation().pathname` change (skip when navigating with a hash). Mount once in `MainLayout` and `AdminLayout`. Excluding the shop's pagination scroll to top from this is fine — that's already manual.
6. Add visual polish to the loader fallback so it's not jarring: a small Cormorant "THIS Interiors" wordmark appearing above the spinner with 200 ms fade‑in delay.

## Acceptance criteria
- [ ] `RequireAuth` shows a calm hydration loader and never flashes the login page during initial mount of an authenticated session.
- [ ] Unauth visits to `/account/*` redirect to `/login?redirect=...` once and queue a single toast.
- [ ] `RequireAdmin` blocks unauth admin routes and renders an in‑place permission‑denied state for under‑privileged roles.
- [ ] No redirect loops at `/login`, `/admin/login`, or after permission denial.
- [ ] `useScrollToTop` scrolls to top on route change but respects hash navigation.

## Suggested commit message
`refactor(auth): polish RequireAuth/RequireAdmin guards with hydration, loops, scroll-to-top`
