import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

import Seo from '../../components/common/Seo.jsx';
import ErrorState from '../../components/common/ErrorState/ErrorState.jsx';
import AdminPageHeader from '../components/AdminPageHeader.jsx';
import AdminCard from '../components/AdminCard.jsx';
import KpiCard, { computeDelta } from '../components/KpiCard.jsx';
import StatusPill, { STATUS_LABEL } from '../components/StatusPill.jsx';
import AdminDateRangePicker, {
  buildRange,
} from '../components/AdminDateRangePicker.jsx';
import useAdminBreadcrumbs from '../hooks/useAdminBreadcrumbs.js';
import useAdminDashboard from '../hooks/useAdminDashboard.js';
import RequireAdmin from '../../routes/RequireAdmin.jsx';
import { PATHS } from '../../routes/paths.js';
import { formatCurrency, formatNumber, formatDate } from '../../utils/format.js';

import styles from './DashboardPage.module.css';

const DEFAULT_PRESET = '30d';

const STATUS_KEYS = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled',
];

const useStatusColors = () => {
  const theme = useTheme();
  return useMemo(
    () => ({
      pending: theme.palette.brand?.muted || theme.palette.text.disabled,
      confirmed: theme.palette.brand?.brass || theme.palette.primary.main,
      preparing: theme.palette.brand?.emerald || theme.palette.secondary.main,
      ready: theme.palette.warning.main,
      completed: theme.palette.success.main,
      cancelled: theme.palette.error.main,
    }),
    [theme],
  );
};

function KpiSkeleton() {
  return (
    <Box className={styles.kpiSkeleton}>
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" height={36} />
      <Skeleton variant="rectangular" width="100%" height={48} />
    </Box>
  );
}

function CardSkeleton({ height = 280 }) {
  return (
    <AdminCard title={<Skeleton variant="text" width={140} />}>
      <Skeleton variant="rectangular" width="100%" height={height} />
    </AdminCard>
  );
}

function RevenueChart({ data, range }) {
  const theme = useTheme();
  const stroke = theme.palette.brand?.brass || theme.palette.primary.main;
  const cream = theme.palette.brand?.adminInk || '#F7F3ED';

  const chartData = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((p) => ({
        date: p.date,
        label: p.date ? dayjs(p.date).format('DD MMM') : '',
        revenue: Number(p.revenue || 0),
      })),
    [data],
  );

  if (chartData.length === 0) {
    return (
      <Box className={styles.chartEmpty}>
        <p className={styles.emptyTitle}>No orders in this range.</p>
        <p className={styles.emptyHelp}>
          Try a wider date range to see revenue.
        </p>
      </Box>
    );
  }

  const tickInterval = chartData.length > 14 ? Math.floor(chartData.length / 7) : 0;
  const noRevenue = chartData.every((p) => p.revenue === 0);

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.24} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={cream}
            strokeOpacity={0.08}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            interval={tickInterval}
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
            width={56}
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
              color: theme.palette.text.primary,
              fontSize: 12,
            }}
            formatter={(v) => [formatCurrency(v), 'Revenue']}
            labelFormatter={(l) => l}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={stroke}
            strokeWidth={2}
            fill="url(#revenueGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      {noRevenue ? (
        <p className={styles.chartHint}>
          No revenue recorded for {dayjs(range.start).format('DD MMM')} –
          {' '}
          {dayjs(range.end).format('DD MMM')}.
        </p>
      ) : null}
    </div>
  );
}

