import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../queryString.js';

export const productService = {
  list: (filters = {}) =>
    http.get(buildUrl(ENDPOINTS.products.list, filters)).then(unwrapList),
  getBySlug: (slug) => http.get(ENDPOINTS.products.bySlug(slug)).then(unwrap),
  getById: (id) => http.get(ENDPOINTS.products.byId(id)).then(unwrap),
  getRelated: (productId, params = {}) =>
    http
      .get(buildUrl(ENDPOINTS.products.related(productId), params))
      .then(unwrapList),
};

export default productService;
