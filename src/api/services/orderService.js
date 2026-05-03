import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../queryString.js';

export const orderService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.orders.list, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.orders.byId(id)).then(unwrap),
  create: (payload) => http.post(ENDPOINTS.orders.create, payload).then(unwrap),
  cancel: (id) => http.post(ENDPOINTS.orders.cancel(id)).then(unwrap),
  reorder: (id) => http.post(ENDPOINTS.orders.reorder(id)).then(unwrap),
};

export default orderService;
