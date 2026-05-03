# THIS Interiors — API service layer

Single, swap-ready axios layer used by the entire app. **No React component
imports `axios` directly.** Components use hooks → hooks call services →
services use the one axios instance in `http.js`.

```
components ──▶ hooks ──▶ services ──▶ http (axios)
```

## Files

| File                          | Role                                                       |
| ----------------------------- | ---------------------------------------------------------- |
| `http.js`                     | Single axios instance + interceptors + auth-expired events |
| `endpoints.js`                | Frozen registry of every URL the app uses                  |
| `queryString.js`              | `toSnakeCase`, `buildUrl`, `unwrap`, `unwrapList`          |
| `services/*.js`               | One file per storefront resource                           |
| `services/admin/*.js`         | Mirrored services for `/admin/*`                           |
| `index.js`                    | Convenience re-exports                                     |

## Response envelope

The mock API and the future Laravel API both return the same shapes. Services
strip the envelope so callers receive plain payloads.

```json
// list endpoints
{ "data": [ /* items */ ], "meta": { "pagination": { "page": 1, "perPage": 12, "total": 36, "totalPages": 3 } } }

// single endpoints
{ "data": { /* item */ } }

// errors
{ "message": "Forbidden", "errors": { "field": "reason" } }
```

| Helper          | Returns                                            |
| --------------- | -------------------------------------------------- |
| `unwrap(res)`   | `res.data.data` — the payload                      |
| `unwrapList(res)` | `{ items: res.data.data, meta: res.data.meta }`  |
| `unwrapEnvelope(res)` | `res.data` — the full envelope when needed   |

## Error shape

Any rejected request is normalized to a real `Error` with extra fields:

```js
{ message: 'Invalid credentials', errors: { email: 'taken' } | null, status: 401 }
```

Catch with `try/catch` or `.catch(err => …)` — `err.message`, `err.errors`,
`err.status` are always present.

## Query parameters (snake_case)

Pass camelCase to services; `toSnakeCase` converts to wire format:

| Client        | Wire           |
| ------------- | -------------- |
| `perPage`     | `per_page`     |
| `categoryId`  | `category_id`  |
| `minPrice`    | `min_price`    |
| `maxPrice`    | `max_price`    |
| `inStock`     | `in_stock`     |
| `onSale`      | `on_sale`      |

Rules:

- `null`, `undefined`, `''` are skipped
- arrays serialize as repeated keys (`colors=brass&colors=ink`)
- booleans become `'true' | 'false'`
- `Date` instances become ISO strings

## Two-token auth model

Two independent sessions live in `localStorage`:

| Key              | Used for                          |
| ---------------- | --------------------------------- |
| `ti_token`       | Storefront — customer JWT         |
| `ti_admin_token` | Admin (`/admin/*`) — staff JWT    |

The request interceptor reads whichever token matches the request URL
(`tokenForUrl(url)`) and attaches `Authorization: Bearer <token>`.

On `401`, the response interceptor dispatches a window event so the matching
context can sign the user out:

| Path            | Event dispatched          |
| --------------- | ------------------------- |
| storefront      | `ti:auth-expired`         |
| `/admin/*`      | `ti:admin-auth-expired`   |

## Usage from a hook

```js
import { useEffect, useState } from 'react';
import { productService } from '@/api/services';

export function useProducts(filters) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    productService.list(filters).then(({ items, meta }) => {
      setItems(items);
      setMeta(meta);
    });
  }, [filters]);
  return { items, meta };
}
```

## Swap path → Laravel + MySQL

There is **one** swap step. Change `VITE_API_BASE_URL` in `.env` to the
Laravel base URL — restart `vite` — done. No client code edits.

```
# .env (mock)
VITE_API_BASE_URL=http://localhost:4000/api

# .env (Laravel)
VITE_API_BASE_URL=https://shop.thisinteriors.com/api/v1
```

The Laravel API must keep:

- the `{ data, meta }` / `{ data }` envelope
- `{ message, errors? }` error shape
- snake_case query params
- JWT in `Authorization: Bearer <token>`
- `/admin/*` role enforcement
