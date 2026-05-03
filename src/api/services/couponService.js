import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap } from '../queryString.js';

export const couponService = {
  validate: (code, subtotal) =>
    http.post(ENDPOINTS.coupons.validate, { code, subtotal }).then(unwrap),
};

export default couponService;
