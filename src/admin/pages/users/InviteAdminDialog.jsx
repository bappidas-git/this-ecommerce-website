import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';

import styles from './UsersPage.module.css';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'viewer', label: 'Viewer' },
];

const inviteSchema = yup.object({
  name: yup.string().trim().required('Name is required.'),
  email: yup
    .string()
    .trim()
    .email('Enter a valid email address.')
    .required('Email is required.'),
  role: yup
    .string()
    .oneOf(['admin', 'manager', 'viewer'], 'Choose a role.')
    .required('Choose a role.'),
});

const DEFAULTS = { name: '', email: '', role: 'viewer' };

const isDev = Boolean(import.meta.env?.DEV);

function InviteAdminDialog({ open, onClose, onInvite }) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(inviteSchema),
    defaultValues: DEFAULTS,
    mode: 'onBlur',
  });

  const [topError, setTopError] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    reset(DEFAULTS);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTopError(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCredentials(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCopied(false);
  }, [open, reset]);

  const onValid = async (values) => {
    setTopError(null);
    try {
      const result = await onInvite(values);
      setCredentials({
        email: result?.user?.email || values.email,
        tempPassword: result?.tempPassword || null,
      });
    } catch (err) {
      const fieldErrors = err?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message: String(message) });
        });
      }
      setTopError(err?.message || 'Could not send the invite.');
    }
  };

  const handleCopy = async () => {
    if (!credentials?.tempPassword) return;
    try {
      await navigator.clipboard.writeText(credentials.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    onClose?.();
  };

  return (
    <AppDialog
      open={open}
      onClose={closeDialog}
      size="md"
      title={credentials ? 'Invite sent' : 'Invite admin'}
      description={
        credentials
          ? 'Share these temporary credentials with the new teammate.'
          : 'Add a new teammate. They will receive a temporary password to sign in.'
      }
      actions={
        credentials ? (
          <AppButton variant="primary" onClick={closeDialog}>
            Done
          </AppButton>
        ) : (
          <>
            <AppButton variant="ghost" onClick={closeDialog} disabled={isSubmitting}>
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleSubmit(onValid)}
              loading={isSubmitting}
            >
              Send invite
            </AppButton>
          </>
        )
      }
    >
      {credentials ? (
        <div className={styles.inviteResult}>
          <p className={styles.inviteResultLine}>
            <span className={styles.inviteResultLabel}>Email</span>
            <span className={styles.inviteResultValue}>{credentials.email}</span>
          </p>
          {credentials.tempPassword && isDev ? (
            <p className={styles.inviteResultLine}>
              <span className={styles.inviteResultLabel}>Temporary password</span>
              <span className={styles.inviteResultPwd}>
                <code className={styles.inviteResultMono}>
                  {credentials.tempPassword}
                </code>
                <IconButton
                  size="small"
                  aria-label={copied ? 'Copied' : 'Copy temporary password'}
                  onClick={handleCopy}
                  className={styles.copyBtn}
                >
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
                {copied ? (
                  <span className={styles.copiedHint} aria-live="polite">
                    Copied
                  </span>
                ) : null}
              </span>
            </p>
          ) : (
            <Alert severity="info" className={styles.inviteHelpAlert}>
              For security, the temporary password is not shown here. Share it
              with the new admin via a secure channel (1Password, Slack DM,
              etc.).
            </Alert>
          )}
          <p className={styles.inviteHint}>
            The invitee will appear in the list with status <strong>Invited</strong>{' '}
            until they sign in for the first time.
          </p>
        </div>
      ) : (
        <form
          className={styles.inviteForm}
          onSubmit={handleSubmit(onValid)}
          noValidate
        >
          {topError ? (
            <Alert severity="error" className={styles.topError}>
              {topError}
            </Alert>
          ) : null}

          <AppTextField
            label="Full name"
            placeholder="e.g. Aaliyah Hassan"
            {...register('name')}
            error={errors.name?.message}
            fullWidth
          />
          <AppTextField
            label="Email"
            type="email"
            placeholder="name@thisinteriors.com"
            {...register('email')}
            error={errors.email?.message}
            fullWidth
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <AppSelect
                {...field}
                label="Role"
                options={ROLE_OPTIONS}
                error={errors.role?.message}
              />
            )}
          />
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      )}
    </AppDialog>
  );
}

export default InviteAdminDialog;
