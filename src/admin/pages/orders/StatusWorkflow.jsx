import { useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import {
  ORDER_STATUS_FLOW,
  advanceStatus,
  flowIndex,
  isTerminal,
  nextStatuses,
} from '../../utils/orderStateMachine.js';
import { ORDER_STATUS_LABELS } from '../../features/orders/orderStatus.js';

import styles from './StatusWorkflow.module.css';

const NOTE_LIMIT = 280;

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusWorkflow({
  status,
  history,
  canWrite,
  onTransition,
  isWorking,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState('');

  const currentIdx = flowIndex(status);
  const isCancelled = status === 'cancelled';
  const terminal = isTerminal(status);

  const lastEntered = useMemo(() => {
    const map = new Map();
    for (const h of history || []) {
      map.set(h.to, h);
    }
    return map;
  }, [history]);

  const allowed = nextStatuses(status);
  const advance = advanceStatus(status);
  const otherTransitions = allowed.filter((s) => s !== advance);

  const openConfirm = (target) => {
    setPending(target);
    setNote('');
  };
  const closeConfirm = () => {
    if (isWorking) return;
    setPending(null);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    await onTransition({ status: pending, note: note.trim() || null });
    setPending(null);
    setNote('');
  };

  const renderRow = (key, idx) => {
    const entry = lastEntered.get(key);
    const reached = entry || (currentIdx >= 0 && idx <= currentIdx && !isCancelled);
    const isActive = key === status;
    const isFuture = !reached && !isActive;
    const showConnectorAfter = idx < ORDER_STATUS_FLOW.length - 1;
    const isCompleted = currentIdx > idx && !isCancelled;

    const dotClass = [
      styles.dot,
      isActive ? styles.dotActive : null,
      isCompleted ? styles.dotDone : null,
      isFuture ? styles.dotFuture : null,
    ].filter(Boolean).join(' ');

    return (
      <li key={key} className={styles.step}>
        <div className={styles.stepRail}>
          <span className={dotClass} aria-hidden>
            {isCompleted ? <CheckRoundedIcon fontSize="inherit" /> : null}
          </span>
          {showConnectorAfter ? (
            <span
              className={[
                styles.connector,
                isCompleted ? styles.connectorDone : styles.connectorFuture,
              ].join(' ')}
              aria-hidden
            />
          ) : null}
        </div>
        <div className={styles.stepBody}>
          <div className={styles.stepHead}>
            <span className={[
              styles.stepLabel,
              isActive ? styles.stepLabelActive : null,
              isFuture ? styles.stepLabelFuture : null,
            ].filter(Boolean).join(' ')}>
              {ORDER_STATUS_LABELS[key]}
            </span>
            {entry ? (
              <span className={styles.stepTime}>{fmtTime(entry.createdAt)}</span>
            ) : null}
          </div>
          {entry?.author ? (
            <p className={styles.stepMeta}>
              by {entry.author.name}
              {entry.note ? <span className={styles.stepNote}> — {entry.note}</span> : null}
            </p>
          ) : null}
          {isActive && canWrite && advance ? (
            <div className={styles.stepActions}>
              <AppButton
                variant="primary"
                size="small"
                onClick={() => openConfirm(advance)}
                loading={isWorking && pending === advance}
              >
                Advance to {ORDER_STATUS_LABELS[advance]}
              </AppButton>
              {otherTransitions.length ? (
                <>
                  <IconButton
                    size="small"
                    aria-label="More transitions"
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                    className={styles.moreBtn}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    open={Boolean(menuAnchor)}
                    anchorEl={menuAnchor}
                    onClose={() => setMenuAnchor(null)}
                    slotProps={{ paper: { className: styles.menuPaper } }}
                  >
                    {otherTransitions.map((s) => (
                      <MenuItem
                        key={s}
                        onClick={() => {
                          setMenuAnchor(null);
                          openConfirm(s);
                        }}
                      >
                        Move to {ORDER_STATUS_LABELS[s]}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </li>
    );
  };

  const cancelEntry = lastEntered.get('cancelled');

  return (
    <section className={styles.root} aria-label="Status workflow">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Status workflow</p>
        {terminal ? (
          <p className={styles.terminal}>
            This order is {ORDER_STATUS_LABELS[status]?.toLowerCase()} and cannot be
            transitioned.
          </p>
        ) : null}
      </header>

      <ol className={styles.list}>
        {ORDER_STATUS_FLOW.map((s, idx) => renderRow(s, idx))}
      </ol>

      {isCancelled ? (
        <div className={styles.cancelled}>
          <span className={styles.cancelDot} aria-hidden>
            <BlockRoundedIcon fontSize="inherit" />
          </span>
          <div>
            <p className={styles.cancelLabel}>Cancelled</p>
            {cancelEntry ? (
              <p className={styles.stepMeta}>
                {fmtTime(cancelEntry.createdAt)}
                {cancelEntry.author ? ` • by ${cancelEntry.author.name}` : ''}
                {cancelEntry.note ? ` — ${cancelEntry.note}` : ''}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <AppDialog
        open={Boolean(pending)}
        onClose={closeConfirm}
        size="sm"
        title={pending ? `Move to ${ORDER_STATUS_LABELS[pending]}?` : ''}
        description="Add an optional note for the activity log."
        actions={(
          <>
            <AppButton variant="ghost" onClick={closeConfirm} disabled={isWorking}>
              Cancel
            </AppButton>
            <AppButton
              variant={pending === 'cancelled' ? 'danger' : 'primary'}
              onClick={handleConfirm}
              loading={isWorking}
            >
              Confirm
            </AppButton>
          </>
        )}
      >
        <AppTextField
          label="Note"
          multiline
          minRows={2}
          maxRows={4}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, NOTE_LIMIT))}
          helperText={`${note.length}/${NOTE_LIMIT}`}
          optional
        />
      </AppDialog>
    </section>
  );
}

export default StatusWorkflow;
