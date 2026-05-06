import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminReviewService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.reviews, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.reviewById(id)).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.reviewById(id), payload).then(unwrap),
  bulkUpdate: ({ ids, status }) =>
    http
      .post(`${ENDPOINTS.admin.reviews}/bulk`, { ids, status })
      .then(unwrapList),
  remove: (id) => http.delete(ENDPOINTS.admin.reviewById(id)).then(unwrap),
};

export default adminReviewService;
