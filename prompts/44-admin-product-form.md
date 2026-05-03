# Prompt 44 — Admin product add/edit form

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
Build the unified product create/edit form used by `/admin/products/new` and `/admin/products/:id`. Two‑column layout on `lg+`: main column with grouped sections, sticky right column for status/visibility. Confirm‑on‑leave when dirty. Image manager supports drag reordering of placeholder URLs.

## Tasks
1. Create `src/admin/pages/products/ProductFormPage.jsx`:
   - Detects mode by route (`new` vs id).
   - On `:id`, loads via `adminProductService.getById(id)`.
   - Sets breadcrumbs `[{label:'Catalog'}, {label:'Products', to:'/admin/products'}, {label: name || 'New product'}]`.
   - `<AdminPageHeader>` title (mode‑aware) with actions: "Cancel" (ghost), "Save" (brass primary). Save shows spinner while submitting.
2. Form structure (RHF + yup, all in one form):
   - **General**: name (required, 2–120), slug (auto from name with manual override, slug yup rule), description (rich text — for now a `TextField` multiline 8 rows), tags (chips input).
   - **Pricing**: price (required, number ≥ 0), compareAtPrice (optional ≥ price), currency (locked AED), tax class (select).
   - **Media manager**: list of image URLs (each item editable). Default rows are placehold.co templates. Reorder via drag handles (use a small custom impl with HTML5 DnD or a tiny dependency; if avoiding deps, up/down buttons). Add row, delete row. Validates each URL (must be http/https; placehold.co encouraged).
   - **Inventory**: SKU (required), stock (number ≥ 0), low‑stock threshold (default 5), allow backorder (switch).
   - **Attributes**: key/value list — color, material, dimensions (l × w × h), weight, finish. Add/remove rows.
   - **SEO**: meta title (≤ 60 chars), meta description (≤ 160), OG image URL, canonical override.
3. Sticky right column (only at `lg+`, otherwise stacks below the form):
   - **Status**: select Active / Draft / Archived.
   - **Visibility**: switches `Featured`, `Limited edition`.
   - **Organization**: category (`AppSelect` from `useCategories()`), related products (multi‑select with search).
   - **Save bar** at the bottom of the column showing "Last saved {relative time}" (mock); save action mirrors the header.
4. Confirm‑on‑leave:
   - When `formState.isDirty && !isSubmitting`, intercept `useBeforeUnload` and `useBlocker` (react‑router v6.4+ pattern with `unstable_useBlocker` if available; otherwise wrap navigation with a custom prompt). Show `<AppDialog>` "Unsaved changes — Discard / Stay".
5. Server error handling:
   - 422 → map `errors.field` to RHF `setError`. `setFocus` first invalid. Surface a top `<Alert severity="error">` for non‑field errors.
   - On success, navigate to the edit route (`/admin/products/:id`) and toast "Saved.".
6. Permissions:
   - `viewer` role: render fields disabled and hide Save button. Show a small "Read‑only" chip in header.
7. Helmet: `<Seo title="{name} | Admin" noindex />`.

## Visual / UX spec
- Section blocks use `AdminCard` with eyebrow uppercase title and subtle 1px line top border between blocks.
- Sticky right column 320px wide on `lg+`.
- Slug field shows live preview: `shop.thisinteriors.com/products/{slug}`.
- Image rows: 64×80 thumb, URL field, alt text, drag handle, delete.

## Acceptance criteria
- [ ] Both `/new` and `/:id` route to the same form.
- [ ] All sections validate per the schema; first invalid field receives focus.
- [ ] Image manager supports add/edit/reorder/delete.
- [ ] Status/visibility/organization persist correctly.
- [ ] Dirty navigation prompts "Discard / Stay".
- [ ] Saving navigates to edit route with success toast.
- [ ] Read‑only mode for `viewer` role.

## Suggested commit message
`feat(admin): add product form with media manager, inventory, attributes, SEO, confirm-on-leave`
