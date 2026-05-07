# Backend handoff — Laravel + MySQL

## Goal

Replace the json-server + Express mock under `server/` with a **Laravel +
MySQL** implementation that the React front consumes without any client-code
changes. The frontend swap is a **single env var** (`VITE_API_BASE_URL`).

## Swap step

1. Stand up the Laravel API at, e.g., `https://shop.thisinteriors.com/api/v1`.
2. In the front-end's `.env`, set:

   ```
   VITE_API_BASE_URL=https://shop.thisinteriors.com/api/v1
   ```

3. Rebuild: `npm run build`. Done.

The only client file that reads this var is **`src/api/http.js`** (line 8).
No other module in `src/` references the API URL.

## Conventions

### Response envelope

Every successful response uses the same shape:

```json
{ "data": <payload>, "meta": { ... } }
```

- `data` is the resource (object) or an array of resources.
- `meta` is optional. List endpoints **must** include
  `meta.pagination = { page, perPage, total, totalPages }`.

### Error envelope

Errors return an HTTP error status (`4xx` / `5xx`) and the body:

```json
{ "message": "Human-readable summary", "errors": { "field": ["reason"] } }
```

`errors` is optional and used for validation failures (matches Laravel's
default `ValidationException` format — keep the field-keyed array of strings).

### Query parameters

All list filters / sort / search params are **snake_case** (e.g. `per_page`,
`sort_by`, `start_date`, `category_slug`, `min_price`, `compare_previous`).

### Auth

- `Authorization: Bearer <jwt>` on every authenticated route.
- The frontend persists **two tokens**: `ti_token` (storefront) and
  `ti_admin_token` (admin). Requests to `/admin/*` send `ti_admin_token`;
  everything else sends `ti_token`. See `src/api/http.js → tokenForUrl`.
- A single Laravel guard with role claims is acceptable as long as
  `/admin/*` rejects tokens that lack an admin role.
- `401` triggers a frontend "session expired" flow; do not return `401` for
  authorization failures — use `403`.

### CORS

Allow `WEB_ORIGIN` (the deployed frontend), `Authorization`, `Content-Type`,
`Accept`. Echo `Access-Control-Allow-Credentials: true` only if you use
cookie auth — the default (Bearer) does not need it.

---

## Endpoint catalog

Roles: `guest` (no token), `customer` (storefront token), `admin` (any admin
role), `manager` (admin role with write), `viewer` (admin role read-only).
Where multiple roles can call an endpoint, the **least-privileged** is listed.

### Storefront — Auth

| Method | Path                  | Body / Query                                   | Success `data`                       | Errors                  | Role     |
| ------ | --------------------- | ---------------------------------------------- | ------------------------------------ | ----------------------- | -------- |
| POST   | `/auth/register`      | `{ name, email, password }`                    | `{ token, user }`                    | `422`                   | guest    |
| POST   | `/auth/login`         | `{ email, password }`                          | `{ token, user }`                    | `401`, `422`            | guest    |
| GET    | `/auth/me`            | —                                              | `{ user }`                           | `401`                   | customer |
| POST   | `/auth/logout`        | —                                              | `{ ok: true }`                       | `401`                   | customer |
| POST   | `/auth/forgot`        | `{ email }`                                    | `{ ok: true }`                       | `422`                   | guest    |
| POST   | `/auth/reset`         | `{ token, password }`                          | `{ ok: true }`                       | `400`, `422`            | guest    |
| PUT    | `/auth/password`      | `{ current_password, new_password }`           | `{ ok: true }`                       | `401`, `422`            | customer |
| PUT    | `/auth/preferences`   | `{ marketing_emails, order_emails, language }` | `{ user }`                           | `401`, `422`            | customer |
| DELETE | `/auth/account`       | `{ password }`                                 | `{ ok: true }`                       | `401`, `422`            | customer |

### Storefront — Catalog

| Method | Path                           | Query                                                                                                                          | Success `data`                  | Role  |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ----- |
| GET    | `/products`                    | `page, per_page, search, category_slug, min_price, max_price, in_stock, on_sale, sort_by` (`relevance|price_asc|price_desc|newest|rating`) | `Product[]` + `meta.pagination` | guest |
| GET    | `/products/:slug`              | —                                                                                                                              | `Product`                       | guest |
| GET    | `/products/:id`                | —                                                                                                                              | `Product`                       | guest |
| GET    | `/products/related/:productId` | `limit`                                                                                                                        | `Product[]`                     | guest |
| GET    | `/categories`                  | `tree` (bool — return nested)                                                                                                  | `Category[]`                    | guest |
| GET    | `/categories/:slug`            | —                                                                                                                              | `Category`                      | guest |

