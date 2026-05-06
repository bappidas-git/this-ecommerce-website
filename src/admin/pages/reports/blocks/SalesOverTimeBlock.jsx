import { useMemo } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

import AdminCard from '../../../components/AdminCard.jsx';
import ErrorState from '../../../../components/common/ErrorState/ErrorState.jsx';
import useReportBlock from '../../../hooks/useReportBlock.js';
import { downloadCsv, buildCsvFilename } from '../../../utils/csv.js';
import { formatCurrency, formatNumber } from '../../../../utils/format.js';

import ReportBlockHeaderActions from './ReportBlockHeader.jsx';
import styles from './blocks.module.css';

const GRANULARITIES = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

const bucketKey = (date, granularity) => {
  const d = dayjs(date);
  if (granularity === 'month') return d.format('YYYY-MM');
  if (granularity === 'week') return d.startOf('week').format('YYYY-MM-DD');
  return d.format('YYYY-MM-DD');
};

const formatBucketLabel = (key, granularity) => {
  if (!key) return '';
  if (granularity === 'month') return dayjs(key).format('MMM YYYY');
  if (granularity === 'week') return `Wk ${dayjs(key).format('DD MMM')}`;
  return dayjs(key).format('DD MMM');
};

const aggregate = (series, granularity) => {
  if (!Array.isArray(series)) return [];
  const buckets = new Map();
  for (const point of series) {
    const key = bucketKey(point.date, granularity);
    const cur = buckets.get(key) || { key, revenue: 0, orders: 0 };
    cur.revenue += Number(point.revenue || 0);
    cur.orders += Number(point.orders || 0);
    buckets.set(key, cur);
  }
  return [...buckets.values()].sort((a, b) =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0,
  );
};

function SalesOverTimeBlock({
  range,
  previousRange,
  comparePrevious,
  granularity,
  onGranularityChange,
}) {
  const theme = useTheme();
  const stroke = theme.palette.brand?.brass || theme.palette.primary.main;
  const emerald = theme.palette.brand?.emerald || theme.palette.secondary.main;

  const { data, previous, error, isLoading, refetch } = useReportBlock({
    name: 'salesOverTime',
    range,
    previousRange,
    comparePrevious,
  });

  const currentSeries = useMemo(() => aggregate(data, granularity), [data, granularity]);
  const previousSeries = useMemo(
    () => (comparePrevious ? aggregate(previous, granularity) : []),
    [previous, granularity, comparePrevious],
  );

  const merged = useMemo(() => {
    const len = Math.max(currentSeries.length, previousSeries.length);
    const rows = [];
    for (let i = 0; i < len; i++) {
      const cur = currentSeries[i];
      const prev = previousSeries[i];
      rows.push({
        idx: i,
        label: cur ? formatBucketLabel(cur.key, granularity) : '',
        date: cur?.key,
        revenue: cur ? Number(cur.revenue) : null,
        previousRevenue: prev ? Number(prev.revenue) : null,
      });
    }
    return rows;
  }, [currentSeries, previousSeries, granularity]);

  const totalRevenue = currentSeries.reduce((s, p) => s + p.revenue, 0);
  const totalPrevRevenue = previousSeries.reduce((s, p) => s + p.revenue, 0);

  const handleExport = () => {
    if (!Array.isArray(data) || data.length === 0) return;
    downloadCsv(
      buildCsvFilename('sales-over-time', range),
      currentSeries,
      [
        { key: 'key', label: 'Period' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'orders', label: 'Orders' },
      ],
    );
  };

  return (
    <AdminCard
      title="Sales over time"
      eyebrow="Revenue"
      action={
        <ReportBlockHeaderActions
          comparePrevious={comparePrevious}
          current={totalRevenue}
          previous={comparePrevious ? totalPrevRevenue : null}
          onExport={handleExport}
          exportDisabled={!Array.isArray(data) || data.length === 0}
        >
          <div className={styles.granularity} role="group" aria-label="Granularity">
            {GRANULARITIES.map((g) => {
              const active = granularity === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onGranularityChange(g.id)}
                  className={[
                    styles.granularityChip,
                    active ? styles.granularityChipActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={active}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </ReportBlockHeaderActions>
      }
    >
      {isLoading && !data ? (
        <Skeleton variant="rectangular" width="100%" height={260} />
      ) : error ? (
        <ErrorState
          title="Couldn’t load sales over time."
          description={error?.message || 'Please try again.'}
          onRetry={refetch}
        />
      ) : merged.length === 0 ? (
        <Box className={styles.empty}>No sales in this range.</Box>
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={merged}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportSalesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={theme.palette.text.primary}
                strokeOpacity={0.08}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                interval={merged.length > 14 ? Math.floor(merged.length / 7) : 0}
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
                formatter={(value, name) => {
                  if (value === null) return ['—', name];
                  return [
                    formatCurrency(value),
                    name === 'revenue' ? 'Revenue' : 'Previous',
                  ];
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={stroke}
                strokeWidth={2}
                fill="url(#reportSalesGradient)"
                isAnimationActive={false}
              />
              {comparePrevious ? (
                <Line
                  type="monotone"
                  dataKey="previousRevenue"
                  stroke={emerald}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
          <div className={styles.chartLegend}>
            <span>
              <span className={styles.legendSwatch} aria-hidden /> Current —{' '}
              {formatCurrency(totalRevenue)} ·{' '}
              {formatNumber(currentSeries.reduce((s, p) => s + p.orders, 0))} orders
            </span>
            {comparePrevious ? (
              <span>
                <span className={styles.legendSwatchPrev} aria-hidden /> Previous —{' '}
                {formatCurrency(totalPrevRevenue)}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </AdminCard>
  );
}

export default SalesOverTimeBlock;
