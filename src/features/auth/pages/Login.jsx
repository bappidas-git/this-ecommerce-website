import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';

import AuthShell from '../components/AuthShell.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './Login.module.css';

const schema = yup
  .object({
    email: yup
      .string()
      .trim()
      .required('Please enter your email.')
      .email("That email doesn't look right."),
    password: yup.string().required('Please enter your password.').min(1),
    remember: yup.boolean(),
  })
  .required();

function safeRedirectTarget(raw) {
  if (!raw || typeof raw !== 'string') return PATHS.home;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  if (!decoded.startsWith('/')) return PATHS.home;
  if (decoded.startsWith('//')) return PATHS.home;
  if (decoded.toLowerCase().startsWith('/admin')) return PATHS.account.profile;
  return decoded;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [serverError, setServerError] = useState(null);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectTarget = useMemo(() => safeRedirectTarget(params.get('redirect')), [params]);
  const prefilledEmail = params.get('email') || '';

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      email: prefilledEmail,
      password: '',
      remember: true,
    },
  });

  const {
    handleSubmit,
    setFocus,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (!prefilledEmail) {
      setFocus('email');
    } else {
      setFocus('password');
    }
  }, [prefilledEmail, setFocus]);

  useEffect(() => {
    const fieldOrder = ['email', 'password'];
    const firstInvalid = fieldOrder.find((name) => errors[name]);
    if (firstInvalid) {
      setFocus(firstInvalid);
    }
  }, [errors, setFocus]);

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const result = await login({ email: values.email.trim(), password: values.password });
      const firstName =
        result?.user?.firstName ||
        (result?.user?.name ? String(result.user.name).split(' ')[0] : null) ||
        'friend';
      toast.success(`Welcome back, ${firstName}`);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      const message =
        err?.status === 401
          ? 'That email and password don’t match. Please try again.'
          : getApiErrorMessage(err) || 'Sign in failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <>
      <Seo title="Sign in | THIS Interiors" noindex />
      <AuthShell>
        <Eyebrow as="p" color="brass" className={styles.eyebrow}>
          Welcome back
        </Eyebrow>
        <h1 className={styles.title}>Sign in</h1>
        <hr className={styles.divider} aria-hidden="true" />

        {serverError ? (
          <Alert
            severity="error"
            variant="outlined"
            role="alert"
            className={styles.alert}
            id="login-server-error"
          >
            {serverError}
          </Alert>
        ) : null}

        <FormProvider {...methods}>
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-describedby={serverError ? 'login-server-error' : undefined}
          >
            <AppTextField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              className={styles.field}
              inputProps={{ 'aria-describedby': 'login-email-helper' }}
              FormHelperTextProps={{ id: 'login-email-helper' }}
            />
            <AppTextField
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.field}
              inputProps={{ 'aria-describedby': 'login-password-helper' }}
              FormHelperTextProps={{ id: 'login-password-helper' }}
            />

            <div className={styles.row}>
              <AppCheckbox name="remember" label="Remember me" />
              <Link to={PATHS.auth.forgot} className={styles.forgotLink}>
                Forgot your password?
              </Link>
            </div>

            <AppButton
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isSubmitting}
              className={styles.submit}
            >
              Sign in
            </AppButton>
          </form>
        </FormProvider>

        <p className={styles.signupLine}>
          New here?
          <Link to={PATHS.auth.register} className={styles.signupLink}>
            Create an account
          </Link>
        </p>
      </AuthShell>
    </>
  );
}

export default Login;
