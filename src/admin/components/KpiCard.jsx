import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

import styles from './KpiCard.module.css';

const computeDelta = (current, previous) => {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) {
    if (c === 0) return { tone: 'flat', percent: 0 };
    return { tone: 'up', percent: 100 };
  }
  const change = ((c - p) / Math.abs(p)) * 100;
  if (Math.abs(change) < 0.5) return { tone: 'flat', percent: 0 };
  return { tone: change > 0 ? 'up' : 'down', percent: Math.abs(change) };
};

function DeltaChip({ tone, percent }) {
  const Icon =
    tone === 'up'
      ? ArrowUpwardRoundedIcon
      : tone === 'down'
        ? ArrowDownwardRoundedIcon
        : RemoveRoundedIcon;
  const className = [
    styles.delta,
    tone === 'up' ? styles.deltaUp : '',
    tone === 'down' ? styles.deltaDown : '',
    tone === 'flat' ? styles.deltaFlat : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={className}>
      <Icon className={styles.deltaIcon} fontSize="inherit" />
      {percent.toFixed(percent >= 10 ? 0 : 1)}%
    </span>
  );
}

function KpiSparkline({ data, gradientId, stroke }) {
  const chartData = useMemo(
    () => (Array.isArray(data) ? data.map((v, i) => ({ i, v: Number(v) || 0 })) : []),
    [data],
  );
  if (chartData.length === 0) {
    return <div className={styles.sparkEmpty} aria-hidden />;
  }
  return (
    <div className={styles.spark} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({
  eyebrow,
  value,
  formatValue,
  delta,
  spark = [],
  gradientId,
}) {
  const theme = useTheme();
  const stroke = theme.palette.brand?.brass || theme.palette.primary.main;
  const formatted =
    typeof formatValue === 'function' ? formatValue(value) : value;

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        {delta ? <DeltaChip tone={delta.tone} percent={delta.percent} /> : null}
      </header>
      <p className={styles.value}>{formatted}</p>
      <KpiSparkline data={spark} gradientId={gradientId} stroke={stroke} />
    </article>
  );
}

KpiCard.computeDelta = computeDelta;

export { computeDelta };
export default KpiCard;