### Storefront — Reviews

| Method | Path        | Body / Query                                                  | Success `data`               | Errors           | Role     |
| ------ | ----------- | ------------------------------------------------------------- | ---------------------------- | ---------------- | -------- |
| GET    | `/reviews`  | `product_id, page, per_page, sort_by` (`newest|rating_desc`)  | `Review[]` + `meta.pagination` | —              | guest    |
| POST   | `/reviews`  | `{ product_id, rating, title, body }`                         | `Review`                     | `401`, `403`, `422` | customer |

`POST /reviews` is gated by purchase: `403` if the customer has not bought the
product (see `GET /orders/has-purchased`).

### Storefront — Cart helpers

| Method | Path                | Body                            | Success `data`                                                | Errors           | Role     |
| ------ | ------------------- | ------------------------------- | ------------------------------------------------------------- | ---------------- | -------- |
| POST   | `/coupons/validate` | `{ code, subtotal, items? }`    | `{ code, type: "percent|fixed", amount, min_subtotal, ... }` | `404`, `422`     | guest    |

`422` for "expired", "min subtotal not met", "usage limit reached".

### Storefront — Orders

| Method | Path                       | Body / Query                                                                                                       | Success `data`                | Errors                | Role     |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------- | --------------------- | -------- |
| GET    | `/orders`                  | `page, per_page, status`                                                                                           | `Order[]` + `meta.pagination` | `401`                 | customer |
| GET    | `/orders/:id`              | —                                                                                                                  | `Order` (with items, address) | `401`, `404`          | customer |
| POST   | `/orders`                  | `{ items:[{product_id, qty}], shipping_address_id, billing_address_id?, coupon_code?, payment:{type,token?}, notes? }` | `Order`                       | `401`, `409`, `422`   | customer |
| POST   | `/orders/:id/cancel`       | `{ reason? }`                                                                                                      | `Order`                       | `401`, `404`, `409`   | customer |
| POST   | `/orders/:id/reorder`      | —                                                                                                                  | `{ cart_items: [...] }`       | `401`, `404`          | customer |
| GET    | `/orders/has-purchased`    | `product_id`                                                                                                       | `{ has_purchased: bool }`     | `401`                 | customer |

`409` on `POST /orders` = stock conflict (see **Stock invariant**).

### Storefront — Addresses

| Method | Path                          | Body                                                | Success `data`     | Errors                     | Role     |
| ------ | ----------------------------- | --------------------------------------------------- | ------------------ | -------------------------- | -------- |
| GET    | `/addresses`                  | —                                                   | `Address[]`        | `401`                      | customer |
| POST   | `/addresses`                  | `{ name, line1, line2?, city, region, country, postal_code, phone, is_default? }` | `Address`          | `401`, `422`               | customer |
| PUT    | `/addresses/:id`              | (same as POST)                                      | `Address`          | `401`, `404`, `422`        | customer |
| DELETE | `/addresses/:id`              | —                                                   | `{ ok: true }`     | `401`, `404`               | customer |
| POST   | `/addresses/:id/default`      | —                                                   | `Address`          | `401`, `404`               | customer |

### Storefront — Wishlist

| Method | Path                       | Body                  | Success `data`            | Errors           | Role     |
| ------ | -------------------------- | --------------------- | ------------------------- | ---------------- | -------- |
| GET    | `/wishlists/me`            | —                     | `{ product_ids: number[] }` | `401`          | customer |
| POST   | `/wishlists/me/toggle`     | `{ product_id }`      | `{ product_ids: number[] }` | `401`, `422`   | customer |

### Storefront — Settings (public)

| Method | Path        | Success `data`                                                                          | Role  |
| ------ | ----------- | --------------------------------------------------------------------------------------- | ----- |
| GET    | `/settings` | `{ brand: {...}, shipping: {...}, contact: {...}, social: {...}, currency, locale, ...}` | guest |

Public projection of admin settings. Never include secrets (Stripe keys etc).

### Storefront — Contact

