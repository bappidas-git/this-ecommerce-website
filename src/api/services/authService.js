import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap } from '../queryString.js';

export const authService = {
  login: (payload) => http.post(ENDPOINTS.auth.login, payload).then(unwrap),
  register: (payload) => http.post(ENDPOINTS.auth.register, payload).then(unwrap),
  me: () => http.get(ENDPOINTS.auth.me).then(unwrap),
  logout: () => http.post(ENDPOINTS.auth.logout).then(unwrap),
  forgot: (payload) => http.post(ENDPOINTS.auth.forgot, payload).then(unwrap),
  reset: (payload) => http.post(ENDPOINTS.auth.reset, payload).then(unwrap),
  updateProfile: (payload) => http.patch(ENDPOINTS.auth.profile, payload).then(unwrap),
  updatePassword: (payload) => http.post(ENDPOINTS.auth.password, payload).then(unwrap),
  updatePreferences: (payload) =>
    http.patch(ENDPOINTS.auth.preferences, payload).then(unwrap),
  deleteAccount: (payload) =>
    http.delete(ENDPOINTS.auth.deleteAccount, { data: payload }).then(unwrap),
  subscribe: (payload) =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ data: { email: payload?.email, status: 'pending' } }), 400);
    }),
};

export default authService;
