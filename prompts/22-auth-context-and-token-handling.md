# Prompt 22 — Auth context and token handling

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
Wire the storefront authentication context. It owns the customer user/session, persists `ti_token`, hydrates the user on app load, exposes login/register/logout/forgot/reset, and reacts to the `ti:auth-expired` event from the axios interceptor.

## Tasks
1. Create `src/context/AuthContext.jsx`:
   - State: `{ user, token, isLoading, isHydrating, error }`.
   - On mount (hydrating phase): if `localStorage.ti_token` exists, call `authService.me()` to validate. On success, set `user`. On 401, clear token and reset.
   - Methods:
     - `login({ email, password })` — calls `authService.login`, stores token, sets user. On success dispatch `window.dispatchEvent(new CustomEvent('ti:auth-login', { detail: user }))` so cart/wishlist contexts merge.
     - `register({ name, email, password, subscribe })` — calls `authService.register`, then auto‑logs in.
     - `logout()` — calls `authService.logout`, clears token, resets user. Dispatches `ti:auth-logout`.
     - `forgot({ email })` — calls `authService.forgot`.
     - `reset({ token, password })` — calls `authService.reset`, then optionally auto‑logs in if backend returns a token.
     - `updateUser(patch)` — local state patch (used by profile edits before they re‑hit `me`).
   - Handle the `ti:auth-expired` event by clearing token and queuing a toast "Your session has ended — please sign in again."
2. Hook `useAuth()` returns the public surface plus computed `isAuthenticated`.
3. Wire `<AuthProvider>` around `<MainLayout>` (and admin layout uses its own provider — don't share).
4. Update `RequireAuth.jsx` (already a placeholder from Prompt 06) to:
   - While `isHydrating`, render a small full‑viewport `Loader`.
   - If unauth, navigate to `/login?redirect=<encoded-path>` and queue a polite toast.
5. Update `axios` interceptor (`http.js`) so `tokenForUrl(url)` returns the **storefront** token (`ti_token`) for non‑admin paths and the admin token for `/admin/*` paths. Confirm event names match what each context listens for.
6. Cross‑context coordination:
   - On `ti:auth-login`, `CartContext` runs `MERGE_GUEST` and saves under user key; `WishlistContext` fetches server wishlist and unions with guest list.
   - On `ti:auth-logout`, `CartContext` and `WishlistContext` reset in‑memory state but don't drop user storage keys.
7. Defensive: in dev only, expose `window.__auth = { ... }` for quick debugging via `import.meta.env.DEV`. Remove for production builds.

## Acceptance criteria
- [ ] Reloading while logged in re‑hydrates the user via `/auth/me`.
- [ ] Login/register set the token, set the user, and dispatch `ti:auth-login`.
- [ ] Logout clears the token and dispatches `ti:auth-logout`.
- [ ] An expired token (forced 401) clears the session and shows a session‑expired toast.
- [ ] Cart and wishlist contexts react correctly to login/logout events.
- [ ] Admin token is never read by storefront calls and vice versa.

## Suggested commit message
`feat(auth): add AuthContext with hydration, session events, and 401 handling`
