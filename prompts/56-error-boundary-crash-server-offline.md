# Prompt 56 — Error boundary, crash, server error, and offline

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
Wrap the app in a React Error Boundary, polish the crash and server‑error pages, and add a calm offline indicator. The boundary catches runtime errors and presents an editorial "Something has gone quiet" screen with a "Try again" action.

## Tasks
1. Create `src/components/common/ErrorBoundary.jsx` (class component):
   - Catches render errors via `componentDidCatch`. State `{ hasError, error }`.
   - Resets state via a `Try again` button (recreates a key on the children).
   - On error, logs to `console.error` and (in dev) renders the error stack in a collapsible details block.
   - Renders the editorial CrashScreen below.
2. Create `src/components/common/CrashScreen.jsx`:
   - Editorial layout (Section + Container): eyebrow "Something has gone quiet", Cormorant headline "We've hit an unexpected snag.", kicker, brass primary "Try again" → calls `onRetry`, secondary "Return home" → `/`.
   - In dev, expand a `<details>` with the error name + stack monospaced.
3. Polish `ServerError.jsx` (already from Prompt 06): same visual rhythm; brass "Try again" → `window.location.reload()` and ghost "Return home".
4. Wire the boundary:
   - In `main.jsx`, wrap `<App />` (inside theme/router providers) with `<ErrorBoundary>`.
   - In `AdminLayout`, wrap `<Outlet />` with a child `<ErrorBoundary>` so an admin page crash doesn't bring the storefront down.
5. Offline handler:
   - Create `src/hooks/useOnlineStatus.js` returning `{ online }`. Subscribes to `window.online`/`offline`.
   - Create `src/components/common/OfflineBanner.jsx` rendered globally in `MainLayout`. When offline, shows a slim banner at the top: warning palette, "You're offline. Some actions may not work." Slides in/out with 200 ms.
6. axios offline guard:
   - In `http.js`, before sending requests, if `!navigator.onLine`, reject with a normalized error `{ message: 'You appear to be offline.', status: 0 }`. Skip the request (no network attempt).
   - Failures from this path are surfaced via toasts where appropriate.
7. Skipping critical paths offline:
   - On the cart page, an offline banner replaces "Apply coupon" with a disabled state and tooltip "Reconnect to apply your code.".
   - On checkout review, the "Place order" button disables while offline.
8. Lighthouse note: ensure error/offline pages pass color contrast.

## Acceptance criteria
- [ ] `<ErrorBoundary>` catches a thrown error in any storefront screen and renders `CrashScreen` with a working `Try again`.
- [ ] An admin page crash is contained inside admin and doesn't break storefront chrome.
- [ ] `useOnlineStatus` correctly tracks online/offline transitions.
- [ ] `OfflineBanner` appears/disappears in real time.
- [ ] axios short‑circuits requests when offline and surfaces a friendly error.
- [ ] Cart "Apply coupon" and checkout "Place order" disable while offline.

## Suggested commit message
`feat(reliability): add ErrorBoundary, CrashScreen, ServerError polish, OfflineBanner`