| Method | Path       | Body                                       | Success `data` | Errors    | Role  |
| ------ | ---------- | ------------------------------------------ | -------------- | --------- | ----- |
| POST   | `/contact` | `{ name, email, subject?, message, topic }` | `{ ok: true }` | `422`     | guest |

### Storefront — Payments

| Method | Path                  | Body                                                  | Success `data`                | Errors    | Role     |
| ------ | --------------------- | ----------------------------------------------------- | ----------------------------- | --------- | -------- |
| POST   | `/payments/simulate`  | `{ order_id, amount, card?: { brand, last4 } }`        | `{ status: "paid", txn_id }`  | `422`     | customer |

In production, replace with the real gateway's tokenization + intent endpoints.
Keep the same response shape (`status`, `txn_id`) so the front does not change.

---

### Admin — Auth

| Method | Path                | Body                          | Success `data`            | Errors        | Role  |
| ------ | ------------------- | ----------------------------- | ------------------------- | ------------- | ----- |
| POST   | `/admin/auth/login` | `{ email, password }`         | `{ token, admin_user }`   | `401`, `422`  | guest |
| GET    | `/admin/auth/me`    | —                             | `{ admin_user }`          | `401`         | admin |

### Admin — Catalog

| Method | Path                                  | Body / Query                                                     | Success `data`                    | Role     |
| ------ | ------------------------------------- | ---------------------------------------------------------------- | --------------------------------- | -------- |
| GET    | `/admin/products`                     | `page, per_page, search, status, category_id, sort_by`           | `Product[]` + `meta.pagination`   | viewer   |
| POST   | `/admin/products`                     | `Product` payload                                                | `Product`                         | manager  |
| PUT    | `/admin/products/:id`                 | `Product` payload                                                | `Product`                         | manager  |
| DELETE | `/admin/products/:id`                 | —                                                                | `{ ok: true }`                    | manager  |
| POST   | `/admin/products/bulk-archive`        | `{ ids: number[] }`                                              | `{ updated: number }`             | manager  |
| POST   | `/admin/products/bulk-update`         | `{ ids: number[], patch: { status?, category_id?, ... } }`       | `{ updated: number }`             | manager  |
| GET    | `/admin/categories`                   | `tree`                                                           | `Category[]`                      | viewer   |
| POST   | `/admin/categories`                   | `Category` payload                                               | `Category`                        | manager  |
| PUT    | `/admin/categories/:id`               | `Category` payload                                               | `Category`                        | manager  |
| DELETE | `/admin/categories/:id`               | —                                                                | `{ ok: true }`                    | manager  |
| POST   | `/admin/categories/:id/move`          | `{ parent_id: number|null, position: number }`                   | `Category`                        | manager  |
| POST   | `/admin/categories/reassign`          | `{ from_id, to_id }`                                             | `{ moved: number }`               | manager  |

### Admin — Inventory

| Method | Path                                       | Body / Query                                  | Success `data`                              | Role     |
| ------ | ------------------------------------------ | --------------------------------------------- | ------------------------------------------- | -------- |
| GET    | `/admin/inventory`                         | `page, per_page, search, low_stock_only`      | `InventoryRow[]` + `meta.pagination`        | viewer   |
| PUT    | `/admin/inventory/:productId`              | `{ stock, reorder_point? }`                   | `InventoryRow`                              | manager  |
| POST   | `/admin/inventory/:productId/adjust`       | `{ delta: number, reason: string }`           | `InventoryRow` (appends to `inventory_log`) | manager  |
| GET    | `/admin/inventory/activity`                | `page, per_page, product_id, start, end`      | `InventoryLog[]` + `meta.pagination`        | viewer   |

### Admin — Orders

