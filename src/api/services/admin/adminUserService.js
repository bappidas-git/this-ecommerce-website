import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminUserService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.users, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.userById(id)).then(unwrap),
  create: (payload) => http.post(ENDPOINTS.admin.users, payload).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.userById(id), payload).then(unwrap),
  remove: (id) => http.delete(ENDPOINTS.admin.userById(id)).then(unwrap),
};

export default adminUserService;
