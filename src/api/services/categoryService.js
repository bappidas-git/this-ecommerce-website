import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../queryString.js';

export const categoryService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.categories.list, params)).then(unwrapList),
  getBySlug: (slug) => http.get(ENDPOINTS.categories.bySlug(slug)).then(unwrap),
};

export default categoryService;