| Method | Path                                      | Body / Query                                                 | Success `data`                      | Role     |
| ------ | ----------------------------------------- | ------------------------------------------------------------ | ----------------------------------- | -------- |
| GET    | `/admin/orders`                           | `page, per_page, search, status, start_date, end_date`       | `Order[]` + `meta.pagination`       | viewer   |
| GET    | `/admin/orders/:id`                       | —                                                            | `Order` (items, customer, timeline) | viewer   |
| PUT    | `/admin/orders/:id/status`                | `{ status: "pending|paid|fulfilled|delivered|cancelled" }` | `Order`                             | manager  |
| POST   | `/admin/orders/:id/notes`                 | `{ body, internal: bool }`                                   | `OrderNote`                         | manager  |
| POST   | `/admin/orders/:id/mark-paid`             | `{ method?, txn_id? }`                                       | `Order`                             | manager  |
| POST   | `/admin/orders/:id/refund`                | `{ amount, reason }` (restocks line items)                   | `Order`                             | manager  |
| POST   | `/admin/orders/:id/cancel`                | `{ reason? }` (restocks line items)                          | `Order`                             | manager  |
| GET    | `/admin/orders/export?format=csv`         | `start_date, end_date, status`                               | `text/csv` (see CSV export)         | viewer   |

### Admin — Customers

| Method | Path                                          | Body / Query                                       | Success `data`                  | Role     |
| ------ | --------------------------------------------- | -------------------------------------------------- | ------------------------------- | -------- |
| GET    | `/admin/customers`                            | `page, per_page, search, sort_by`                  | `Customer[]` + `meta.pagination`| viewer   |
| GET    | `/admin/customers/:id`                        | —                                                  | `Customer` (orders, addresses)  | viewer   |
| POST   | `/admin/customers/:id/notes`                  | `{ body }`                                         | `CustomerNote`                  | manager  |
| POST   | `/admin/customers/:id/password-reset`         | —                                                  | `{ ok: true }` (emails token)   | manager  |
| POST   | `/admin/customers/:id/disable`                | `{ disabled: bool, reason? }`                      | `Customer`                      | manager  |

### Admin — Reviews

| Method | Path                              | Body / Query                                                                | Success `data`                  | Role     |
| ------ | --------------------------------- | --------------------------------------------------------------------------- | ------------------------------- | -------- |
| GET    | `/admin/reviews`                  | `page, per_page, status, rating, product_id, search`                        | `Review[]` + `meta.pagination`  | viewer   |
| PUT    | `/admin/reviews/:id`              | `{ status: "pending|published|rejected", admin_note? }`                    | `Review`                        | manager  |
| POST   | `/admin/reviews/bulk-update`      | `{ ids: number[], patch: { status } }`                                      | `{ updated: number }`           | manager  |

### Admin — Coupons

| Method | Path                       | Body / Query                                                                                       | Success `data`                  | Role    |
| ------ | -------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------- | ------- |
| GET    | `/admin/coupons`           | `page, per_page, search, active`                                                                   | `Coupon[]` + `meta.pagination`  | viewer  |
| POST   | `/admin/coupons`           | `{ code, type:"percent|fixed", amount, min_subtotal?, starts_at?, ends_at?, usage_limit?, active }` | `Coupon`                        | manager |
| PUT    | `/admin/coupons/:id`       | (same as POST)                                                                                     | `Coupon`                        | manager |
| DELETE | `/admin/coupons/:id`       | —                                                                                                  | `{ ok: true }`                  | manager |

### Admin — Settings

Settings are grouped: `brand`, `shipping`, `contact`, `social`, `payments`,
`tax`, `seo`. The frontend reads/writes one group at a time.

| Method | Path                          | Body                | Success `data`        | Role    |
| ------ | ----------------------------- | ------------------- | --------------------- | ------- |
| GET    | `/admin/settings/:group`      | —                   | `{ <group>: {...} }`  | viewer  |
| PUT    | `/admin/settings/:group`      | `{ <group>: {...} }`| `{ <group>: {...} }`  | manager |

The public `GET /settings` (storefront) returns a sanitized projection of the
non-secret keys of every group.

### Admin — Reports

All accept `start_date`, `end_date`, `compare_previous` (bool). Comparison
endpoints return both the current and previous period under
`data.current` / `data.previous`.

| Method | Path                                     | Returns                                                |
| ------ | ---------------------------------------- | ------------------------------------------------------ |
| GET    | `/admin/reports/sales-over-time`         | Series points `{ date, revenue, orders }`              |
| GET    | `/admin/reports/sales-by-category`       | `{ category, revenue, orders }[]`                      |
| GET    | `/admin/reports/top-products`            | `{ product_id, name, units, revenue }[]`               |
| GET    | `/admin/reports/top-customers`           | `{ customer_id, name, orders, revenue }[]`             |
| GET    | `/admin/reports/coupon-performance`      | `{ code, redemptions, discount_total, revenue }[]`     |
| GET    | `/admin/reports/inventory-turnover`      | `{ product_id, name, sold, on_hand, turnover }[]`      |

