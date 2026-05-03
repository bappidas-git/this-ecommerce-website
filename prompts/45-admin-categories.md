# Prompt 45 — Admin categories

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
Build the categories management page at `/admin/categories`: a tree view with up/down reorder controls (v1 — no full drag‑and‑drop tree), an editor panel, and a delete protection flow that requires reassigning products before removal.

## Tasks
1. Create `src/admin/pages/categories/CategoriesPage.jsx`:
   - Two columns at `lg+`: 5 cols left tree / 7 cols right editor. Single column on smaller viewports with the editor opening as a side drawer.
   - Breadcrumbs `[{label:'Catalog'}, {label:'Categories'}]`.
   - `<AdminPageHeader>` title "Categories", description, actions: "New category" (brass).
2. `CategoryTree.jsx`:
   - Renders nested categories as collapsible rows (parent → children).
   - Each row: chevron expand/collapse, image thumbnail (40×40), name, product count chip, up/down arrow buttons (reorder), edit button (selects in right pane), delete button.
   - Reorder via `adminCategoryService.move(id, { direction })` — moves within siblings only.
   - Selecting a row populates the right editor pane.
3. `CategoryEditor.jsx`:
   - RHF + yup form with: name, slug, description, image URL (default placehold.co), parent (`AppSelect` of categories excluding self/descendants), sortOrder (read‑only, controlled by reorder buttons), isActive (switch).
   - "Save" button. "Cancel" returns the form to last saved state.
   - In the create flow, the editor opens with empty defaults. After save, the new category is selected.
4. Delete protection:
   - Clicking delete on a category with child categories or products opens a `<AppDialog>`:
     - Title "Reassign before deleting".
     - Body shows count of dependent items and a `Reassign to` `AppSelect`.
     - Two‑step: "Reassign" (calls `adminCategoryService.reassign(fromId, toId)`) then "Delete" (`remove(id)`). The Delete button is disabled until reassignment completes.
   - For empty categories, show a simple confirm dialog.
5. Empty / loading / error states for both panes.
6. Helmet: `<Seo title="Categories | Admin" noindex />`.
7. Permissions: `viewer` sees the tree but write actions are hidden; editor fields are disabled.

## Visual / UX spec
- Tree row hover: brass tint 4%.
- Selected row: brass 8% tint and 2px brass left bar.
- Up/down/edit/delete buttons revealed on hover (always visible on touch).
- Editor card: 1px line border, padding 24px.

## Acceptance criteria
- [ ] Tree renders all categories nested correctly.
- [ ] Up/down reorder updates persisted order (via service) with optimistic feedback.
- [ ] Editor edits and saves; create flow appends and selects the new entry.
- [ ] Delete with dependents requires reassignment before remove.
- [ ] Permissions hide destructive actions for `viewer`.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add categories tree, editor, reorder, delete-with-reassign`
