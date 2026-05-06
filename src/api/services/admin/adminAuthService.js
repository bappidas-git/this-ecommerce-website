import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap } from '../../queryString.js';

export const adminAuthService = {
  login: (payload) => http.post(ENDPOINTS.admin.login, payload).then(unwrap),
  me: () => http.get(ENDPOINTS.admin.me).then(unwrap),
  logout: () => http.post(ENDPOINTS.admin.logout).then(unwrap),
  updateProfile: (payload) => http.patch(ENDPOINTS.admin.profile, payload).then(unwrap),
};

export default adminAuthService;
