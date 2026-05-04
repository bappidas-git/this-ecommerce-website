import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../queryString.js';

export const orderService = {
  list: (params = {}, options = {}) =>
    http.get(buildUrl(ENDPOINTS.orders.list, params), options).then(unwrapList),
  getById: (id, options = {}) =>
    http.get(ENDPOINTS.orders.byId(id), options).then(unwrap),
  create: (payload) => http.post(ENDPOINTS.orders.create, payload).then(unwrap),
  cancel: (id) => http.post(ENDPOINTS.orders.cancel(id)).then(unwrap),
  reorder: (id) => http.post(ENDPOINTS.orders.reorder(id)).then(unwrap),
};

export default orderService;
