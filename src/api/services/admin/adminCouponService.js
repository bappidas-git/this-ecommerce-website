import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

export const adminCouponService = {
  list: (params = {}) =>
    http.get(buildUrl(ENDPOINTS.admin.coupons, params)).then(unwrapList),
  getById: (id) => http.get(ENDPOINTS.admin.couponById(id)).then(unwrap),
  create: (payload) => http.post(ENDPOINTS.admin.coupons, payload).then(unwrap),
  update: (id, payload) =>
    http.patch(ENDPOINTS.admin.couponById(id), payload).then(unwrap),
  remove: (id) => http.delete(ENDPOINTS.admin.couponById(id)).then(unwrap),
};

export default adminCouponService;
