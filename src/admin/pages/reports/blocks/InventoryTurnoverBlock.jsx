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
import { formatNumber } from '../../../../utils/format.js';

import ReportBlockHeaderActions from './ReportBlockHeader.jsx';
import styles from './blocks.module.css';

const dayMs = 24 * 60 * 60 * 1000;

const computeRows = (data, days) => {
  const list = Array.isArray(data) ? data : [];
  return list
    .map((p) => {
      const sold = Number(p.sold || 0);
      const restocked = Number(p.restocked || 0);
      const ending = Number(p.stock || 0);
      const starting = ending + sold - restocked;
      const dailyRate = days > 0 ? sold / days : 0;
      const daysOfCover = dailyRate > 0 ? ending / dailyRate : null;
      return {
        ...p,
        starting,
        ending,
        sold,
        restocked,
        daysOfCover,
      };
    })
    .sort((a, b) => b.sold - a.sold);
};

function DaysOfCoverCell({ value }) {
  if (value === null || value === undefined) {
    return <span className={styles.daysCover}>∞</span>;
  }
  const num = Number(value);
  const cls = [
    styles.daysCover,
    num <= 7 ? styles.daysCoverDanger : '',
    num > 7 && num <= 21 ? styles.daysCoverWarning : '',
  ]
    .filter(Boolean)
    .join(' ');
  return <span className={cls}>{num.toFixed(num < 10 ? 1 : 0)} d</span>;
}

function InventoryTurnoverBlock({ range, previousRange, comparePrevious }) {
  const start = range?.start;
  const end = range?.end;
  const days = useMemo(() => {
    if (!start || !end) return 1;
    const diff = Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / dayMs,
    );
    return Math.max(1, diff + 1);
  }, [start, end]);

  const { data, previous, error, isLoading, refetch } = useReportBlock({
    name: 'inventoryTurnover',
    range,
    previousRange,
    comparePrevious,
  });

  const rows = useMemo(() => computeRows(data, days), [data, days]);
  const totalSold = rows.reduce((s, r) => s + r.sold, 0);
  const prevTotalSold = useMemo(() => {
    const prev = computeRows(previous, days);
    return prev.reduce((s, r) => s + r.sold, 0);
  }, [previous, days]);

  const handleExport = () => {
    downloadCsv(buildCsvFilename('inventory-turnover', range), rows, [
      { key: 'name', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'starting', label: 'Starting stock' },
      { key: 'ending', label: 'Ending stock' },
      { key: 'sold', label: 'Sold' },
      {
        key: 'daysOfCover',
        label: 'Days of cover',
        get: (r) =>
          r.daysOfCover === null ? '∞' : Number(r.daysOfCover).toFixed(1),
      },
    ]);
  };

  return (
    <AdminCard
      title="Inventory turnover"
      eyebrow={`Over ${days} day${days === 1 ? '' : 's'}`}
      action={
        <ReportBlockHeaderActions
          comparePrevious={comparePrevious}
          current={totalSold}
          previous={comparePrevious ? prevTotalSold : null}
          onExport={handleExport}
          exportDisabled={rows.length === 0}
        />
      }
    >
      {isLoading && !data ? (
        <Skeleton variant="rectangular" width="100%" height={280} />
      ) : error ? (
        <ErrorState
          title="Couldn’t load inventory turnover."
          description={error?.message || 'Please try again.'}
          onRetry={refetch}
        />
      ) : rows.length === 0 ? (
        <Box className={styles.empty}>No inventory data.</Box>
      ) : (
        <div className={styles.tableWrap}>
          <Table size="small" aria-label="Inventory turnover">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Start</TableCell>
                <TableCell align="right">End</TableCell>
                <TableCell align="right">Sold</TableCell>
                <TableCell align="right">Days of cover</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.productId} hover>
                  <TableCell>
                    <div>{p.name}</div>
                    {p.sku ? (
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--admin-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {p.sku}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell align="right">
                    <span className={styles.numCell}>
                      {formatNumber(p.starting)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span className={styles.numCell}>
                      {formatNumber(p.ending)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span className={styles.numCell}>{formatNumber(p.sold)}</span>
                  </TableCell>
                  <TableCell align="right">
                    <DaysOfCoverCell value={p.daysOfCover} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminCard>
  );
}

export default InventoryTurnoverBlock;
