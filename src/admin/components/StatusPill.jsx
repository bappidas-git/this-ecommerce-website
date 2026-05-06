import styles from './StatusPill.module.css';

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const STATUS_TONE = {
  pending: 'muted',
  confirmed: 'brass',
  preparing: 'emerald',
  ready: 'warning',
  completed: 'success',
  cancelled: 'error',
  refunded: 'muted',
};

function StatusPill({ status, label, className }) {
  const key = String(status || '').toLowerCase();
  const tone = STATUS_TONE[key] || 'muted';
  const text = label || STATUS_LABEL[key] || key || 'Unknown';
  const classes = [styles.pill, styles[`tone_${tone}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes}>
      <span className={styles.dot} aria-hidden />
      {text}
    </span>
  );
}

StatusPill.STATUS_LABEL = STATUS_LABEL;
StatusPill.STATUS_TONE = STATUS_TONE;

export { STATUS_LABEL, STATUS_TONE };
export default StatusPill;
