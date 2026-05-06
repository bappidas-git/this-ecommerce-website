import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { formatCurrency } from '../../../../utils/format.js';

import ReportBlockHeaderActions from './ReportBlockHeader.jsx';
import styles from './blocks.module.css';

function SalesByCategoryBlock({ range, previousRange, comparePrevious }) {
  const theme = useTheme();
  const stroke = theme.palette.brand?.brass || theme.palette.primary.main;

  const { data, previous, error, isLoading, refetch } = useReportBlock({
    name: 'salesByCategory',
    range,
    previousRange,
    comparePrevious,
  });

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return [...list]
      .map((c) => ({
        name: c.name || `#${c.categoryId}`,
        revenue: Number(c.revenue || 0),
        units: Number(c.units || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalPrev = useMemo(() => {
    if (!Array.isArray(previous)) return 0;
    return previous.reduce((s, r) => s + Number(r.revenue || 0), 0);
  }, [previous]);

  const handleExport = () => {
    downloadCsv(
      buildCsvFilename('sales-by-category', range),
      rows,
      [
        { key: 'name', label: 'Category' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'units', label: 'Units' },
      ],
    );
  };

  const chartHeight = Math.max(220, rows.length * 36 + 40);

  return (
    <AdminCard
      title="Sales by category"
      eyebrow="Mix"
      action={
        <ReportBlockHeaderActions
          comparePrevious={comparePrevious}
          current={totalRevenue}
          previous={comparePrevious ? totalPrev : null}
          onExport={handleExport}
          exportDisabled={rows.length === 0}
        />
      }
    >
      {isLoading && !data ? (
        <Skeleton variant="rectangular" width="100%" height={220} />
      ) : error ? (
        <ErrorState
          title="Couldn’t load category mix."
          description={error?.message || 'Please try again.'}
          onRetry={refetch}
        />
      ) : rows.length === 0 ? (
        <Box className={styles.empty}>No category data.</Box>
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                stroke={theme.palette.text.primary}
                strokeOpacity={0.08}
                horizontal={false}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                }
              />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={120}
                tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
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
              />
              <Bar
                dataKey="revenue"
                fill={stroke}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminCard>
  );
}

export default SalesByCategoryBlock;
