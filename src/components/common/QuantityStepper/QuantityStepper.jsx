import { useCallback, useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import styles from './QuantityStepper.module.css';

const THROTTLE_MS = 250;

function clamp(n, min, max) {
  if (typeof min === 'number' && n < min) return min;
  if (typeof max === 'number' && n > max) return max;
  return n;
}

function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  disabled = false,
  size = 'medium',
  ariaLabel = 'Quantity',
  className,
  ...rest
}) {
  const [localValue, setLocalValue] = useState(value ?? min);
  const lastEmittedAt = useRef(0);
  const pendingTimer = useRef(null);
  const pendingValue = useRef(null);

  useEffect(() => {
    if (typeof value === 'number') setLocalValue(value);
  }, [value]);

  useEffect(() => () => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
  }, []);

  const emit = useCallback(
    (next) => {
      const now = Date.now();
      const elapsed = now - lastEmittedAt.current;
      if (elapsed >= THROTTLE_MS) {
        lastEmittedAt.current = now;
        onChange?.(next);
      } else {
        pendingValue.current = next;
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        pendingTimer.current = setTimeout(() => {
          lastEmittedAt.current = Date.now();
          onChange?.(pendingValue.current);
          pendingTimer.current = null;
        }, THROTTLE_MS - elapsed);
      }
    },
    [onChange],
  );

  const update = (delta) => {
    const next = clamp((localValue ?? min) + delta, min, max);
    if (next === localValue) return;
    setLocalValue(next);
    emit(next);
  };

  const minusDisabled = disabled || (typeof min === 'number' && localValue <= min);
  const plusDisabled = disabled || (typeof max === 'number' && localValue >= max);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
      {...rest}
    >
      <IconButton
        type="button"
        onClick={() => update(-step)}
        disabled={minusDisabled}
        aria-label="Decrease quantity"
        size={size}
        className={styles.button}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <span
        className={styles.value}
        aria-live="polite"
        aria-atomic="true"
      >
        {localValue}
      </span>
      <IconButton
        type="button"
        onClick={() => update(step)}
        disabled={plusDisabled}
        aria-label="Increase quantity"
        size={size}
        className={styles.button}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </div>
  );
}

export default QuantityStepper;
