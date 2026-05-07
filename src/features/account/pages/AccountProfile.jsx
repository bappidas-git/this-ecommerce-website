import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import useAccountSection from '../hooks/useAccountSection.js';
import SettingsCard from '../components/SettingsCard.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { queueToast } from '../../../utils/toastQueue.js';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { emailField, nameField, phoneField } from '../../../utils/validators.js';
import authService from '../../../api/services/authService.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './AccountProfile.module.css';

const FIELD_ORDER = ['firstName', 'lastName', 'phone', 'dateOfBirth'];

const schema = yup
  .object({
    firstName: nameField({ label: 'first name', max: 50 }),
    lastName: nameField({ label: 'last name', max: 50 }),
    email: emailField(),
    phone: phoneField({ required: false, label: 'phone' })
      .nullable()
      .transform((v) => (v === '' ? null : v)),
    dateOfBirth: yup
      .string()
      .nullable()
      .transform((v) => (v === '' ? null : v))
      .matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Please enter a valid date.',
        excludeEmptyString: true,
      }),
  })
  .required();

function initialsFor(user) {
  const f = user?.firstName?.[0] || '';
  const l = user?.lastName?.[0] || '';
  const initials = `${f}${l}`.trim().toUpperCase();
  return initials || (user?.email?.[0] || 'U').toUpperCase();
}

function avatarUrl(initials) {
  return `https://placehold.co/240x240/B8924F/F7F3ED?text=${encodeURIComponent(initials)}&font=playfair`;
}

function ProfileForm({ user }) {
  const { updateUser } = useAuth();
  const toast = useToast();

  const defaultValues = useMemo(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
    }),
    [user],
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, FIELD_ORDER);

  useEffect(() => {
    reset(defaultValues, { keepDirty: false, keepSubmitCount: true });
  }, [defaultValues, reset]);

  const onSubmit = async (values) => {
    const patch = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone || null,
      dateOfBirth: values.dateOfBirth || null,
    };
    try {
      const next = await authService.updateProfile(patch);
      updateUser(next || patch);
      reset(
        {
          firstName: next?.firstName ?? patch.firstName,
          lastName: next?.lastName ?? patch.lastName,
          email: values.email,
          phone: next?.phone ?? patch.phone ?? '',
          dateOfBirth: next?.dateOfBirth
            ? String(next.dateOfBirth).slice(0, 10)
            : patch.dateOfBirth || '',
        },
        { keepIsSubmitted: true, keepSubmitCount: true },
      );
      toast.success('Profile updated.');
    } catch (err) {
      if (err?.errors && typeof err.errors === 'object' && Object.keys(err.errors).length > 0) {
        onApiError(err);
        return;
      }
      toast.error(getApiErrorMessage(err) || 'Could not save profile.');
    }
  };

  return (
    <FormProvider {...methods}>
      <SettingsCard
        title="Personal information"
        description="Your name and contact details."
        formId="profile-form"
        onSubmit={handleSubmit(onSubmit)}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        isSubmitSuccessful={isSubmitSuccessful && !isDirty}
      >
        <div className={styles.row2}>
          <AppTextField
            name="firstName"
            label="First name"
            autoComplete="given-name"
            required
          />
          <AppTextField
            name="lastName"
            label="Last name"
            autoComplete="family-name"
            required
          />
        </div>

        <AppTextField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          disabled
          helperText="Contact support to change your email."
        />

        <div className={styles.row2}>
          <AppTextField
            name="phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            optional
            placeholder="+971 50 000 0000"
          />
          <AppTextField
            name="dateOfBirth"
            label="Date of birth"
            type="date"
            optional
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </SettingsCard>
    </FormProvider>
  );
}

