import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';

import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';

import styles from './UsersPage.module.css';

const COOLDOWN_SECONDS = 5;

function DeleteAdminDialog({ open, user, onClose, onConfirm, isLastAdmin }) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfirmEmail('');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCooldown(COOLDOWN_SECONDS);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  const userEmail = (user?.email || '').trim().toLowerCase();
  const matches =
    confirmEmail.trim().toLowerCase().length > 0 &&
    confirmEmail.trim().toLowerCase() === userEmail;

  const canDelete = matches && cooldown === 0 && !submitting && !isLastAdmin;

  const handleClose = () => {
    if (submitting) return;
    onClose?.();
  };

  const handleConfirm = async () => {
    if (!canDelete) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Could not delete this admin.');
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      size="sm"
      title="Delete admin user"
      description="This action is permanent. To confirm, type the user's email address."
      actions={
        <>
          <AppButton variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            variant="danger"
            onClick={handleConfirm}
            disabled={!canDelete}
            loading={submitting}
          >
            {cooldown > 0
              ? `Delete admin (${cooldown})`
              : 'Delete admin'}
          </AppButton>
        </>
      }
    >
      <div className={styles.deleteBody}>
        {isLastAdmin ? (
          <Alert severity="warning" className={styles.lastAdminAlert}>
            You cannot delete the last remaining admin. Promote another
            teammate to admin before removing this account.
          </Alert>
        ) : null}
        <p className={styles.deleteHint}>
          Type <strong>{user?.email || 'the email'}</strong> to enable deletion.
        </p>
        <AppTextField
          label="Confirm email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          autoComplete="off"
          disabled={isLastAdmin}
          error={
            !matches && confirmEmail ? 'Email does not match.' : undefined
          }
          inputProps={{ 'aria-label': 'Type the user email to confirm' }}
        />
        {error ? <p className={styles.deleteError}>{error}</p> : null}
      </div>
    </AppDialog>
  );
}

export default DeleteAdminDialog;
