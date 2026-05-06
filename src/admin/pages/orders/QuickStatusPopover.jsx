import { useEffect, useMemo, useState } from 'react';
import Popover from '@mui/material/Popover';

import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_PILL,
  nextStatusesFor,
} from '../../features/orders/orderStatus.js';

import styles from './QuickStatusPopover.module.css';

const NOTE_LIMIT = 280;

function QuickStatusPopover({ open, anchorEl, onClose, row, onSubmit, isSaving }) {
  const transitions = useMemo(
    () => nextStatusesFor(row?.status),
    [row?.status],
  );

  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setNextStatus(transitions[0] || '');
    setNote('');
    setErrors({});
  }, [open, row?.id, transitions]);

  const options = transitions.map((s) => ({
    value: s,
    label: ORDER_STATUS_LABELS[s] || s,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!nextStatus) next.status = 'Choose a next status';
    if (note && note.length > NOTE_LIMIT) {
      next.note = `Keep notes under ${NOTE_LIMIT} characters`;
    }
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSubmit({ status: nextStatus, note: note.trim() || null });
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
          <p className={styles.eyebrow}>Update status</p>
          <h3 className={styles.title}>{row?.number || 'Order'}</h3>
          <p className={styles.meta}>
            <span>Currently</span>
            {row?.status ? (
              <StatusPill
                status={ORDER_STATUS_PILL[row.status] || row.status}
                label={ORDER_STATUS_LABELS[row.status] || row.status}
              />
            ) : null}
          </p>
        </header>

        {transitions.length === 0 ? (
          <p className={styles.terminal}>
            This order has reached a terminal status and can no longer be updated.
          </p>
        ) : (
          <>
            <div className={styles.field}>
              <AppSelect
                label="Next status"
                size="small"
                value={nextStatus}
                onChange={(e) => {
                  setNextStatus(e.target.value);
                  if (errors.status) setErrors((s) => ({ ...s, status: undefined }));
                }}
                options={options}
                error={errors.status}
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
          </>
        )}

        <footer className={styles.actions}>
          <AppButton
            variant="ghost"
            size="small"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            size="small"
            loading={isSaving}
            disabled={transitions.length === 0}
          >
            Update
          </AppButton>
        </footer>
      </form>
    </Popover>
  );
}

export default QuickStatusPopover;
