import http from '../http.js';
import { unwrap } from '../queryString.js';

export const contactService = {
  send: (payload) => http.post('/contact', payload).then(unwrap),
};

export default contactService;
