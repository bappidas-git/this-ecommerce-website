import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap } from '../../queryString.js';

export const adminSettingsService = {
  get: () => http.get(ENDPOINTS.admin.settings).then(unwrap),
  update: (group, payload) => {
    if (typeof group === 'string') {
      return http
        .patch(ENDPOINTS.admin.settings, { [group]: payload })
        .then(unwrap);
    }
    return http.patch(ENDPOINTS.admin.settings, group).then(unwrap);
  },
};

export default adminSettingsService;
