import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminProductService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.products, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.productById(id)).then(unwrap),
  create: (payload) => http.post(ENDPOINTS.admin.products, payload).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.productById(id), payload).then(unwrap),
  remove: (id) => http.delete(ENDPOINTS.admin.productById(id)).then(unwrap),
};

export default adminProductService;
