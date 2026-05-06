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
  archive: (id) =>
    http.patch(ENDPOINTS.admin.productById(id), { status: 'archived' }).then(unwrap),
  unarchive: (id) =>
    http.patch(ENDPOINTS.admin.productById(id), { status: 'active' }).then(unwrap),
  bulkArchive: (ids = []) =>
    Promise.all(
      ids.map((id) =>
        http.patch(ENDPOINTS.admin.productById(id), { status: 'archived' }),
      ),
    ),
  bulkUnarchive: (ids = []) =>
    Promise.all(
      ids.map((id) =>
        http.patch(ENDPOINTS.admin.productById(id), { status: 'active' }),
      ),
    ),
  bulkSetCategory: (ids = [], categoryId) =>
    Promise.all(
      ids.map((id) =>
        http.patch(ENDPOINTS.admin.productById(id), { categoryId }),
      ),
    ),
  bulkRemove: (ids = []) =>
    Promise.all(ids.map((id) => http.delete(ENDPOINTS.admin.productById(id)))),
  duplicate: (id) =>
    http.post(`${ENDPOINTS.admin.productById(id)}/duplicate`).then(unwrap),
};

export default adminProductService;
