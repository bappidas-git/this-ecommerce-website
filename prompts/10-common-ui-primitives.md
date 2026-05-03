# Prompt 10 — Common UI primitives

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
Build the small, reusable UI primitives every later screen depends on. They wrap MUI components with brand defaults and tighter prop ergonomics so feature code stays terse and consistent.

## Tasks
Create the following components under `src/components/common/` (each in its own folder with `<Name>.jsx` + `<Name>.module.css` if styling beyond the theme is needed):

1. **AppButton** — wraps `Button`. Props: `variant` (`'primary' | 'secondary' | 'ghost' | 'danger'`), `size`, `loading` (renders inline `CircularProgress`, disables click), `icon`, `iconPosition`, `fullWidth`, `as` (link compatibility via `component={RouterLink}` when `to` provided).
2. **AppTextField** — wraps `TextField`. Adds inline error rendering (uses RHF context if available via `useFormContext`), `optional` boolean to render an "(optional)" hint, `description` for helper copy under the field, brass focus border via theme defaults.
3. **AppSelect** — wraps `Select` with `FormControl + InputLabel`. Same RHF integration. `options` prop accepts `[{ value, label }]`.
4. **AppCheckbox**, **AppRadioGroup**, **AppSwitch** — RHF‑aware wrappers; consistent label and helper text behavior.
5. **AppDialog** — wraps `Dialog`. Props: `title`, `description`, `icon`, `actions` (ReactNode), `size` (`'sm' | 'md' | 'lg'`), `dismissible` (default true). Uses Framer Motion for fade+scale entrance.
6. **AppDrawer** — wraps `Drawer` with consistent header (title + close button), scrollable body slot, sticky footer slot, focus trap, body scroll lock.
7. **AppBadge** — small pill for status (variants: `new`, `sale`, `limited`, `low-stock`, `sold-out`). Color tokens: brass (new), error (sale), emerald (limited), warning (low‑stock), muted ink (sold‑out).
8. **AppIconButton** — `IconButton` that always sets `aria-label`, supports `tooltip` prop (wraps in MUI `Tooltip` when provided), `size` defaults to `medium`.
9. **Loader** — three sizes (`sm/md/lg`), uses MUI `CircularProgress` with brass color and a subtle "Loading…" caption optional (`label` prop).
10. **EmptyState** — props: `icon`, `title`, `description`, `cta`. Centered, generous whitespace.
11. **ErrorState** — props: `title`, `description`, `onRetry`. Uses error palette, with brass primary "Try again" button.
12. **SkeletonCard** — image‑forward card skeleton matching ProductCard rough geometry (4:5 image, 2 short lines, price stub). Pulse animation.
13. **Breadcrumbs** — wraps MUI `Breadcrumbs`. `items` prop: `[{ label, to }]`. Last item is text only.
14. **Rating** — wraps `Rating`. Sizes `sm/md`. Always read‑only unless `onChange` provided. Brass star color.
15. **QuantityStepper** — `−` and `+` buttons around a number. Props: `value`, `onChange`, `min`, `max`. Disables `−` at min and `+` at max; throttles changes 250ms.
16. **Chip** — re‑exports MUI `Chip` with brand variants `solid|soft|outline` for filter chips.

Also:
- Create an index re‑export `src/components/common/index.js` so feature code can `import { AppButton, EmptyState } from 'components/common'`.
- Add a Vite alias in `vite.config.js` for `@` → `src/` (or use `jsconfig.json` with `paths`) so deep imports stay clean. Update existing imports if you choose `@/` style.
- Extend `/_kitchen-sink` (dev only) to render every primitive in all variants for visual QA.

## Visual / UX spec
- Buttons: pill radius, 44px tall, icon spacing 8px.
- Dialogs: surface background, drop shadow `--shadow-2`, border radius `--radius-md`.
- Empty/Error states have a single, large light‑weight icon and a 56‑char max kicker.
- All interactive primitives show focus‑visible ring (2px brass, 2px offset).

## Acceptance criteria
- [ ] All primitives listed exist and are exported from `src/components/common/index.js`.
- [ ] Each primitive supports keyboard interaction and visible focus.
- [ ] No inline hex; all colors come from the theme/CSS variables.
- [ ] `/_kitchen-sink` (dev) renders every primitive in every variant without console warnings.
- [ ] AppButton with `to` prop navigates via React Router (`component={RouterLink}`).

## Suggested commit message
`feat(ui): add common primitives (AppButton, AppDialog, AppDrawer, EmptyState, etc.)`
