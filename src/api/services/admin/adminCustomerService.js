import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminCustomerService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.customers, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.customerById(id)).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.customerById(id), payload).then(unwrap),
  addNote: (id, payload) =>
    http.post(ENDPOINTS.admin.customerNotes(id), payload).then(unwrap),
  sendPasswordReset: (id) =>
    http.post(ENDPOINTS.admin.customerPasswordReset(id), {}).then(unwrap),
  disable: (id, payload = { disabled: true }) =>
    http.post(ENDPOINTS.admin.customerDisable(id), payload).then(unwrap),
};

export default adminCustomerService;
