import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap } from '../queryString.js';

export const wishlistService = {
  get: () => http.get(ENDPOINTS.wishlists.mine).then(unwrap),
  toggle: (productId) =>
    http.post(ENDPOINTS.wishlists.toggle, { productId }).then(unwrap),
};

export default wishlistService;
