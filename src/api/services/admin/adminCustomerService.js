import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminCustomerService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.customers, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.customerById(id)).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.customerById(id), payload).then(unwrap),
};

export default adminCustomerService;
