import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import { formatCurrency, formatNumber } from '../../../utils/format.js';

import styles from './OrdersStats.module.css';

const ICON = {
  revenue: PaymentsOutlinedIcon,
  orders: ReceiptLongOutlinedIcon,
  pending: LocalShippingOutlinedIcon,
  cancelled: CancelOutlinedIcon,
};

function StatCard({ tone, label, value, icon: Icon, isLoading }) {
  return (
    <article
      className={[styles.card, styles[`tone_${tone}`]].filter(Boolean).join(' ')}
    >
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon} aria-hidden>
          <Icon fontSize="small" />
        </span>
      </div>
      <p className={styles.value} aria-live="polite">
        {isLoading ? '—' : value}
      </p>
    </article>
  );
}

function OrdersStats({ stats, isLoading, caption }) {
  const todayRevenue = Number(stats?.todayRevenue || 0);
  const todayOrders = Number(stats?.todayOrders || 0);
  const pendingFulfilment = Number(stats?.pendingFulfilment || 0);
  const cancelledThisWeek = Number(stats?.cancelledThisWeek || 0);

  return (
    <section className={styles.wrap} aria-label="Orders statistics">
      <div className={styles.grid} role="group">
        <StatCard
          tone="brass"
          label="Today's revenue"
          value={formatCurrency(todayRevenue)}
          icon={ICON.revenue}
          isLoading={isLoading}
        />
        <StatCard
          tone="emerald"
          label="Today's orders"
          value={formatNumber(todayOrders)}
          icon={ICON.orders}
          isLoading={isLoading}
        />
        <StatCard
          tone="warning"
          label="Pending fulfilment"
          value={formatNumber(pendingFulfilment)}
          icon={ICON.pending}
          isLoading={isLoading}
        />
        <StatCard
          tone="error"
          label="Cancelled this week"
          value={formatNumber(cancelledThisWeek)}
          icon={ICON.cancelled}
          isLoading={isLoading}
        />
      </div>
      {caption ? <p className={styles.caption}>{caption}</p> : null}
    </section>
  );
}

export default OrdersStats;