function AvatarBlock({ user }) {
  const initials = initialsFor(user);
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Your account';
  const role = user?.role || 'customer';

  return (
    <aside className={styles.avatarCard} aria-label="Profile photo">
      <img
        src={avatarUrl(initials)}
        alt={`${fullName} avatar`}
        className={styles.avatarImg}
        width={120}
        height={120}
        loading="lazy"
        decoding="async"
      />
      <div className={styles.avatarMeta}>
        <p className={styles.avatarName}>{fullName}</p>
        <span className={styles.rolePill}>{role}</span>
      </div>
    </aside>
  );
}

const COOLDOWN_SECONDS = 5;

function DangerZone({ user }) {
  const navigate = useNavigate();
  const { logout, clearSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const userEmail = (user?.email || '').trim().toLowerCase();
  const matches =
    confirmEmail.trim().toLowerCase().length > 0 &&
    confirmEmail.trim().toLowerCase() === userEmail;

  useEffect(() => {
    if (!open) return undefined;
    const timer = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  const openDialog = () => {
    setCooldown(COOLDOWN_SECONDS);
    setConfirmEmail('');
    setError(null);
    setOpen(true);
  };

  const closeDialog = () => {
    if (submitting) return;
    setOpen(false);
  };

  const canDelete = matches && cooldown === 0 && !submitting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setSubmitting(true);
    setError(null);
    try {
      await authService.deleteAccount({ confirm: confirmEmail.trim() });
      // Best-effort logout, then clear local state.
      try {
        await logout();
      } catch {
        clearSession?.();
      }
      queueToast({
        variant: 'brand',
        message: 'Your account has been removed.',
      });
      navigate(PATHS.home, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Could not delete account.');
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.danger} aria-labelledby="danger-zone-title">
      <header className={styles.dangerHead}>
        <Eyebrow color="muted" className={styles.dangerEyebrow}>
          <WarningAmberRoundedIcon
            fontSize="inherit"
            className={styles.dangerIcon}
            aria-hidden
          />
          Danger zone
        </Eyebrow>
        <h3 id="danger-zone-title" className={styles.dangerTitle}>
          Delete your account
        </h3>
        <p className={styles.dangerCopy}>
          Removing your account is permanent. Your saved addresses, wishlist, and order
          history will no longer be accessible.
        </p>
      </header>
      <div className={styles.dangerActions}>
        <AppButton variant="ghost" onClick={openDialog} className={styles.dangerBtn}>
          Delete my account
        </AppButton>
      </div>

      <AppDialog
        open={open}
        onClose={closeDialog}
        title="Delete your account"
        description="This action is permanent. To confirm, type your email address below."
        size="sm"
        actions={
          <>
            <AppButton variant="ghost" onClick={closeDialog} disabled={submitting}>
              Cancel
            </AppButton>
            <AppButton
              variant="danger"
              onClick={handleDelete}
              disabled={!canDelete}
              loading={submitting}
            >
              {cooldown > 0 ? `Delete account (${cooldown})` : 'Delete account'}
            </AppButton>
          </>
        }
      >
        <div className={styles.dialogBody}>
          <p className={styles.dialogHint}>
            Type <strong>{user?.email || 'your email'}</strong> to enable deletion.
          </p>
          <AppTextField
            label="Confirm email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            autoComplete="off"
            error={!matches && confirmEmail ? 'Email does not match.' : undefined}
            inputProps={{ 'aria-label': 'Type your email to confirm' }}
          />
          {error ? <p className={styles.dialogError}>{error}</p> : null}
        </div>
      </AppDialog>
    </section>
  );
}

function AccountProfile() {
  useAccountSection({ descriptor: 'Manage your personal details.' });
  const { user } = useAuth();

  return (
    <>
      <Seo title="Profile · My Account · THIS Interiors" noindex />
      <div className={styles.layout}>
        <div className={styles.formCol}>
          {user ? <ProfileForm user={user} /> : null}
        </div>
        <div className={styles.sideCol}>
          <AvatarBlock user={user} />
        </div>
      </div>
      <hr className={styles.divider} aria-hidden="true" />
      <DangerZone user={user} />
    </>
  );
}

export default AccountProfile;
