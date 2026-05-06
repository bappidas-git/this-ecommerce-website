import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../queryString.js';

export const reviewService = {
  listForProduct: (productId, params = {}, options = {}) =>
    http
      .get(buildUrl(ENDPOINTS.reviews.list, { productId, ...params }), options)
      .then(unwrapList),
  create: (payload) => http.post(ENDPOINTS.reviews.create, payload).then(unwrap),
  toggleHelpful: (id) => http.post(ENDPOINTS.reviews.helpful(id)).then(unwrap),
};

export default reviewService;
