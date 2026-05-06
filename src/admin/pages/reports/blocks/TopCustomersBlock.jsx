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

function TopCustomersBlock({ range, previousRange, comparePrevious }) {
  const navigate = useNavigate();
  const { data, previous, error, isLoading, refetch } = useReportBlock({
    name: 'topCustomers',
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
    downloadCsv(buildCsvFilename('top-customers', range), ranked, [
      { key: 'rank', label: 'Rank' },
      { key: 'name', label: 'Customer' },
      { key: 'email', label: 'Email' },
      { key: 'orders', label: 'Orders' },
      { key: 'revenue', label: 'Lifetime value' },
    ]);
  };

  return (
    <AdminCard
      title="Top customers"
      eyebrow="Highest spenders"
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
          title="Couldn’t load top customers."
          description={error?.message || 'Please try again.'}
          onRetry={refetch}
        />
      ) : rows.length === 0 ? (
        <Box className={styles.empty}>No customer activity yet.</Box>
      ) : (
        <div className={styles.tableWrap}>
          <Table size="small" aria-label="Top customers">
            <TableHead>
              <TableRow>
                <TableCell width={48}>#</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell align="right">Lifetime value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c, idx) => (
                <TableRow
                  key={c.userId || idx}
                  hover
                  className={styles.rowLink}
                  tabIndex={0}
                  onClick={() =>
                    c.userId && navigate(PATHS.admin.customerDetail(c.userId))
                  }
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && c.userId) {
                      e.preventDefault();
                      navigate(PATHS.admin.customerDetail(c.userId));
                    }
                  }}
                >
                  <TableCell>
                    <span className={styles.rank}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>{c.name || `User ${c.userId}`}</div>
                    {c.email ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                        {c.email}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell align="right">
                    <span className={styles.numCell}>
                      {formatNumber(c.orders || 0)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span className={styles.numCell}>
                      {formatCurrency(c.revenue || 0)}
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

export default TopCustomersBlock;