Role: `viewer`.

### Admin — Users (admin team)

| Method | Path                              | Body                                                  | Success `data`                  | Role     |
| ------ | --------------------------------- | ----------------------------------------------------- | ------------------------------- | -------- |
| GET    | `/admin/users`                    | `page, per_page, search, role`                        | `AdminUser[]` + `meta.pagination`| viewer   |
| POST   | `/admin/users`                    | `{ name, email, role: "admin|manager|viewer", password }` | `AdminUser`                  | admin    |
| PUT    | `/admin/users/:id`                | `{ name?, email?, role? }`                            | `AdminUser`                     | admin    |
| DELETE | `/admin/users/:id`                | —                                                     | `{ ok: true }`                  | admin    |
| POST   | `/admin/users/:id/disable`        | `{ disabled: bool }`                                  | `AdminUser`                     | admin    |

---

## Domain models

DDL hints below are MySQL 8 / Laravel migration friendly. All tables include
`id BIGINT PK AUTO_INCREMENT`, `created_at`, `updated_at` (and `deleted_at`
where soft deletes apply). Money columns are `DECIMAL(12,2)`.

### `users` (storefront customers)

```
id, name, email UNIQUE, password (bcrypt),
phone NULL, locale, marketing_emails BOOL, order_emails BOOL,
disabled BOOL DEFAULT 0, disabled_reason NULL,
created_at, updated_at
INDEX (email)
```

### `addresses`

```
id, user_id FK→users, name, line1, line2 NULL, city, region, country,
postal_code, phone, is_default BOOL,
created_at, updated_at
INDEX (user_id), INDEX (user_id, is_default)
```

### `categories`

```
id, parent_id FK→categories NULL, name, slug UNIQUE, description TEXT,
image_url, position INT,
created_at, updated_at
INDEX (parent_id), UNIQUE (slug)
```

### `products`

```
id, slug UNIQUE, name, subtitle, description LONGTEXT, sku UNIQUE,
category_id FK→categories,
price DECIMAL(12,2), compare_at_price DECIMAL(12,2) NULL,
status ENUM('draft','active','archived'),
stock INT, reorder_point INT, weight_g INT, dimensions JSON,
materials JSON, care JSON, tags JSON,
rating_avg DECIMAL(3,2), rating_count INT,
created_at, updated_at, deleted_at
INDEX (category_id), INDEX (status), INDEX (slug), FULLTEXT (name, description)
```

### `images`

```
id, product_id FK→products, url, alt, position INT, is_primary BOOL,
created_at, updated_at
INDEX (product_id, position)
```

### `reviews`

```
id, product_id FK→products, user_id FK→users,
rating TINYINT (1..5), title, body TEXT,
status ENUM('pending','published','rejected') DEFAULT 'pending',
admin_note NULL,
created_at, updated_at
INDEX (product_id, status), INDEX (user_id)
```

### `coupons`

```
id, code UNIQUE, type ENUM('percent','fixed'), amount DECIMAL(12,2),
min_subtotal DECIMAL(12,2) NULL, starts_at NULL, ends_at NULL,
usage_limit INT NULL, used_count INT DEFAULT 0, active BOOL,
created_at, updated_at
UNIQUE (code), INDEX (active, ends_at)
```

### `orders`

```
id, number UNIQUE, user_id FK→users NULL (guest allowed),
shipping_address_id FK→addresses, billing_address_id FK→addresses NULL,
status ENUM('pending','paid','fulfilled','delivered','cancelled','refunded'),
subtotal, discount_total, shipping_total, tax_total, grand_total,
coupon_id FK→coupons NULL, currency,
payment_method, payment_txn_id NULL, paid_at NULL,
notes TEXT NULL,
created_at, updated_at
INDEX (user_id, created_at), INDEX (status), INDEX (number)
```

### `order_items`

```
id, order_id FK→orders, product_id FK→products,
name_snapshot, sku_snapshot, image_url_snapshot,
unit_price, qty, line_total,
created_at, updated_at
INDEX (order_id), INDEX (product_id)
```

Snapshots preserve the line if the product is later renamed or deleted.

### `order_notes`

