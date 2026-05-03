import http from '../http.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap } from '../queryString.js';

export const settingsService = {
  getPublic: () => http.get(ENDPOINTS.settings.public).then(unwrap),
};

export default settingsService;
