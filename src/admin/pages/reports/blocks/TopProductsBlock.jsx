import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { PATHS } from '../../../../routes/paths.js';

import ReportBlockHeaderActions from './ReportBlockHeader.jsx';
import styles from './blocks.module.css';

const LIMIT = 10;

function TopProductsBlock({ range, previousRange, comparePrevious }) {
  const navigate = useNavigate();
  const { data, previous, error, isLoading, refetch } = useReportBlock({
    name: 'topProducts',
    range,
    previousRange,
    comparePrevious,
    extraParams: { limit: LIMIT },
  });

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue || 0), 0);
  const totalPrev = useMemo(() => {
    if (!Array.isArray(previous)) return 0;
    return previous.reduce((s, r) => s + Number(r.revenue || 0), 0);
  }, [previous]);

  const handleExport = () => {
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));
    downloadCsv(buildCsvFilename('top-products', range), ranked, [
      { key: 'rank', label: 'Rank' },
      { key: 'name', label: 'Product' },
      { key: 'units', label: 'Units sold' },
      { key: 'revenue', label: 'Revenue' },
    ]);
  };

  return (
    <AdminCard
      title="Top products"
      eyebrow="Best sellers"
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
        <Skeleton variant="rectangular" width="100%" height={280} />
      ) : error ? (
        <ErrorState
          title="Couldn’t load top products."
          description={error?.message || 'Please try again.'}
          onRetry={refetch}
        />
      ) : rows.length === 0 ? (
        <Box className={styles.empty}>No products sold in this range.</Box>
      ) : (
        <div className={styles.tableWrap}>
          <Table size="small" aria-label="Top products">
            <TableHead>
              <TableRow>
                <TableCell width={48}>#</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Units</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p, idx) => (
                <TableRow
                  key={p.productId || p.slug || idx}
                  hover
                  className={styles.rowLink}
                  tabIndex={0}
                  onClick={() =>
                    p.productId &&
                    navigate(PATHS.admin.productEdit(p.productId))
                  }
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && p.productId) {
                      e.preventDefault();
                      navigate(PATHS.admin.productEdit(p.productId));
                    }
                  }}
                >
                  <TableCell>
                    <span className={styles.rank}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </TableCell>
                  <TableCell>{p.name || `#${p.productId}`}</TableCell>
                  <TableCell align="right">
                    <span className={styles.numCell}>
                      {formatNumber(p.units || 0)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span className={styles.numCell}>
                      {formatCurrency(p.revenue || 0)}
                    </span>
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

export default TopProductsBlock;
