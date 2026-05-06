import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import Seo from '../../../components/common/Seo.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import KpiCard, { computeDelta } from '../../components/KpiCard.jsx';
import AdminDateRangePicker from '../../components/AdminDateRangePicker.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useReportBlock from '../../hooks/useReportBlock.js';
import useReportsState from '../../hooks/useReportsState.js';
import { downloadCsv, buildCsvFilename } from '../../utils/csv.js';
import { formatCurrency, formatNumber } from '../../../utils/format.js';

import SalesOverTimeBlock from './blocks/SalesOverTimeBlock.jsx';
import SalesByCategoryBlock from './blocks/SalesByCategoryBlock.jsx';
import TopProductsBlock from './blocks/TopProductsBlock.jsx';
import TopCustomersBlock from './blocks/TopCustomersBlock.jsx';
import CouponPerformanceBlock from './blocks/CouponPerformanceBlock.jsx';
import InventoryTurnoverBlock from './blocks/InventoryTurnoverBlock.jsx';

import styles from './ReportsPage.module.css';

const sumSeries = (series, key) =>
  (Array.isArray(series) ? series : []).reduce(
    (s, p) => s + Number(p[key] || 0),
    0,
  );

function KpiSkeleton() {
  return (
    <Box className={styles.kpiSkeleton}>
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" height={36} />
      <Skeleton variant="rectangular" width="100%" height={48} />
    </Box>
  );
}