function OrdersDonut({ counts, total }) {
  const colors = useStatusColors();
  const theme = useTheme();

  const slices = useMemo(
    () =>
      STATUS_KEYS.map((key) => ({
        key,
        name: STATUS_LABEL[key] || key,
        value: Number(counts?.[key] || 0),
        fill: colors[key],
      })).filter((s) => s.value > 0),
    [counts, colors],
  );

  if (!total || slices.length === 0) {
    return (
      <Box className={styles.chartEmpty}>
        <p className={styles.emptyTitle}>No orders in this range.</p>
        <p className={styles.emptyHelp}>
          Once orders come in, the breakdown shows up here.
        </p>
      </Box>
    );
  }

  return (
    <div className={styles.donutWrap}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={88}
            stroke={theme.palette.background.paper}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {slices.map((s) => (
              <Cell key={s.key} fill={s.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
              color: theme.palette.text.primary,
              fontSize: 12,
            }}
            formatter={(v, n) => [formatNumber(v), n]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className={styles.donutCenter} aria-hidden>
        <span className={styles.donutTotal}>{formatNumber(total)}</span>
        <span className={styles.donutLabel}>Orders</span>
      </div>
      <ul className={styles.legend}>
        {slices.map((s) => (
          <li key={s.key} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ backgroundColor: s.fill }}
              aria-hidden
            />
            <span className={styles.legendName}>{s.name}</span>
            <span className={styles.legendCount}>{formatNumber(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentOrdersTable({ orders }) {
  const navigate = useNavigate();
  if (!orders || orders.length === 0) {
    return (
      <Box className={styles.cardEmpty}>
        <p className={styles.emptyTitle}>No orders yet.</p>
      </Box>
    );
  }
  return (
    <Box className={styles.tableWrap}>
      <Table size="small" aria-label="Recent orders">
        <TableHead>
          <TableRow>
            <TableCell>Order</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((o) => (
            <TableRow
              key={o.id}
              hover
              tabIndex={0}
              className={styles.row}
              onClick={() => navigate(PATHS.admin.orderDetail(o.id))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(PATHS.admin.orderDetail(o.id));
                }
              }}
            >
              <TableCell>
                <span className={styles.orderNumber}>{o.number || `#${o.id}`}</span>
              </TableCell>
              <TableCell>
                {o.shippingAddress
                  ? `${o.shippingAddress.firstName || ''} ${o.shippingAddress.lastName || ''}`.trim() ||
                    '—'
                  : '—'}
              </TableCell>
              <TableCell>{formatDate(o.createdAt, 'dd MMM')}</TableCell>
              <TableCell>
                <StatusPill status={o.status} />
              </TableCell>
              <TableCell align="right">
                <span className={styles.amount}>
                  {formatCurrency(o.total, o.currency)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function TopProductsList({ items }) {
  if (!items || items.length === 0) {
    return (
      <Box className={styles.cardEmpty}>
        <p className={styles.emptyTitle}>No sales yet.</p>
      </Box>
    );
  }
  return (
    <ul className={styles.products}>
      {items.map((p, idx) => (
        <li key={p.productId || p.slug} className={styles.product}>
          <span className={styles.rank}>{String(idx + 1).padStart(2, '0')}</span>
          <Link
            to={p.productId ? PATHS.admin.productEdit(p.productId) : '#'}
            className={styles.productLink}
          >
            <img
              src={`https://placehold.co/120x120/E5DED2/1B1A17?text=${encodeURIComponent(
                (p.name || 'Item').slice(0, 16),
              )}&font=playfair`}
              alt=""
              className={styles.productThumb}
              loading="lazy"
            />
            <span className={styles.productInfo}>
              <span className={styles.productName}>{p.name}</span>
              <span className={styles.productMeta}>
                {formatNumber(p.units || 0)} sold
              </span>
            </span>
            <span className={styles.productRevenue}>
              {formatCurrency(p.revenue || 0)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function LowStockStrip({ items, threshold }) {
  if (!items || items.length === 0) {
    return (
      <Box className={styles.lowStockEmpty}>
        <p className={styles.lowStockEmptyTitle}>All stock looks healthy.</p>
        <p className={styles.lowStockEmptyHelp}>
          No products at or below {threshold} units.
        </p>
      </Box>
    );
  }
  return (
    <ul className={styles.lowStockList}>
      {items.map((p) => (
        <li key={p.id} className={styles.lowStockItem}>
          <Link to={PATHS.admin.productEdit(p.id)} className={styles.lowStockLink}>
            <img
              src={
                Array.isArray(p.images) && p.images[0]
                  ? p.images[0]
                  : `https://placehold.co/96x96/E5DED2/1B1A17?text=${encodeURIComponent(
                      (p.name || 'Item').slice(0, 12),
                    )}&font=playfair`
              }
              alt=""
              className={styles.lowStockThumb}
              loading="lazy"
            />
            <span className={styles.lowStockText}>
              <span className={styles.lowStockName}>{p.name}</span>
              <span className={styles.lowStockSku}>{p.sku || ''}</span>
            </span>
            <span className={styles.lowStockQty}>{formatNumber(p.stock || 0)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DashboardPage() {
  useAdminBreadcrumbs([{ label: 'Overview' }]);

  const [range, setRange] = useState(() => {
    const initial = buildRange(
      AdminDateRangePicker.PRESETS.find((p) => p.id === DEFAULT_PRESET),
    );
    return { start: initial.start.toDate(), end: initial.end.toDate() };
  });

  const { data, error, isLoading, refetch } = useAdminDashboard({
    start: range.start,
    end: range.end,
    lowStockThreshold: 5,
  });

  const handleRangeChange = (next) => {
    setRange({ start: next.start, end: next.end });
  };

  const kpis = data?.kpis;
  const sales = data?.sales;
  const ordersByStatus = data?.ordersByStatus;
  const recentOrders = data?.recentOrders;
  const topProducts = data?.topProducts;
  const lowStock = data?.lowStock;

  return (
    <>
      <Seo title="Overview — THIS Admin" />
      <AdminPageHeader
        eyebrow="Admin"
        title="Overview"
        description="Performance, orders, and stock at a glance."
        actions={
          <AdminDateRangePicker
            value={range}
            onChange={handleRangeChange}
            defaultPreset={DEFAULT_PRESET}
          />
        }
      />

      {error && !data ? (
        <Box className={styles.pageError}>
          <ErrorState
            title="Couldn’t load the dashboard."
            description={error?.message || 'Please try again.'}
            onRetry={refetch}
          />
        </Box>
      ) : null}

      <div className={styles.grid}>
        {/* Row 1 — KPI cards */}
        <div className={styles.kpi}>
          {isLoading || !kpis ? (
            <KpiSkeleton />
          ) : (
            <KpiCard
              eyebrow="Revenue"
              value={kpis.revenue.value}
              formatValue={(v) => formatCurrency(v)}
              delta={computeDelta(kpis.revenue.value, kpis.revenue.previous)}
              spark={kpis.revenue.spark}
              gradientId="kpi-revenue"
            />
          )}
        </div>
        <div className={styles.kpi}>
          {isLoading || !kpis ? (
            <KpiSkeleton />
          ) : (
            <KpiCard
              eyebrow="Orders"
              value={kpis.orders.value}
              formatValue={(v) => formatNumber(v)}
              delta={computeDelta(kpis.orders.value, kpis.orders.previous)}
              spark={kpis.orders.spark}
              gradientId="kpi-orders"
            />
          )}
        </div>
        <div className={styles.kpi}>
          {isLoading || !kpis ? (
            <KpiSkeleton />
          ) : (
            <KpiCard
              eyebrow="New customers"
              value={kpis.newCustomers.value}
              formatValue={(v) => formatNumber(v)}
              delta={computeDelta(
                kpis.newCustomers.value,
                kpis.newCustomers.previous,
              )}
              spark={kpis.newCustomers.spark}
              gradientId="kpi-customers"
            />
          )}
        </div>
        <div className={styles.kpi}>
          {isLoading || !kpis ? (
            <KpiSkeleton />
          ) : (
            <KpiCard
              eyebrow="AOV"
              value={kpis.aov.value}
              formatValue={(v) => formatCurrency(v)}
              delta={computeDelta(kpis.aov.value, kpis.aov.previous)}
              spark={kpis.aov.spark}
              gradientId="kpi-aov"
            />
          )}
        </div>

        {/* Row 2 — Revenue + Donut */}
        <div className={styles.colWide}>
          {isLoading || !sales ? (
            <CardSkeleton height={260} />
          ) : (
            <AdminCard
              title="Revenue"
              action={
                <Link to={PATHS.admin.reports} className={styles.viewLink}>
                  View report
                </Link>
              }
            >
              {!sales.ok ? (
                <ErrorState
                  title="Couldn’t load revenue."
                  description={sales.error?.message || 'Please try again.'}
                  onRetry={refetch}
                />
              ) : (
                <RevenueChart data={sales.series} range={data.range} />
              )}
            </AdminCard>
          )}
        </div>
        <div className={styles.colNarrow}>
          {isLoading || !ordersByStatus ? (
            <CardSkeleton height={220} />
          ) : (
            <AdminCard
              title="Orders by status"
              action={
                <Link to={PATHS.admin.reports} className={styles.viewLink}>
                  View report
                </Link>
              }
            >
              {!ordersByStatus.ok ? (
                <ErrorState
                  title="Couldn’t load orders."
                  description={
                    ordersByStatus.error?.message || 'Please try again.'
                  }
                  onRetry={refetch}
                />
              ) : (
                <OrdersDonut
                  counts={ordersByStatus.counts}
                  total={ordersByStatus.total}
                />
              )}
            </AdminCard>
          )}
        </div>

        {/* Row 3 — Recent orders + Top products */}
        <div className={styles.colWide}>
          {isLoading || !recentOrders ? (
            <CardSkeleton height={320} />
          ) : (
            <AdminCard
              title="Recent orders"
              action={
                <Link to={PATHS.admin.orders} className={styles.viewLink}>
                  All orders
                </Link>
              }
              bodyClassName={styles.tableBody}
            >
              {!recentOrders.ok ? (
                <ErrorState
                  title="Couldn’t load orders."
                  description={recentOrders.error?.message || 'Please try again.'}
                  onRetry={refetch}
                />
              ) : (
                <RecentOrdersTable orders={recentOrders.items} />
              )}
            </AdminCard>
          )}
        </div>
        <div className={styles.colNarrow}>
          {isLoading || !topProducts ? (
            <CardSkeleton height={320} />
          ) : (
            <AdminCard
              title="Top products"
              action={
                <Link to={PATHS.admin.products} className={styles.viewLink}>
                  Catalog
                </Link>
              }
            >
              {!topProducts.ok ? (
                <ErrorState
                  title="Couldn’t load top products."
                  description={topProducts.error?.message || 'Please try again.'}
                  onRetry={refetch}
                />
              ) : (
                <TopProductsList items={topProducts.items} />
              )}
            </AdminCard>
          )}
        </div>

        {/* Row 4 — Low stock */}
        <div className={styles.colFull}>
          {isLoading || !lowStock ? (
            <CardSkeleton height={120} />
          ) : (
            <AdminCard
              title="Low stock"
              eyebrow={`Stock ≤ ${lowStock.threshold}`}
              action={
                <Link to={PATHS.admin.inventory} className={styles.viewLink}>
                  Manage inventory
                </Link>
              }
            >
              {!lowStock.ok ? (
                <ErrorState
                  title="Couldn’t load stock."
                  description={lowStock.error?.message || 'Please try again.'}
                  onRetry={refetch}
                />
              ) : (
                <LowStockStrip
                  items={lowStock.items}
                  threshold={lowStock.threshold}
                />
              )}
            </AdminCard>
          )}
        </div>
      </div>
    </>
  );
}

function GuardedDashboardPage() {
  return (
    <RequireAdmin area="dashboard">
      <DashboardPage />
    </RequireAdmin>
  );
}

export { DashboardPage };
export default GuardedDashboardPage;
