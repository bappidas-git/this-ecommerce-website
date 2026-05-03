# THIS Interiors — Mock API

Express + json-server middleware that serves `db.json` with the same response
shape the future Laravel API will use. The frontend talks to it via
`VITE_API_BASE_URL=http://localhost:4000/api`.

## Run

```bash
npm install
npm run server          # API only        → http://localhost:4000/api
npm run dev:all         # web (5173) + API (4000)
node server/utils/build-db.js   # rebuild db.json from seed source
node server/utils/seed-passwords.js     # print bcrypt hashes
```

Default credentials (all use `Password123!`):

| Role     | Email                              |
| -------- | ---------------------------------- |
| admin    | `admin@thisinteriors.test`         |
| manager  | `manager@thisinteriors.test`       |
| viewer   | `viewer@thisinteriors.test`        |
| customer | `layla@example.com`                |
| customer | `omar@example.com`                 |

## Collections (in `db.json`)

`users`, `categories`, `products`, `reviews`, `orders`, `addresses`,
`wishlists`, `coupons`, `inventory_log`, `settings` (single object).

Seed counts: 5 / 8 / 36 / 126 / 12 / 6 / 2 / 5 / 24 / 1.

All images use `https://placehold.co/...` with brand colors
(`F7F3ED`/`1B1A17` product, `1F4034`/`F7F3ED` hero, `E5DED2`/`1B1A17`
category, `B8924F`/`F7F3ED` avatar).

## Response envelope

List endpoints:

```json
{
  "data": [ /* items */ ],
  "meta": { "pagination": { "page": 1, "perPage": 12, "total": 36, "totalPages": 3 } }
}
```

Single endpoints:

```json
{ "data": { /* item */ } }
```

Errors:

```json
{ "message": "Forbidden", "errors": { "field": "reason" } }
```

## Query parameters (snake_case)

The server translates these into json-server's expected params before
forwarding:

| Incoming         | Effect                                                |
| ---------------- | ----------------------------------------------------- |
| `page`           | page number (1-based)                                 |
| `per_page`       | items per page                                        |
| `sort`           | `name` ascending; `-price` descending; comma-separated |
| `q`              | full-text search on common fields                     |
| `category_id`    | filter by `categoryId`                                |
| `min_price`      | `price >= n`                                          |
| `max_price`      | `price <= n`                                          |
| `in_stock`       | `stock >= 1` when truthy                              |
| `on_sale`        | `isOnSale = true` when truthy                         |
| `featured`       | `isFeatured = true` when truthy                       |
| `colors`         | comma-separated, matches any of `attributes.color`    |
| `materials`      | comma-separated, matches any of `attributes.material` |

## Authentication

JWT, signed with `process.env.JWT_SECRET || 'dev-secret'`, payload
`{ id, email, role }`, expires in `7d`. Send as `Authorization: Bearer <token>`.

| Method | Path                  | Body                                         | Returns                          |
| ------ | --------------------- | -------------------------------------------- | -------------------------------- |
| POST   | `/api/auth/register`  | `firstName,lastName,email,password,phone?`   | `{ data: { user, token } }`      |
| POST   | `/api/auth/login`     | `email, password`                            | `{ data: { user, token } }`      |
| POST   | `/api/auth/forgot`    | `email`                                      | `{ data: { ok: true } }` (token logged to console) |
| POST   | `/api/auth/reset`     | `token, password`                            | `{ data: { ok: true } }`         |
| GET    | `/api/auth/me`        | —                                            | `{ data: user }`                 |
| POST   | `/api/auth/logout`    | —                                            | `{ data: { ok: true } }`         |

## Admin gating

Every `/api/admin/*` route requires a Bearer token whose `role` is one of
`admin | manager | viewer` (else 403). Write methods (`POST/PUT/PATCH/DELETE`)
require `admin | manager` (viewer is read-only).

The same json-server collections are exposed under `/api/admin/<resource>`
with the gate applied, e.g. `GET /api/admin/products`,
`PATCH /api/admin/orders/3`.

Reports (`admin | manager | viewer`):

- `GET /api/admin/reports/sales-over-time?days=30`
- `GET /api/admin/reports/sales-by-category`
- `GET /api/admin/reports/top-products?limit=10`
- `GET /api/admin/reports/top-customers?limit=10`
- `GET /api/admin/reports/coupon-performance`
- `GET /api/admin/reports/inventory-turnover`

## Custom routes

| Method | Path                          | Notes                                                  |
| ------ | ----------------------------- | ------------------------------------------------------ |
| GET    | `/api/products`               | full filter / sort / paginate (overrides json-server)  |
| GET    | `/api/products/:slug`         | resolves by `slug` (falls back to numeric `id`)        |
| GET    | `/api/categories/:slug`       | resolves by `slug` (falls back to numeric `id`)        |
| POST   | `/api/coupons/validate`       | `{ code, subtotal }` → `{ valid, discount, type, message }` |
| POST   | `/api/orders` *(auth)*        | atomic: validates stock, decrements `products.stock`, writes `inventory_log`, generates `TI-<year>-<00001>` |

## Swap path → Laravel + MySQL

The frontend never talks to anything but `VITE_API_BASE_URL`. To switch to
the real backend, change that env var to the Laravel URL — no client edits.
The Laravel API must keep:

- the `{ data, meta }` / `{ data }` envelope
- snake_case query params
- `{ message, errors? }` error shape
- JWT in `Authorization: Bearer …`
- `/api/admin/*` role enforcement
- `/api/orders` returning a sequential `number` field

The collections in `db.json` mirror the Eloquent models we will scaffold,
including foreign keys (`categoryId`, `productId`, `userId`).
