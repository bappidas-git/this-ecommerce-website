# Prompt 02 — MUI theme and design tokens

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
3. After this prompt, no inline hex in components — use `theme.palette.*` or CSS variables.
4. Components → hooks → services → axios. Never call axios from components.
5. Mobile‑first; verify at 360, 375, 768, 1024, 1440 px.
6. Accessibility: semantic HTML, alt text, focus visible, AA contrast.
7. All placeholder images via `placehold.co` with brand colors.

## Goal of this prompt
Define the design token source of truth and wire MUI v5 to it: a single `tokens.js`, a `theme/index.js` that builds the MUI theme from those tokens, MUI `<ThemeProvider>` + `<CssBaseline>` in `main.jsx`, and a `globals.css` that exposes the same tokens as CSS variables (so CSS Modules can consume the same palette).

## Tasks
1. Create `src/theme/tokens.js` exporting a frozen object `tokens`:
   ```js
   export const tokens = Object.freeze({
     color: {
       bg: '#F7F3ED', surface: '#FFFFFF',
       ink: '#1B1A17', ink2: '#4A453E', muted: '#8C8678', line: '#E5DED2',
       brass: '#B8924F', brass2: '#9A7836',
       emerald: '#1F4034', rose: '#C8A29A',
       error: '#B0382A', success: '#3F6B4F', warning: '#B8862B',
     },
     font: {
       display: '"Cormorant Garamond", Georgia, serif',
       body: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
       mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
     },
     radius: { xs: 4, sm: 8, md: 14, lg: 24, pill: 999 },
     shadow: {
       1: '0 1px 2px rgba(27,26,23,0.06)',
       2: '0 6px 20px rgba(27,26,23,0.08)',
       3: '0 18px 40px rgba(27,26,23,0.10)',
     },
     motion: { fast: 180, base: 280, slow: 500, ease: 'cubic-bezier(0.2,0.6,0.2,1)' },
   });
   ```
2. Create `src/theme/index.js`. Build the MUI theme from tokens:
   - `palette.mode = 'light'`
   - `palette.primary.main = brass`, `dark = brass2`, `contrastText = bg`
   - `palette.secondary.main = emerald`
   - `palette.error.main = error`, `success.main = success`, `warning.main = warning`
   - `palette.background.default = bg`, `paper = surface`
   - `palette.text.primary = ink`, `secondary = ink2`
   - `palette.divider = line`
   - Custom palette extensions: `palette.brand = { brass, brass2, emerald, rose, ink2, muted, line, bg, surface }`
   - Typography: `fontFamily = tokens.font.body`. Display variants (`h1`–`h4`) use `tokens.font.display`, weight 500, letter‑spacing −0.01em. `button` no uppercase, weight 500.
   - `shape.borderRadius = tokens.radius.sm`
   - Component overrides (defaults that match the brand):
     - `MuiButton`: `disableElevation: true`; root has `borderRadius: tokens.radius.pill`, `paddingInline: 24`, `minHeight: 44`. `containedPrimary` background brass, hover brass2.
     - `MuiPaper`: `defaultProps.elevation = 0`; `root.borderColor = line` when outlined.
     - `MuiAppBar`: `defaultProps.color = 'transparent'`, `elevation = 0`.
     - `MuiTextField`: `defaultProps.size = 'medium'`, `variant = 'outlined'`.
     - `MuiOutlinedInput`: `borderRadius: tokens.radius.sm`, hover/active border brass.
     - `MuiChip`: `borderRadius: tokens.radius.pill`.
     - `MuiTooltip`: dark ink background, surface text.
     - `MuiLink`: `defaultProps.underline = 'hover'`, color ink2, hover ink.
     - `MuiContainer`: `defaultProps.maxWidth = 'lg'`.
   - Export `theme` (storefront) and a thin variant `adminTheme` that is identical for now — Prompt 39 will refine it.
3. Create `src/styles/globals.css`. At the top:
   - Google Fonts `@import` for Cormorant Garamond (400,500,600), Inter (300,400,500,600), JetBrains Mono (400,500).
   - `:root` block with CSS variables mirroring `tokens`: `--color-bg`, `--color-surface`, `--color-ink`, `--color-ink-2`, `--color-muted`, `--color-line`, `--color-brass`, `--color-brass-2`, `--color-emerald`, `--color-rose`, `--color-error`, `--color-success`, `--color-warning`, plus `--radius-*`, `--shadow-*`, `--font-display`, `--font-body`, `--font-mono`, `--motion-base`, `--motion-ease`.
   - Resets: `*,*::before,*::after { box-sizing: border-box; }`, `html,body,#root { height: 100%; }`, `body { margin: 0; background: var(--color-bg); color: var(--color-ink); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }`
   - Selection color uses brass with bg text.
   - `:focus-visible` outline 2px brass, offset 2px.
4. Create `src/styles/utilities.module.css` (minimal — Prompt 03 will expand): `.srOnly` (visually hidden), `.flexCenter`, `.stack` (flex column gap 16).
5. Update `src/main.jsx` to:
   - Import `./styles/globals.css` first.
   - Wrap `<App />` in `<HelmetProvider>` + `<ThemeProvider theme={theme}>` + `<CssBaseline />` + `<BrowserRouter>`.
6. Update `src/App.jsx` to render a centered MUI `<Container>` with an `<h1>` "THIS Interiors" using `font-family: var(--font-display)` and a `<Typography variant="body2" color="text.secondary">` "Coming soon".
7. Add a quick visual sanity check: confirm fonts load, brass primary buttons render correctly (drop a temporary `<Button variant="contained">Shop the collection</Button>` then remove).

## Visual / UX spec
- Page background `--color-bg` (cream). Default text `--color-ink`. Display heading uses Cormorant Garamond.
- Primary buttons: brass background, cream text, pill radius, no shadow.
- Outlined inputs: 1px line border, brass focus.

## Acceptance criteria
- [ ] `src/theme/tokens.js` and `src/theme/index.js` exist and export the documented values.
- [ ] `src/styles/globals.css` defines all CSS variables and imports the three Google Fonts.
- [ ] `<ThemeProvider>` + `<CssBaseline>` wrap the app in `main.jsx`.
- [ ] Cream background, ink text, Cormorant heading, Inter body all render.
- [ ] No new `.ts`/`.tsx` files; no inline hex in `App.jsx`.

## Suggested commit message
`feat(theme): add MUI v5 theme, design tokens, and global CSS variables`
