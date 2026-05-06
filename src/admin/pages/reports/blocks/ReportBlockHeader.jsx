import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

import { computeDelta } from '../../../components/KpiCard.jsx';
import styles from './blocks.module.css';

function DeltaPill({ current, previous, formatPercent }) {
  if (previous === null || previous === undefined) return null;
  const delta = computeDelta(current, previous);
  const Icon =
    delta.tone === 'up'
      ? ArrowUpwardRoundedIcon
      : delta.tone === 'down'
        ? ArrowDownwardRoundedIcon
        : RemoveRoundedIcon;
  const className = [
    styles.delta,
    delta.tone === 'up' ? styles.deltaUp : '',
    delta.tone === 'down' ? styles.deltaDown : '',
    delta.tone === 'flat' ? styles.deltaFlat : '',
  ]
    .filter(Boolean)
    .join(' ');
  const formatted =
    typeof formatPercent === 'function'
      ? formatPercent(delta.percent)
      : `${delta.percent.toFixed(delta.percent >= 10 ? 0 : 1)}%`;
  return (
    <span className={className} aria-label={`Change: ${delta.tone} ${formatted}`}>
      <Icon fontSize="inherit" />
      {formatted}
    </span>
  );
}

function ReportBlockHeaderActions({
  comparePrevious,
  current,
  previous,
  onExport,
  exportDisabled,
  exportLabel = 'Export CSV',
  children,
}) {
  return (
    <div className={styles.headerActions}>
      {comparePrevious && previous !== null && previous !== undefined ? (
        <DeltaPill current={current} previous={previous} />
      ) : null}
      {children}
      <button
        type="button"
        className={styles.exportLink}
        onClick={onExport}
        disabled={exportDisabled}
      >
        {exportLabel}
      </button>
    </div>
  );
}

export { DeltaPill };
export default ReportBlockHeaderActions;
