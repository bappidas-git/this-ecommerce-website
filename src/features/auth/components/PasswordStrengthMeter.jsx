import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import styles from './PasswordStrengthMeter.module.css';

const LABELS = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const TONES = ['error', 'error', 'warning', 'brass', 'success'];

function scorePassword(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  // Cap at 4 — symbol is "extra credit" that lifts a 3 → 4.
  return Math.min(score, 4);
}

function PasswordStrengthMeter({ name = 'password', control: controlProp }) {
  const formCtx = useFormContext();
  const control = controlProp || formCtx?.control;
  const value = useWatch({ control, name }) || '';

  const score = useMemo(() => scorePassword(value), [value]);
  const tone = TONES[score] || TONES[0];
  const label = value ? LABELS[score] : ' ';

  const meterId = `${name}-strength-meter`;
  const labelId = `${name}-strength-label`;

  return (
    <div className={styles.root} aria-live="polite">
      <div
        className={styles.bars}
        role="meter"
        id={meterId}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={value ? LABELS[score] : 'Empty'}
      >
        {[0, 1, 2, 3].map((i) => {
          const filled = value && i < score;
          const segClass = [
            styles.segment,
            filled ? styles.filled : '',
            filled ? styles[`tone_${tone}`] : '',
          ]
            .filter(Boolean)
            .join(' ');
          return <span key={i} className={segClass} aria-hidden="true" />;
        })}
      </div>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
    </div>
  );
}

export default PasswordStrengthMeter;
