import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminCategoryService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.categories, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.categoryById(id)).then(unwrap),
  create: (payload) => http.post(ENDPOINTS.admin.categories, payload).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.categoryById(id), payload).then(unwrap),
  remove: (id) => http.delete(ENDPOINTS.admin.categoryById(id)).then(unwrap),
};

export default adminCategoryService;
