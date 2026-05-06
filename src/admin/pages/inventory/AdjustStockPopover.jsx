import { useEffect, useState } from 'react';
import Popover from '@mui/material/Popover';

import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import { INVENTORY_REASON_OPTIONS } from '../../features/inventory/inventoryStatus.js';

import styles from './AdjustStockPopover.module.css';

const NOTE_LIMIT = 200;

function AdjustStockPopover({ open, anchorEl, onClose, row, onSubmit, isSaving }) {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('restock');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setDelta('');
      setReason('restock');
      setNote('');
      setErrors({});
    }
  }, [open, row?.id]);

  const projectedStock = (() => {
    const base = Number(row?.stock) || 0;
    const d = Number(delta);
    if (!Number.isFinite(d)) return base;
    return Math.max(0, base + d);
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    const d = Number(delta);
    if (!Number.isFinite(d) || d === 0) {
      next.delta = 'Enter a non-zero number';
    }
    if (!reason) next.reason = 'Choose a reason';
    if (note && note.length > NOTE_LIMIT) {
      next.note = `Keep notes under ${NOTE_LIMIT} characters`;
    }
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSubmit({ delta: Math.floor(d), reason, note: note.trim() || null });
  };

  return (
    <Popover
      open={Boolean(open)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: { className: styles.paper, elevation: 0 },
      }}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Adjust stock</p>
          <h3 className={styles.title}>{row?.name || 'Product'}</h3>
          <p className={styles.meta}>
            <span className={styles.sku}>{row?.sku || '—'}</span>
            <span className={styles.dot} aria-hidden>·</span>
            <span>
              Current <strong>{row?.stock ?? 0}</strong>
            </span>
          </p>
        </header>

        <div className={styles.field}>
          <AppTextField
            label="Delta"
            type="number"
            size="small"
            inputProps={{ inputMode: 'numeric', step: 1 }}
            placeholder="e.g. +5 or -2"
            value={delta}
            onChange={(e) => {
              setDelta(e.target.value);
              if (errors.delta) setErrors((s) => ({ ...s, delta: undefined }));
            }}
            error={errors.delta}
            description="Use a negative number to remove stock."
          />
        </div>

        <div className={styles.field}>
          <AppSelect
            label="Reason"
            size="small"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={INVENTORY_REASON_OPTIONS}
            error={errors.reason}
          />
        </div>

        <div className={styles.field}>
          <AppTextField
            label="Note"
            optional
            size="small"
            multiline
            minRows={2}
            maxRows={4}
            inputProps={{ maxLength: NOTE_LIMIT }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            error={errors.note}
            helperText={`${note.length}/${NOTE_LIMIT}`}
          />
        </div>

        <div className={styles.summary}>
          <span className={styles.summaryLabel}>New stock</span>
          <span className={styles.summaryValue}>{projectedStock}</span>
        </div>

        <footer className={styles.actions}>
          <AppButton variant="ghost" size="small" onClick={onClose} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton type="submit" variant="primary" size="small" loading={isSaving}>
            Apply
          </AppButton>
        </footer>
      </form>
    </Popover>
  );
}

export default AdjustStockPopover;
