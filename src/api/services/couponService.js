import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap } from '../queryString.js';

export const couponService = {
  validate: (code, subtotal, items) =>
    http
      .post(ENDPOINTS.coupons.validate, {
        code,
        subtotal,
        ...(Array.isArray(items) && items.length ? { items } : {}),
      })
      .then(unwrap),
};

export default couponService;
