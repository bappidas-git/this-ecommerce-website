import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminInventoryService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.inventory, params)).then(unwrapList),
  adjust: (payload) => http.post(ENDPOINTS.admin.inventory, payload).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.inventoryById(id), payload).then(unwrap),
};

export default adminInventoryService;
