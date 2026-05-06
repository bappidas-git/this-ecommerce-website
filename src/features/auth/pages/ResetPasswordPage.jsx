import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';

import AuthShell from '../components/AuthShell.jsx';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { passwordField } from '../../../utils/validators.js';
import { queueToast, queueBanner } from '../../../utils/toastQueue.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './ResetPasswordPage.module.css';

const FIELD_ORDER = ['password', 'confirmPassword'];

const schema = yup
  .object({
    password: passwordField(),
    confirmPassword: yup
      .string()
      .required('Please confirm your password.')
      .oneOf([yup.ref('password')], 'Passwords must match.'),
  })
  .required();

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reset } = useAuth();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [serverError, setServerError] = useState(null);

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const {
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, FIELD_ORDER);

  useEffect(() => {
    if (token) setFocus('password');
  }, [token, setFocus]);

  if (!token) {
    return (
      <>
        <Seo title="Reset password | THIS Interiors" noindex />
        <AuthShell>
          <Eyebrow as="p" color="brass" className={styles.eyebrow}>
            Reset password
          </Eyebrow>
          <EmptyState
            title="This link is no longer valid."
            description="The reset link may have expired or already been used. Request a new one and we'll send a fresh link to your email."
            cta={
              <AppButton variant="primary" size="medium" to={PATHS.auth.forgot}>
                Request a new link
              </AppButton>
            }
          />
        </AuthShell>
      </>
    );
  }

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await reset({ token, password: values.password });
      queueToast({
        variant: 'success',
        message: 'Your password has been updated. Sign in to continue.',
      });
      queueBanner({
        severity: 'success',
        message: 'Password updated. Sign in below.',
        scope: 'login',
        durationMs: 8000,
      });
      const target = email
        ? `${PATHS.auth.login}?email=${encodeURIComponent(email)}`
        : PATHS.auth.login;
      navigate(target, { replace: true });
    } catch (err) {
      const status = err?.status;
      const fieldErrors = err?.errors;

      if (fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
        onApiError(err);
        return;
      }

      if (status === 410 || status === 400) {
        setServerError(
          'This reset link has expired. Please request a new one to continue.',
        );
      } else if (status === 422) {
        setServerError(
          getApiErrorMessage(err) ||
            'That password doesn’t meet our rules. Please try a different one.',
        );
      } else {
        setServerError(
          getApiErrorMessage(err) || 'Could not reset password. Please try again.',
        );
      }
    }
  };

  return (
    <>
      <Seo title="Choose a new password | THIS Interiors" noindex />
      <AuthShell>
        <Eyebrow as="p" color="brass" className={styles.eyebrow}>
          Reset password
        </Eyebrow>
        <h1 className={styles.title}>Choose a new password</h1>
        <hr className={styles.divider} aria-hidden="true" />

        <p className={styles.intro}>
          {email
            ? `Pick something memorable but secure for ${email}.`
            : 'Pick something memorable but secure.'}
        </p>

        {serverError ? (
          <Alert
            severity="error"
            variant="outlined"
            role="alert"
            className={styles.alert}
            id="reset-server-error"
          >
            {serverError}{' '}
            <Link to={PATHS.auth.forgot} className={styles.signinLink}>
              Request a new link
            </Link>
          </Alert>
        ) : null}

        <FormProvider {...methods}>
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-describedby={serverError ? 'reset-server-error' : undefined}
          >
            <div className={styles.fieldGroup}>
              <AppTextField
                name="password"
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                className={styles.field}
                inputProps={{ 'aria-describedby': 'reset-password-helper' }}
              />
              <PasswordStrengthMeter name="password" />
              <p id="reset-password-helper" className={styles.helper}>
                Use 8+ characters with a number and a capital letter.
              </p>
            </div>

            <AppTextField
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
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
              Update password
            </AppButton>
          </form>
        </FormProvider>

        <p className={styles.signinLine}>
          Remembered it?
          <Link
            to={
              email
                ? `${PATHS.auth.login}?email=${encodeURIComponent(email)}`
                : PATHS.auth.login
            }
            className={styles.signinLink}
          >
            Back to sign in
          </Link>
        </p>
      </AuthShell>
    </>
  );
}

export default ResetPasswordPage;
