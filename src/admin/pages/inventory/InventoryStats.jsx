import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import styles from './InventoryStats.module.css';

const ICON = {
  total: Inventory2OutlinedIcon,
  out: ReportProblemOutlinedIcon,
  low: WarningAmberRoundedIcon,
  healthy: CheckCircleOutlineRoundedIcon,
};

function StatCard({ tone, label, value, icon: Icon, isLoading }) {
  return (
    <article className={[styles.card, styles[`tone_${tone}`]].filter(Boolean).join(' ')}>
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

function InventoryStats({ stats, isLoading }) {
  const total = Number(stats?.totalSkus || 0);
  const out = Number(stats?.out || 0);
  const low = Number(stats?.low || 0);
  const healthy = Number(stats?.healthy || 0);

  return (
    <div className={styles.grid} role="group" aria-label="Inventory statistics">
      <StatCard tone="brass" label="Total SKUs" value={total} icon={ICON.total} isLoading={isLoading} />
      <StatCard tone="error" label="Out of stock" value={out} icon={ICON.out} isLoading={isLoading} />
      <StatCard tone="warning" label="Low stock" value={low} icon={ICON.low} isLoading={isLoading} />
      <StatCard tone="success" label="Healthy" value={healthy} icon={ICON.healthy} isLoading={isLoading} />
    </div>
  );
}

export default InventoryStats;
