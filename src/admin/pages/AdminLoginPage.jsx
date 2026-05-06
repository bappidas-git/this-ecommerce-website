import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Alert from '@mui/material/Alert';

import { theme } from '../../theme/index.js';
import AppTextField from '../../components/common/AppTextField/AppTextField.jsx';
import AppButton from '../../components/common/AppButton/AppButton.jsx';
import Seo from '../../components/common/Seo.jsx';

import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { getApiErrorMessage } from '../../hooks/useApiError.js';
import useApiFormError from '../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../hooks/useFocusFirstInvalid.js';
import { emailField } from '../../utils/validators.js';
import { PATHS } from '../../routes/paths.js';

import styles from './AdminLoginPage.module.css';

const ATTEMPTS_KEY = 'ti_admin_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60 * 1000;

const schema = yup
  .object({
    email: emailField(),
    password: yup.string().required('Please enter your password.').min(1),
  })
  .required();

function safeAdminRedirect(raw) {
  if (!raw || typeof raw !== 'string') return PATHS.admin.root;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  if (!decoded.startsWith('/admin')) return PATHS.admin.root;
  if (decoded.startsWith('//')) return PATHS.admin.root;
  return decoded;
}

function readAttemptsState() {
  if (typeof window === 'undefined') return { count: 0, lockedUntil: 0 };
  try {
    const raw = window.sessionStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      count: Number.isFinite(parsed?.count) ? parsed.count : 0,
      lockedUntil: Number.isFinite(parsed?.lockedUntil) ? parsed.lockedUntil : 0,
    };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function writeAttemptsState(state) {
  if (typeof window === 'undefined') return;
  try {
    if (!state || (state.count === 0 && !state.lockedUntil)) {
      window.sessionStorage.removeItem(ATTEMPTS_KEY);
      return;
    }
    window.sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy mode */
  }
}

function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();

  const [serverError, setServerError] = useState(null);
  const [attempts, setAttempts] = useState(() => readAttemptsState());
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef(null);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectTarget = useMemo(
    () => safeAdminRedirect(params.get('redirect')),
    [params],
  );

  const lockRemaining = attempts.lockedUntil ? attempts.lockedUntil - now : 0;
  const isLocked = lockRemaining > 0;

  useEffect(() => {
    if (!isLocked) {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return undefined;
    }
    tickRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isLocked]);

  // Auto-clear lock when its window expires
  useEffect(() => {
    if (attempts.lockedUntil && attempts.lockedUntil <= now) {
      const cleared = { count: 0, lockedUntil: 0 };
      writeAttemptsState(cleared);
      setAttempts(cleared);
    }
  }, [attempts.lockedUntil, now]);

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const {
    handleSubmit,
    setFocus,
    formState: { isSubmitting, errors },
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, ['email', 'password']);

  useEffect(() => {
    if (!isLocked) setFocus('email');
  }, [isLocked, setFocus]);

  const recordFailure = useCallback(() => {
    const next = { count: attempts.count + 1, lockedUntil: 0 };
    if (next.count >= MAX_ATTEMPTS) {
      next.lockedUntil = Date.now() + LOCK_MS;
    }
    writeAttemptsState(next);
    setAttempts(next);
    setNow(Date.now());
  }, [attempts.count]);

  const clearFailures = useCallback(() => {
    writeAttemptsState({ count: 0, lockedUntil: 0 });
    setAttempts({ count: 0, lockedUntil: 0 });
  }, []);

  const onSubmit = async (values) => {
    if (isLocked) return;
    setServerError(null);
    try {
      await login({ email: values.email.trim(), password: values.password });
      clearFailures();
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      recordFailure();
      if (err?.errors && typeof err.errors === 'object' && Object.keys(err.errors).length > 0) {
        onApiError(err);
        return;
      }
      const message =
        err?.status === 401
          ? "That email and password don't match. Please try again."
          : getApiErrorMessage(err) || 'Sign in failed. Please try again.';
      setServerError(message);
    }
  };

  const appVersion = import.meta.env.VITE_APP_VERSION || '';
  const versionSuffix = appVersion ? `v${appVersion}` : '';

  const remainingFailures = Math.max(0, MAX_ATTEMPTS - attempts.count);
  const showAttemptHint =
    !isLocked && attempts.count > 0 && remainingFailures <= 2 && !errors.email && !errors.password;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Seo title="Admin sign in" noindex />
      <div className={styles.page}>
        <div className={styles.split}>
          <aside className={styles.left} aria-hidden="false">
            <p className={styles.wordmark}>THIS Interiors — Admin</p>
            <hr className={styles.divider} aria-hidden="true" />
            <p className={styles.quote}>
              "Quiet rooms are made by careful hands. Tend the catalogue with the same patience."
            </p>
            <p className={styles.quoteAttribution}>House notes</p>
          </aside>

          <main className={styles.right}>
            <div className={styles.formWrap}>
              <span className={styles.chip}>Admin area</span>
              <h1 className={styles.title}>Sign in</h1>
              <p className={styles.subtitle}>
                Use your administrator credentials to continue.
              </p>

              {isLocked ? (
                <div
                  className={styles.lockNotice}
                  role="status"
                  aria-live="polite"
                  id="admin-login-lock"
                >
                  Too many attempts. Try again in{' '}
                  <span className={styles.lockCountdown}>
                    {formatCountdown(lockRemaining)}
                  </span>
                  .
                </div>
              ) : null}

              {serverError && !isLocked ? (
                <Alert
                  severity="error"
                  variant="outlined"
                  role="alert"
                  className={styles.alert}
                  id="admin-login-error"
                >
                  {serverError}
                  {showAttemptHint ? (
                    <>
                      {' '}
                      {remainingFailures === 1
                        ? '1 attempt remaining before lockout.'
                        : `${remainingFailures} attempts remaining before lockout.`}
                    </>
                  ) : null}
                </Alert>
              ) : null}

              <FormProvider {...methods}>
                <form
                  className={styles.form}
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  aria-describedby={
                    isLocked
                      ? 'admin-login-lock'
                      : serverError
                        ? 'admin-login-error'
                        : undefined
                  }
                >
                  <AppTextField
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="username"
                    required
                    disabled={isLocked}
                    className={styles.field}
                    inputProps={{ 'aria-describedby': 'admin-login-email-helper' }}
                    FormHelperTextProps={{ id: 'admin-login-email-helper' }}
                  />
                  <AppTextField
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={isLocked}
                    className={styles.field}
                    inputProps={{ 'aria-describedby': 'admin-login-password-helper' }}
                    FormHelperTextProps={{ id: 'admin-login-password-helper' }}
                  />

                  <AppButton
                    type="submit"
                    variant="primary"
                    size="large"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isLocked}
                    className={styles.submit}
                  >
                    Sign in to admin
                  </AppButton>
                </form>
              </FormProvider>

              <p className={styles.helpRow}>
                Forgot your password? Contact a system admin.
              </p>
            </div>
          </main>
        </div>

        <footer className={styles.footer}>
          Encrypted connection
          {versionSuffix ? (
            <>
              {' · '}
              <span className={styles.footerNumeric}>{versionSuffix}</span>
            </>
          ) : null}
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default AdminLoginPage;
