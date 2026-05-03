import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../queryString.js';

export const reviewService = {
  listForProduct: (productId, params = {}) =>
    http
      .get(buildUrl(ENDPOINTS.reviews.list, { productId, ...params }))
      .then(unwrapList),
  create: (payload) => http.post(ENDPOINTS.reviews.create, payload).then(unwrap),
};

export default reviewService;