function ReportsPage() {
  useAdminBreadcrumbs([{ label: 'Site' }, { label: 'Reports' }]);

  const {
    range,
    previousRange,
    comparePrevious,
    granularity,
    days,
    setRange,
    setComparePrevious,
    setGranularity,
  } = useReportsState();

  const [topLevelError, setTopLevelError] = useState(null);

  const summary = useReportBlock({
    name: 'salesOverTime',
    range,
    previousRange,
    comparePrevious,
  });

  const customersSummary = useReportBlock({
    name: 'topCustomers',
    range,
    previousRange,
    comparePrevious,
    extraParams: { limit: 1000 },
  });

  const kpis = useMemo(() => {
    const revenue = sumSeries(summary.data, 'revenue');
    const orders = sumSeries(summary.data, 'orders');
    const prevRevenue = sumSeries(summary.previous, 'revenue');
    const prevOrders = sumSeries(summary.previous, 'orders');
    const customers = Array.isArray(customersSummary.data)
      ? customersSummary.data.length
      : 0;
    const prevCustomers = Array.isArray(customersSummary.previous)
      ? customersSummary.previous.length
      : 0;
    return {
      revenue: { value: revenue, previous: prevRevenue },
      orders: { value: orders, previous: prevOrders },
      aov: {
        value: orders > 0 ? revenue / orders : 0,
        previous: prevOrders > 0 ? prevRevenue / prevOrders : 0,
      },
      customers: { value: customers, previous: prevCustomers },
      sparks: {
        revenue: (Array.isArray(summary.data) ? summary.data : []).map((p) =>
          Number(p.revenue || 0),
        ),
        orders: (Array.isArray(summary.data) ? summary.data : []).map((p) =>
          Number(p.orders || 0),
        ),
      },
    };
  }, [summary.data, summary.previous, customersSummary.data, customersSummary.previous]);

  const handleRangeChange = useCallback(
    (next) => {
      setRange({ start: next.start, end: next.end });
    },
    [setRange],
  );

  const handleExportAll = async () => {
    setTopLevelError(null);
    try {
      const series = Array.isArray(summary.data) ? summary.data : [];
      downloadCsv(
        buildCsvFilename('reports-summary', range),
        [
          {
            metric: 'Revenue',
            current: kpis.revenue.value,
            previous: kpis.revenue.previous,
          },
          {
            metric: 'Orders',
            current: kpis.orders.value,
            previous: kpis.orders.previous,
          },
          {
            metric: 'AOV',
            current: kpis.aov.value,
            previous: kpis.aov.previous,
          },
          {
            metric: 'Customers',
            current: kpis.customers.value,
            previous: kpis.customers.previous,
          },
          ...series.map((p) => ({
            metric: `Daily revenue ${dayjs(p.date).format('YYYY-MM-DD')}`,
            current: Number(p.revenue || 0),
            previous: '',
          })),
        ],
        [
          { key: 'metric', label: 'Metric' },
          { key: 'current', label: 'Current period' },
          { key: 'previous', label: 'Previous period' },
        ],
      );
    } catch (err) {
      setTopLevelError(err);
    }
  };

  const summaryLoading = summary.isLoading && !summary.data;
  const summaryHasData = Array.isArray(summary.data);

  return (
    <>
      <Seo title="Reports | Admin" noindex />

      <AdminPageHeader
        eyebrow="Insights"
        title="Reports"
        description={`Range: ${dayjs(range.start).format('DD MMM YYYY')} – ${dayjs(
          range.end,
        ).format('DD MMM YYYY')} · ${days} day${days === 1 ? '' : 's'}`}
        actions={
          <div className={styles.actions}>
            <AdminDateRangePicker value={range} onChange={handleRangeChange} />
            <FormControlLabel
              className={styles.compareToggle}
              control={
                <Switch
                  size="small"
                  checked={comparePrevious}
                  onChange={(e) => setComparePrevious(e.target.checked)}
                  inputProps={{ 'aria-label': 'Compare to previous period' }}
                />
              }
              label="Compare to previous period"
            />
            <AppButton
              variant="ghost"
              size="small"
              onClick={handleExportAll}
              disabled={!summaryHasData}
            >
              Export all (CSV)
            </AppButton>
          </div>
        }
      />

      {topLevelError ? (
        <Box sx={{ mb: 2 }}>
          <ErrorState
            title="Couldn’t export."
            description={topLevelError?.message || 'Please try again.'}
          />
        </Box>
      ) : null}

      <div className={styles.kpiRow}>
        {summaryLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              eyebrow="Revenue"
              value={kpis.revenue.value}
              formatValue={(v) => formatCurrency(v)}
              delta={
                comparePrevious
                  ? computeDelta(kpis.revenue.value, kpis.revenue.previous)
                  : null
              }
              spark={kpis.sparks.revenue}
              gradientId="rep-rev"
            />
            <KpiCard
              eyebrow="Orders"
              value={kpis.orders.value}
              formatValue={(v) => formatNumber(v)}
              delta={
                comparePrevious
                  ? computeDelta(kpis.orders.value, kpis.orders.previous)
                  : null
              }
              spark={kpis.sparks.orders}
              gradientId="rep-ord"
            />
            <KpiCard
              eyebrow="AOV"
              value={kpis.aov.value}
              formatValue={(v) => formatCurrency(v)}
              delta={
                comparePrevious
                  ? computeDelta(kpis.aov.value, kpis.aov.previous)
                  : null
              }
              spark={kpis.sparks.revenue}
              gradientId="rep-aov"
            />
            <KpiCard
              eyebrow="Customers"
              value={kpis.customers.value}
              formatValue={(v) => formatNumber(v)}
              delta={
                comparePrevious
                  ? computeDelta(kpis.customers.value, kpis.customers.previous)
                  : null
              }
              spark={kpis.sparks.orders}
              gradientId="rep-cust"
            />
          </>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.colWide}>
          <SalesOverTimeBlock
            range={range}
            previousRange={previousRange}
            comparePrevious={comparePrevious}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        </div>
        <div className={styles.colNarrow}>
          <SalesByCategoryBlock
            range={range}
            previousRange={previousRange}
            comparePrevious={comparePrevious}
          />
        </div>

        <div className={styles.colHalf}>
          <TopProductsBlock
            range={range}
            previousRange={previousRange}
            comparePrevious={comparePrevious}
          />
        </div>
        <div className={styles.colHalf}>
          <TopCustomersBlock
            range={range}
            previousRange={previousRange}
            comparePrevious={comparePrevious}
          />
        </div>

        <div className={styles.colHalf}>
          <CouponPerformanceBlock
            range={range}
            previousRange={previousRange}
            comparePrevious={comparePrevious}
          />
        </div>
        <div className={styles.colHalf}>
          <InventoryTurnoverBlock
            range={range}
            previousRange={previousRange}
            comparePrevious={comparePrevious}
          />
        </div>
      </div>
    </>
  );
}

export default ReportsPage;
