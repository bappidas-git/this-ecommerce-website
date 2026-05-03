# Prompt 48 — Admin order detail

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
Build the admin order detail at `/admin/orders/:id`: items, totals, addresses, payment, a vertical status workflow stepper that drives transitions, and an internal notes timeline. Includes mark‑as‑paid, refund, and cancel actions. **Shipping is intentionally absent.**

## Tasks
1. Create `src/admin/pages/orders/OrderDetailPage.jsx`:
   - Loads via `adminOrderService.getById(id)`.
   - Breadcrumbs `[{label:'Sales'}, {label:'Orders', to:'/admin/orders'}, {label: '#' + number}]`.
   - `<AdminPageHeader>` title "Order {number}", description ("{date} • {itemCount} pieces • {total}"), right actions: status pill, "Mark as paid" (visible only when payment is pending and method is COD or bank_transfer), "Refund" (visible when paid), "Cancel order" (visible only for non‑terminal statuses).
2. Layout: 12‑column grid.
   - **Left (8 cols)**: items table, then collapsibles for shipping address (read‑only summary), billing address, payment (method, transactionId if any, paymentStatus). Then **InternalNotesTimeline** at the bottom.
   - **Right (4 cols, sticky `lg+`)**: **StatusWorkflow** vertical stepper, then totals card.
3. **StatusWorkflow.jsx** (vertical stepper):
   - Steps: `pending → confirmed → preparing → ready → completed`. `cancelled` is a side branch reachable from any non‑terminal state.
   - Render as a vertical timeline with checkmarks for completed steps, brass active step, muted future steps.
   - Each step row includes the timestamp of when the order entered that state and the user who moved it.
   - "Advance to next" button on the active step opens a small confirm dialog with optional note.
   - "Move to specific status" overflow menu lists valid transitions (validated against the state machine in `src/admin/utils/orderStateMachine.js`).
   - On confirm, calls `adminOrderService.updateStatus(id, { status, note })`. Optimistic.
4. **InternalNotesTimeline.jsx**:
   - List of notes (newest at top), each with author, timestamp, and body.
   - "Add note" composer pinned at top: textarea (max 800), `isInternal` switch defaulted true (always true for now — non‑internal notes will be customer‑visible later but are out of scope). On post, calls `adminOrderService.addNote(id, payload)`.
   - Optimistic insert with revert on error.
5. Mark‑as‑paid:
   - For COD/bank_transfer orders, opens a small dialog asking for confirmation and optional reference number; calls `adminOrderService.markPaid(id, { reference })`. Updates `paymentStatus` to `paid`.
6. Refund:
   - Opens a dialog: full or partial amount, reason. Calls `adminOrderService.refund(id, payload)`. Updates `paymentStatus` to `refunded` (full) or shows partial in a small chip.
7. Cancel order:
   - Opens a confirm dialog. On confirm, sets status to `cancelled` and **restores stock** for items via `inventory_log` entries (mock backend handles this server‑side).
8. Permissions:
   - `viewer` cannot trigger status changes, mark paid, refund, cancel, or add notes (composer hidden).
   - `manager` and `admin` can.
9. Helmet: `<Seo title="Order {number} | Admin" noindex />`.

## Visual / UX spec
- Status workflow vertical line: 2px brass connector for completed, 1px line for future.
- Timestamps use `var(--font-mono)` 12px muted.
- Totals card: subtotal, discount, tax, total — right‑aligned mono.
- Note items: avatar (placehold.co `B8924F` initials), name, "internal" tiny chip in emerald.

## Acceptance criteria
- [ ] Detail loads all order data and renders all sections.
- [ ] Status workflow advances through valid transitions and writes a note timestamp on each move.
- [ ] Mark as paid, refund, cancel actions all work and update the UI optimistically.
- [ ] Cancel restores stock (mock confirms).
- [ ] Internal notes timeline supports add and renders newest‑first.
- [ ] No shipping fields anywhere on this page.
- [ ] Permissions enforced.

## Suggested commit message
`feat(admin): add order detail with status workflow stepper, internal notes, refund/cancel`
