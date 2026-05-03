# Prompt 01 — Project init and structure

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
3. After Prompt 02, no inline hex in components — use `theme.palette.*` or CSS variables.
4. Components → hooks → services → axios. Never call axios from components.
5. Mobile‑first; verify at 360, 375, 768, 1024, 1440 px.
6. Accessibility: semantic HTML, alt text, focus visible, AA contrast.
7. All placeholder images via `placehold.co` with brand colors.

## Goal of this prompt
Initialize the React 18 + Vite (JavaScript only) project, install all locked dependencies, scaffold the canonical folder structure, configure tooling (ESLint, Prettier, env), and bootstrap a minimal `App.jsx` that renders a "THIS Interiors" placeholder. No business UI yet — this is the foundation only.

## Tasks
1. Initialize Vite at the repo root with the **react** template (JavaScript): `npm create vite@latest . -- --template react`. Confirm files are `.jsx`/`.js`. If a `package.json` already exists from a previous run, preserve user changes and only add what is missing.
2. Install runtime dependencies (single `npm install` call):
   `react-router-dom @mui/material @mui/icons-material @mui/lab @mui/x-data-grid @mui/x-date-pickers @emotion/react @emotion/styled framer-motion react-hook-form yup @hookform/resolvers axios notistack react-helmet-async recharts lucide-react date-fns dayjs`
3. Install dev dependencies:
   `json-server@0.17 concurrently nodemon express cors jsonwebtoken bcryptjs eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y`
4. Create the folder structure under `src/`:
   ```
   src/
   ├── api/                # axios instance + endpoints + service files
   ├── assets/             # static assets (svg only — no images)
   ├── components/
   │   ├── common/         # primitives (AppButton, AppDialog, etc.)
   │   ├── layout/         # Header, Footer, Drawers, Layouts
   │   └── product/        # ProductCard etc.
   ├── context/            # Auth, Cart, Wishlist, Toast, Checkout, Settings
   ├── features/
   │   ├── home/
   │   ├── shop/
   │   ├── product/
   │   ├── cart/
   │   ├── checkout/
   │   ├── account/
   │   ├── auth/
   │   ├── reviews/
   │   ├── search/
   │   └── static/
   ├── admin/
   │   ├── components/
   │   ├── context/
   │   ├── features/
   │   ├── layout/
   │   └── pages/
   ├── hooks/
   ├── routes/
   ├── styles/             # globals.css, utilities.module.css
   ├── theme/              # tokens.js, index.js
   ├── utils/
   ├── App.jsx
   └── main.jsx
   ```
   Add a `.gitkeep` to any otherwise‑empty folder.
5. Create `server/` at repo root with a `.gitkeep` (Prompt 04 will fill it).
6. Create `.env.example` and `.env` (both git‑ignored except `.env.example`):
   ```
   VITE_API_BASE_URL=http://localhost:4000/api
   VITE_BRAND_NAME=THIS Interiors
   VITE_DEFAULT_CURRENCY=AED
   ```
   `import.meta.env.VITE_*` is the only env access pattern in client code.
7. Update `.gitignore` to exclude `node_modules`, `dist`, `.env`, `.DS_Store`, `coverage`, `*.log`.
8. Add ESLint (`.eslintrc.cjs`) extending `eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`, `plugin:jsx-a11y/recommended`, `prettier`. Add `.prettierrc` (single quotes, semicolons, 2‑space indent, 100 print width).
9. Update `package.json` scripts:
   - `dev` → `vite`
   - `build` → `vite build`
   - `preview` → `vite preview`
   - `lint` → `eslint "src/**/*.{js,jsx}"`
   - `format` → `prettier --write "**/*.{js,jsx,css,md,json}"`
   - `server` → `node server/server.js` (placeholder file may be empty for now)
   - `dev:all` → `concurrently -n web,api -c blue,green "npm:dev" "npm:server"`
10. Replace `src/App.jsx` and `src/main.jsx` with a minimal stub that wraps `<App />` in `BrowserRouter` and `HelmetProvider` and renders a centered "THIS Interiors" h1 plus a small "Coming soon" caption. Use no business styling yet — just inline minimal styles or a single `App.module.css`. Do not import MUI or theme yet (that lands in Prompt 02).
11. Verify `npm run dev` starts the app on `http://localhost:5173` and the page renders without console errors.

## Acceptance criteria
- [ ] `npm run dev` boots cleanly with no warnings.
- [ ] `package.json` has the exact dependency list above and the listed scripts.
- [ ] `src/` folder structure matches the tree above (empty folders contain `.gitkeep`).
- [ ] `.env.example` is committed; `.env` is git‑ignored.
- [ ] ESLint and Prettier configs exist and `npm run lint` runs without errors on the stub.
- [ ] No `.ts` or `.tsx` files anywhere in the repo.
- [ ] `App.jsx` renders "THIS Interiors" centered on the page.

## Suggested commit message
`chore(init): scaffold Vite React app, deps, folders, lint/format, env`
