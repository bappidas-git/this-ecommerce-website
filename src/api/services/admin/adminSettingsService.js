import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap } from '../../queryString.js';

export const adminSettingsService = {
  get: () => http.get(ENDPOINTS.admin.settings).then(unwrap),
  update: (payload) => http.patch(ENDPOINTS.admin.settings, payload).then(unwrap),
};

export default adminSettingsService;
