import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminOrderService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.orders, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.orderById(id)).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.orderById(id), payload).then(unwrap),
};

export default adminOrderService;
