import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import styles from './AdminDateRangePicker.module.css';

const PRESETS = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
  { id: '90d', label: '90d', days: 90 },
  { id: 'year', label: 'This year', kind: 'year' },
  { id: 'custom', label: 'Custom', kind: 'custom' },
];

const startOfDay = (d) => d.startOf('day');
const endOfDay = (d) => d.endOf('day');

const buildRange = (preset) => {
  const today = dayjs();
  if (preset.id === 'today') {
    return { start: startOfDay(today), end: endOfDay(today) };
  }
  if (preset.kind === 'year') {
    return { start: startOfDay(today.startOf('year')), end: endOfDay(today) };
  }
  if (preset.id === 'custom') {
    return { start: startOfDay(today.subtract(29, 'day')), end: endOfDay(today) };
  }
  return {
    start: startOfDay(today.subtract(preset.days - 1, 'day')),
    end: endOfDay(today),
  };
};

const matchesPreset = (start, end) => {
  for (const p of PRESETS) {
    if (p.id === 'custom') continue;
    const r = buildRange(p);
    if (
      r.start.isSame(start, 'day') &&
      r.end.isSame(end, 'day')
    ) {
      return p.id;
    }
  }
  return 'custom';
};

function AdminDateRangePicker({ value, onChange, defaultPreset = '30d' }) {
  const initialPreset = useMemo(
    () => PRESETS.find((p) => p.id === defaultPreset) || PRESETS[2],
    [defaultPreset],
  );
  const [activePreset, setActivePreset] = useState(initialPreset.id);
  const initialRange = useMemo(() => {
    if (value?.start && value?.end) {
      return { start: dayjs(value.start), end: dayjs(value.end) };
    }
    return buildRange(initialPreset);
  }, [value?.start, value?.end, initialPreset]);

  const [start, setStart] = useState(initialRange.start);
  const [end, setEnd] = useState(initialRange.end);

  useEffect(() => {
    if (value?.start && value?.end) {
      const s = dayjs(value.start);
      const e = dayjs(value.end);
      if (!s.isSame(start, 'day')) setStart(s);
      if (!e.isSame(end, 'day')) setEnd(e);
      setActivePreset(matchesPreset(s, e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.start, value?.end]);

  const emit = (s, e) => {
    if (typeof onChange !== 'function') return;
    onChange({ start: s.toDate(), end: e.toDate() });
  };

  const handlePreset = (preset) => {
    setActivePreset(preset.id);
    if (preset.kind === 'custom') return;
    const range = buildRange(preset);
    setStart(range.start);
    setEnd(range.end);
    emit(range.start, range.end);
  };

  const handleStartChange = (next) => {
    if (!next) return;
    const s = startOfDay(next);
    const e = end.isBefore(s) ? endOfDay(s) : end;
    setStart(s);
    setEnd(e);
    setActivePreset(matchesPreset(s, e));
    emit(s, e);
  };

  const handleEndChange = (next) => {
    if (!next) return;
    const e = endOfDay(next);
    const s = start.isAfter(e) ? startOfDay(e) : start;
    setStart(s);
    setEnd(e);
    setActivePreset(matchesPreset(s, e));
    emit(s, e);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.root}>
        <div className={styles.presets} role="group" aria-label="Quick date presets">
          {PRESETS.map((p) => {
            const active = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={[
                  styles.chip,
                  active ? styles.chipActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handlePreset(p)}
                aria-pressed={active}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className={styles.inputs}>
          <DatePicker
            label="From"
            value={start}
            onChange={handleStartChange}
            maxDate={end}
            slotProps={{
              textField: { size: 'small', className: styles.field },
            }}
          />
          <span className={styles.separator} aria-hidden>
            —
          </span>
          <DatePicker
            label="To"
            value={end}
            onChange={handleEndChange}
            minDate={start}
            slotProps={{
              textField: { size: 'small', className: styles.field },
            }}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
}

AdminDateRangePicker.PRESETS = PRESETS;
AdminDateRangePicker.buildRange = buildRange;

export { PRESETS, buildRange };
export default AdminDateRangePicker;
