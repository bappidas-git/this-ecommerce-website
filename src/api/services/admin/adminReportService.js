import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap } from '../../queryString.js';

const { reports } = ENDPOINTS.admin;

export const adminReportService = {
  salesOverTime: (params = {}) =>
    http.get(buildUrl(reports.salesOverTime, params)).then(unwrap),
  salesByCategory: (params = {}) =>
    http.get(buildUrl(reports.salesByCategory, params)).then(unwrap),
  topProducts: (params = {}) =>
    http.get(buildUrl(reports.topProducts, params)).then(unwrap),
  topCustomers: (params = {}) =>
    http.get(buildUrl(reports.topCustomers, params)).then(unwrap),
  couponPerformance: (params = {}) =>
    http.get(buildUrl(reports.couponPerformance, params)).then(unwrap),
  inventoryTurnover: (params = {}) =>
    http.get(buildUrl(reports.inventoryTurnover, params)).then(unwrap),
};

export default adminReportService;
