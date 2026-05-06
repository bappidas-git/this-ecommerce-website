import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminInventoryService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.inventory, params)).then(unwrapList),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.inventoryById(id), payload).then(unwrap),
  bulkUpdate: (items = []) =>
    http.post(ENDPOINTS.admin.inventoryBulk, { items }).then(unwrap),
  adjust: (id, payload) =>
    http.post(ENDPOINTS.admin.inventoryAdjust(id), payload).then(unwrap),
  activity: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.inventoryActivity, params)).then(unwrapList),
};

export default adminInventoryService;
