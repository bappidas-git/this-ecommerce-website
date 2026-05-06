import http from '../../http.js';
import { ENDPOINTS } from '../../endpoints.js';
import { buildUrl, unwrap, unwrapList } from '../../queryString.js';

const { reports } = ENDPOINTS.admin;

const settled = (value) => ({ ok: true, value });
const failed = (error) => ({ ok: false, error });

const safe = (promise) => promise.then(settled, failed);

const dayMs = 24 * 60 * 60 * 1000;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const inRange = (iso, start, end) => {
  if (!iso) return false;
  const t = Date.parse(iso);
  return t >= start.getTime() && t <= end.getTime();
};

const aggregateOrdersByStatus = (orders) => {
  const buckets = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    if (buckets[o.status] != null) buckets[o.status] += 1;
    else buckets[o.status] = 1;
  }
  return buckets;
};

const sumRevenue = (orders) =>
  orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total || 0), 0);

const splitSeries = (series, days) => {
  const safeSeries = Array.isArray(series) ? series : [];
  if (safeSeries.length === 0) {
    return { current: [], previous: [] };
  }
  const cur = safeSeries.slice(-days);
  const prev = safeSeries.slice(0, Math.max(0, safeSeries.length - days));
  return { current: cur, previous: prev };
};

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

  /**
   * Bundle dashboard data: fetches concurrently and returns a single object
   * keyed by section, with per-section error info so cards can fail in
   * isolation.
   *
   * Inputs: { start: Date, end: Date, lowStockThreshold?: number }
   */
  async dashboard({ start, end, lowStockThreshold = 5 } = {}) {
    const safeEnd = endOfDay(end || new Date());
    const safeStart = startOfDay(start || new Date(safeEnd.getTime() - 29 * dayMs));
    const days = Math.max(
      1,
      Math.round((safeEnd.getTime() - safeStart.getTime()) / dayMs) + 1,
    );
    const prevStart = new Date(safeStart.getTime() - days * dayMs);
    const prevEnd = new Date(safeStart.getTime() - 1);

    const [
      salesBundle,
      topProductsRes,
      recentOrdersRes,
      ordersAllRes,
      lowStockRes,
      customersRes,
    ] = await Promise.all([
      safe(
        http
          .get(buildUrl(reports.salesOverTime, { days: days * 2 }))
          .then(unwrap),
      ),
      safe(
        http.get(buildUrl(reports.topProducts, { limit: 5 })).then(unwrap),
      ),
      safe(
        http
          .get(
            buildUrl(ENDPOINTS.admin.orders, {
              perPage: 8,
              sort: '-createdAt',
            }),
          )
          .then(unwrapList),
      ),
      safe(
        http
          .get(
            buildUrl(ENDPOINTS.admin.orders, {
              perPage: 500,
              sort: '-createdAt',
            }),
          )
          .then(unwrapList),
      ),
      safe(
        http
          .get(
            buildUrl(ENDPOINTS.admin.products, {
              stockLte: lowStockThreshold,
              perPage: 12,
              sort: 'stock',
            }),
          )
          .then(unwrapList),
      ),
      safe(
        http
          .get(
            buildUrl(ENDPOINTS.admin.customers, {
              perPage: 500,
            }),
          )
          .then(unwrapList),
      ),
    ]);

    const salesSeriesAll = salesBundle.ok ? salesBundle.value || [] : [];
    const { current: salesSeries, previous: prevSalesSeries } = splitSeries(
      salesSeriesAll,
      days,
    );

    const totalRevenue = salesSeries.reduce(
      (s, p) => s + Number(p.revenue || 0),
      0,
    );
    const prevRevenue = prevSalesSeries.reduce(
      (s, p) => s + Number(p.revenue || 0),
      0,
    );
    const totalOrdersFromSeries = salesSeries.reduce(
      (s, p) => s + Number(p.orders || 0),
      0,
    );
    const prevOrdersFromSeries = prevSalesSeries.reduce(
      (s, p) => s + Number(p.orders || 0),
      0,
    );

    const allOrders = ordersAllRes.ok ? ordersAllRes.value.items || [] : [];
    const ordersInRange = allOrders.filter((o) =>
      inRange(o.createdAt, safeStart, safeEnd),
    );
    const ordersByStatus = aggregateOrdersByStatus(ordersInRange);
    const ordersInRangeRevenue = sumRevenue(ordersInRange);

    const allCustomers = customersRes.ok ? customersRes.value.items || [] : [];
    const newCustomers = allCustomers.filter((c) =>
      inRange(c.createdAt, safeStart, safeEnd),
    ).length;
    const prevNewCustomers = allCustomers.filter((c) =>
      inRange(c.createdAt, prevStart, prevEnd),
    ).length;

    const aov =
      totalOrdersFromSeries > 0 ? totalRevenue / totalOrdersFromSeries : 0;
    const prevAov =
      prevOrdersFromSeries > 0 ? prevRevenue / prevOrdersFromSeries : 0;

    return {
      range: {
        start: safeStart.toISOString(),
        end: safeEnd.toISOString(),
        days,
      },
      sales: {
        ok: salesBundle.ok,
        error: salesBundle.ok ? null : salesBundle.error,
        series: salesSeries,
        previousSeries: prevSalesSeries,
      },
      kpis: {
        revenue: {
          value: totalRevenue || ordersInRangeRevenue,
          previous: prevRevenue,
          spark: salesSeries.map((p) => Number(p.revenue || 0)),
        },
        orders: {
          value: totalOrdersFromSeries || ordersInRange.length,
          previous: prevOrdersFromSeries,
          spark: salesSeries.map((p) => Number(p.orders || 0)),
        },
        newCustomers: {
          value: newCustomers,
          previous: prevNewCustomers,
          spark: salesSeries.map((p) => Number(p.orders || 0)),
        },
        aov: {
          value: aov,
          previous: prevAov,
          spark: salesSeries.map((p) =>
            Number(p.orders || 0) > 0
              ? Number(p.revenue || 0) / Number(p.orders || 1)
              : 0,
          ),
        },
      },
      ordersByStatus: {
        ok: ordersAllRes.ok,
        error: ordersAllRes.ok ? null : ordersAllRes.error,
        counts: ordersByStatus,
        total: ordersInRange.length,
      },
      topProducts: {
        ok: topProductsRes.ok,
        error: topProductsRes.ok ? null : topProductsRes.error,
        items: topProductsRes.ok ? topProductsRes.value || [] : [],
      },
      recentOrders: {
        ok: recentOrdersRes.ok,
        error: recentOrdersRes.ok ? null : recentOrdersRes.error,
        items: recentOrdersRes.ok ? recentOrdersRes.value.items || [] : [],
      },
      lowStock: {
        ok: lowStockRes.ok,
        error: lowStockRes.ok ? null : lowStockRes.error,
        threshold: lowStockThreshold,
        items: lowStockRes.ok ? lowStockRes.value.items || [] : [],
      },
    };
  },
};

export default adminReportService;
