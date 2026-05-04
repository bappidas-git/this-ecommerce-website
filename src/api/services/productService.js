import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../queryString.js';

export const productService = {
  list: (filters = {}, { signal } = {}) =>
    http
      .get(buildUrl(ENDPOINTS.products.list, filters), { signal })
      .then(unwrapList),
  // Resolves to the product, or `null` for 404 / empty payloads.
  getBySlug: (slug, { signal } = {}) =>
    http
      .get(ENDPOINTS.products.bySlug(slug), { signal })
      .then(unwrap)
      .then((value) => value ?? null)
      .catch((err) => {
        if (err?.status === 404) return null;
        throw err;
      }),
  getById: (id, { signal } = {}) =>
    http.get(ENDPOINTS.products.byId(id), { signal }).then(unwrap),
  getRelated: (productId, params = {}, { signal } = {}) =>
    http
      .get(buildUrl(ENDPOINTS.products.related(productId), params), { signal })
      .then(unwrapList),
};

export default productService;