```
id, order_id FK→orders, admin_user_id FK→admin_users NULL,
body TEXT, internal BOOL,
created_at
INDEX (order_id, created_at)
```

### `inventory_log`

```
id, product_id FK→products, admin_user_id FK→admin_users NULL,
delta INT, reason VARCHAR(64), source ENUM('order','adjustment','refund','cancel'),
order_id FK→orders NULL,
created_at
INDEX (product_id, created_at), INDEX (order_id)
```

### `settings`

```
id, group VARCHAR(32), key VARCHAR(64), value JSON,
is_public BOOL,
created_at, updated_at
UNIQUE (group, key)
```

### `admin_users`

```
id, name, email UNIQUE, password (bcrypt),
role ENUM('admin','manager','viewer'),
disabled BOOL DEFAULT 0, last_login_at NULL,
created_at, updated_at
UNIQUE (email)
```

### `wishlists`

```
id, user_id FK→users, product_id FK→products,
created_at
UNIQUE (user_id, product_id), INDEX (product_id)
```

---

## Authorization

The frontend uses `useCanAdminAccess(action)` to decide whether to show /
enable a write control. The matrix below must be enforced server-side too —
the front does not trust client-side gating.

| Capability                                         | admin | manager | viewer |
| -------------------------------------------------- | :---: | :-----: | :----: |
| Read all admin endpoints                           |  ✅   |   ✅    |   ✅   |
| Create / update / delete products & categories     |  ✅   |   ✅    |   ❌   |
| Inventory adjust / set                             |  ✅   |   ✅    |   ❌   |
| Order status / mark-paid / refund / cancel / notes |  ✅   |   ✅    |   ❌   |
| Review moderate                                    |  ✅   |   ✅    |   ❌   |
| Coupons create / update / delete                   |  ✅   |   ✅    |   ❌   |
| Customer disable / password reset / notes          |  ✅   |   ✅    |   ❌   |
| Settings update                                    |  ✅   |   ✅    |   ❌   |
| Admin users manage (create / role / disable)       |  ✅   |   ❌    |   ❌   |

`/admin/*` rejects any token whose role is not one of these three. Return
`403` for "authenticated but not allowed" (the front shows a calm "no access"
toast); reserve `401` for "not authenticated / token expired".

---

## Stock invariant

This is the single most important correctness rule for the backend.

- **`POST /orders`** must:
  1. Begin a transaction.
  2. Lock the affected `products` rows (`SELECT ... FOR UPDATE`).
  3. Validate `qty <= stock` for every line. If any line fails, rollback and
     return `409` with `errors: { items: [...] }` listing the offenders.
  4. Decrement `stock` for each product, insert `order_items`, insert the
     `orders` row, append one `inventory_log` row per line with
     `source = 'order'`.
  5. Commit.
- **`POST /admin/orders/:id/cancel`** and **`POST /admin/orders/:id/refund`**
  (full refund) **restore** stock atomically — increment `products.stock`,
  append `inventory_log` rows with `source = 'cancel'` / `'refund'`, and set
  the order status accordingly.
- **`POST /admin/inventory/:productId/adjust`** appends an `inventory_log`
  row with `source = 'adjustment'` and the supplied `reason`. The total of
  `inventory_log.delta` for a product must always equal `stock - initial_stock`.

A successful order **never** oversells. A cancelled / refunded order **always**
restores. Inventory adjustments are append-only — never edit historical rows.

## CSV export

`GET /admin/orders/export?format=csv` (and any future `?format=csv` endpoints)
return:

```
HTTP/1.1 200 OK
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="orders-2026-05-07.csv"
```

UTF-8 with BOM (`﻿`) is preferred so Excel opens it cleanly. Header row
required. Date columns in ISO-8601. Money columns plain decimals (no currency
symbol — currency is its own column).

## Where the swap happens

The frontend's only reference to `VITE_API_BASE_URL` is:

```js
// src/api/http.js
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
```

Every service module (`src/api/services/*.js`) calls `http.get` / `http.post`
with the **path only** (e.g. `'/products'`, `'/admin/orders'`). The endpoints
catalog at `src/api/endpoints.js` is the canonical list of paths the front
consumes — this document mirrors it.

If your Laravel routes live behind a versioned prefix (recommended:
`/api/v1`), include that prefix in `VITE_API_BASE_URL` and keep the paths
above unchanged. Do **not** edit `src/` to make the swap.
