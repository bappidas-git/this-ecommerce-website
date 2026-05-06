import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import AdminCard from '../../../components/AdminCard.jsx';
import ErrorState from '../../../../components/common/ErrorState/ErrorState.jsx';
import useReportBlock from '../../../hooks/useReportBlock.js';
import { downloadCsv, buildCsvFilename } from '../../../utils/csv.js';
import { formatCurrency, formatNumber } from '../../../../utils/format.js';

import ReportBlockHeaderActions from './ReportBlockHeader.jsx';
import styles from './blocks.module.css';

const formatTypeValue = (type, value) => {
  if (type === 'percentage') return `${value}% off`;
  if (type === 'fixed') return `${formatCurrency(value)} off`;
  if (type === 'free_shipping') return 'Free shipping';
  return value != null ? String(value) : '—';
};

function CouponPerformanceBlock({ range, previousRange, comparePrevious }) {
  const { data, previous, error, isLoading, refetch } = useReportBlock({
    name: 'couponPerformance',
    range,
    previousRange,
    comparePrevious,
  });

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return [...list].sort(
      (a, b) => Number(b.discount || 0) - Number(a.discount || 0),
    );
  }, [data]);

  const totalDiscount = rows.reduce((s, r) => s + Number(r.discount || 0), 0);
  const prevDiscount = useMemo(() => {
    if (!Array.isArray(previous)) return 0;
    return previous.reduce((s, r) => s + Number(r.discount || 0), 0);
  }, [previous]);

  const handleExport = () => {
    downloadCsv(buildCsvFilename('coupon-performance', range), rows, [
      { key: 'code', label: 'Code' },
      {
        key: 'typeValue',
        label: 'Type / Value',
        get: (r) => formatTypeValue(r.type, r.value),
      },
      {
        key: 'redemptions',
        label: 'Redemptions',
        get: (r) => r.ordersUsed ?? r.redeemedCount ?? 0,
      },
      { key: 'discount', label: 'Discount given' },
      { key: 'isActive', label: 'Active' },
    ]);
  };

  return (
    <AdminCard
      title="Coupon performance"
      eyebrow="Promotions"
      action={
        <ReportBlockHeaderActions
          comparePrevious={comparePrevious}
          current={totalDiscount}
          previous={comparePrevious ? prevDiscount : null}
          onExport={handleExport}
          exportDisabled={rows.length === 0}
        />
      }
    >
      {isLoading && !data ? (
        <Skeleton variant="rectangular" width="100%" height={260} />
      ) : error ? (
        <ErrorState
          title="Couldn’t load coupons."
          description={error?.message || 'Please try again.'}
          onRetry={refetch}
        />
      ) : rows.length === 0 ? (
        <Box className={styles.empty}>No coupons configured.</Box>
      ) : (
        <div className={styles.tableWrap}>
          <Table size="small" aria-label="Coupon performance">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Type / Value</TableCell>
                <TableCell align="right">Redemptions</TableCell>
                <TableCell align="right">Discount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c) => {
                const redemptions = c.ordersUsed ?? c.redeemedCount ?? 0;
                return (
                  <TableRow key={c.code} hover>
                    <TableCell>
                      <span className={styles.codeCell}>{c.code}</span>
                    </TableCell>
                    <TableCell>{formatTypeValue(c.type, c.value)}</TableCell>
                    <TableCell align="right">
                      <span className={styles.numCell}>
                        {formatNumber(redemptions)}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className={styles.numCell}>
                        {formatCurrency(c.discount || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          c.isActive ? styles.statusActive : styles.statusInactive
                        }
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminCard>
  );
}

export default CouponPerformanceBlock;
