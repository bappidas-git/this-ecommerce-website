import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap, unwrapList } from '../queryString.js';

export const addressService = {
  list: () => http.get(ENDPOINTS.addresses.list).then(unwrapList),
  create: (payload) => http.post(ENDPOINTS.addresses.list, payload).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.addresses.byId(id), payload).then(unwrap),
  remove: (id) => http.delete(ENDPOINTS.addresses.byId(id)).then(unwrap),
  setDefault: (id) => http.post(ENDPOINTS.addresses.setDefault(id)).then(unwrap),
};

export default addressService;
