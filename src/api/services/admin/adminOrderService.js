import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminOrderService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.orders, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.orderById(id)).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.orderById(id), payload).then(unwrap),
  updateStatus: (id, payload) =>
    http.post(ENDPOINTS.admin.orderStatus(id), payload).then(unwrap),
  addNote: (id, payload) =>
    http.post(ENDPOINTS.admin.orderNotes(id), payload).then(unwrap),
  markPaid: (id, payload) =>
    http.post(ENDPOINTS.admin.orderMarkPaid(id), payload).then(unwrap),
  refund: (id, payload) =>
    http.post(ENDPOINTS.admin.orderRefund(id), payload).then(unwrap),
  exportCsv: (params = {}) =>
    http
      .get(buildUrl(ENDPOINTS.admin.orders, { ...params, format: 'csv' }), {
        responseType: 'blob',
      })
      .then((res) => res.data),
};

export default adminOrderService;
