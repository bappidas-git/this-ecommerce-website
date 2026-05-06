import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';

import AuthShell from '../components/AuthShell.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { emailField } from '../../../utils/validators.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './ForgotPasswordPage.module.css';

const COOLDOWN_KEY = 'ti_forgot_cooldown';
const COOLDOWN_SECONDS = 60;

const schema = yup.object({ email: emailField() }).required();

function readCooldown() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(COOLDOWN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const expires = Number(parsed.expiresAt);
    if (!Number.isFinite(expires)) return null;
    return { email: String(parsed.email || ''), expiresAt: expires };
  } catch {
    return null;
  }
}

function writeCooldown(value) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(COOLDOWN_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 6.5h17v11h-17z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConfirmationCard({ email, expiresAt, onResend, isResending }) {
  const computeRemaining = () =>
    expiresAt ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 0;

  const [secondsLeft, setSecondsLeft] = useState(computeRemaining);

  useEffect(() => {
    setSecondsLeft(computeRemaining());
    if (!expiresAt || expiresAt <= Date.now()) return undefined;
    const id = window.setInterval(() => {
      const remaining = expiresAt
        ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
        : 0;
      setSecondsLeft(remaining);
      if (remaining <= 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const canResend = secondsLeft <= 0 && !isResending;
  const formatted = String(secondsLeft).padStart(2, '0');

  return (
    <div className={styles.confirmCard}>
      <span className={styles.confirmIcon} aria-hidden="true">
        <MailIcon />
      </span>
      <Eyebrow as="p" color="muted" className={styles.eyebrow}>
        Check your email
      </Eyebrow>
      <h1 className={styles.confirmTitle}>
        We&apos;ve sent reset instructions to{' '}
        <span className={styles.confirmEmail}>{email}</span>.
      </h1>
      <p className={styles.confirmKicker}>
        If you don&apos;t see it within a few minutes, check spam or try again.
      </p>

      <div
        className={styles.cooldownRow}
        aria-live="polite"
        role="status"
      >
        <AppButton
          type="button"
          variant="secondary"
          size="medium"
          onClick={onResend}
          loading={isResending}
          disabled={!canResend}
        >
          Resend
        </AppButton>
        {secondsLeft > 0 ? (
          <span className={styles.cooldown}>Resend in {formatted}s</span>
        ) : null}
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const { forgot } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [confirmedEmail, setConfirmedEmail] = useState(() => {
    const stored = readCooldown();
    return stored?.email || null;
  });
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState(() => {
    const stored = readCooldown();
    return stored?.expiresAt || 0;
  });
  const [isResending, setIsResending] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, ['email']);

  useEffect(() => {
    if (!confirmedEmail) setFocus('email');
  }, [confirmedEmail, setFocus]);

  const sendForEmail = useCallback(
    async (email) => {
      const trimmed = String(email || '').trim();
      if (!trimmed) return false;
      try {
        await forgot({ email: trimmed });
        const nextExpiresAt = Date.now() + COOLDOWN_SECONDS * 1000;
        writeCooldown({ email: trimmed, expiresAt: nextExpiresAt });
        setConfirmedEmail(trimmed);
        setCooldownExpiresAt(nextExpiresAt);
        setServerError(null);
        return true;
      } catch (err) {
        if (err?.errors && typeof err.errors === 'object') {
          onApiError(err);
          return false;
        }
        const message =
          err?.status === 429
            ? 'You’ve requested too many resets. Please wait a moment and try again.'
            : getApiErrorMessage(err) || 'Could not send reset instructions. Please try again.';
        setServerError(message);
        return false;
      }
    },
    [forgot, onApiError],
  );

  const onSubmit = async (values) => {
    setServerError(null);
    await sendForEmail(values.email);
  };

  const onResend = async () => {
    if (!confirmedEmail) return;
    if (cooldownExpiresAt && cooldownExpiresAt > Date.now()) return;
    setIsResending(true);
    try {
      await sendForEmail(confirmedEmail);
    } finally {
      setIsResending(false);
    }
  };

  const announcement = useMemo(
    () => (confirmedEmail ? `Reset link sent to ${confirmedEmail}` : ''),
    [confirmedEmail],
  );

  return (
    <>
      <Seo title="Forgot password | THIS Interiors" noindex />
      <AuthShell>
        {confirmedEmail ? (
          <>
            <ConfirmationCard
              email={confirmedEmail}
              expiresAt={cooldownExpiresAt}
              onResend={onResend}
              isResending={isResending}
            />
            <div className={styles.srOnly} aria-live="polite" role="status">
              {announcement}
            </div>
            {serverError ? (
              <Alert
                severity="error"
                variant="outlined"
                role="alert"
                className={styles.alert}
                style={{ marginTop: 16 }}
              >
                {serverError}
              </Alert>
            ) : null}
            <p className={styles.signinLine}>
              Remembered it?
              <Link to={PATHS.auth.login} className={styles.signinLink}>
                Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <Eyebrow as="p" color="brass" className={styles.eyebrow}>
              Forgot password
            </Eyebrow>
            <h1 className={styles.title}>Reset your password</h1>
            <hr className={styles.divider} aria-hidden="true" />

            <p className={styles.intro}>
              Enter the email tied to your account and we&apos;ll send a link to
              choose a new password.
            </p>

            {serverError ? (
              <Alert
                severity="error"
                variant="outlined"
                role="alert"
                className={styles.alert}
                id="forgot-server-error"
              >
                {serverError}
              </Alert>
            ) : null}

            <FormProvider {...methods}>
              <form
                className={styles.form}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                aria-describedby={serverError ? 'forgot-server-error' : undefined}
              >
                <AppTextField
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  className={styles.field}
                />

                <AppButton
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isSubmitting}
                  className={styles.submit}
                >
                  Send reset link
                </AppButton>
              </form>
            </FormProvider>

            <p className={styles.signinLine}>
              Remembered it?
              <Link to={PATHS.auth.login} className={styles.signinLink}>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </AuthShell>
    </>
  );
}

export default ForgotPasswordPage;
