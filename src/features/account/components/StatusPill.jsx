import styles from './StatusPill.module.css';

const STATUS_MAP = Object.freeze({
  pending: { label: 'Order received', tone: 'muted' },
  confirmed: { label: 'Confirmed', tone: 'brass' },
  preparing: { label: 'Being prepared', tone: 'emerald' },
  ready: { label: 'Ready', tone: 'emerald' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'error' },
});

const TONE_CLASS = {
  muted: styles.muted,
  brass: styles.brass,
  emerald: styles.emerald,
  success: styles.success,
  error: styles.error,
};

function StatusPill({ status, className, ...rest }) {
  const key = String(status || '').toLowerCase();
  const config = STATUS_MAP[key] || { label: status || 'Unknown', tone: 'muted' };
  const toneClass = TONE_CLASS[config.tone] || TONE_CLASS.muted;
  const classes = [styles.root, toneClass, className].filter(Boolean).join(' ');

  return (
    <span className={classes} role="status" {...rest}>
      {config.label}
    </span>
  );
}

export default StatusPill;
