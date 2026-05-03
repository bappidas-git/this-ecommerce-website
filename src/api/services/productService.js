import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../queryString.js';

export const productService = {
  list: (filters = {}, { signal } = {}) =>
    http
      .get(buildUrl(ENDPOINTS.products.list, filters), { signal })
      .then(unwrapList),
  getBySlug: (slug, { signal } = {}) =>
    http.get(ENDPOINTS.products.bySlug(slug), { signal }).then(unwrap),
  getById: (id, { signal } = {}) =>
    http.get(ENDPOINTS.products.byId(id), { signal }).then(unwrap),
  getRelated: (productId, params = {}, { signal } = {}) =>
    http
      .get(buildUrl(ENDPOINTS.products.related(productId), params), { signal })
      .then(unwrapList),
};

export default productService;
