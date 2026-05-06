import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';

import AuthShell from '../components/AuthShell.jsx';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import Seo from '../../../components/common/Seo.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { emailField, nameField, passwordField } from '../../../utils/validators.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './RegisterPage.module.css';

const FIELD_ORDER = [
  'firstName',
  'lastName',
  'email',
  'password',
  'confirmPassword',
  'acceptsTerms',
];

const schema = yup
  .object({
    firstName: nameField({ label: 'first name', max: 50 }),
    lastName: nameField({ label: 'last name', max: 50 }),
    email: emailField(),
    password: passwordField(),
    confirmPassword: yup
      .string()
      .required('Please confirm your password.')
      .oneOf([yup.ref('password')], 'Passwords must match.'),
    acceptsTerms: yup
      .boolean()
      .oneOf([true], 'Please accept the Terms and Privacy Policy.'),
    subscribe: yup.boolean(),
  })
  .required();

function safeRedirectTarget(raw) {
  if (!raw || typeof raw !== 'string') return PATHS.account.profile;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  if (!decoded.startsWith('/')) return PATHS.account.profile;
  if (decoded.startsWith('//')) return PATHS.account.profile;
  if (decoded.toLowerCase().startsWith('/admin')) return PATHS.account.profile;
  return decoded;
}

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser } = useAuth();
  const toast = useToast();

  const [serverError, setServerError] = useState(null);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectTarget = useMemo(() => safeRedirectTarget(params.get('redirect')), [params]);

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptsTerms: false,
      subscribe: true,
    },
  });

  const {
    handleSubmit,
    setError,
    setFocus,
    formState: { isSubmitting },
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, FIELD_ORDER);

  useEffect(() => {
    setFocus('firstName');
  }, [setFocus]);

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const result = await registerUser({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        subscribe: Boolean(values.subscribe),
      });
      const firstName =
        result?.user?.firstName ||
        (result?.user?.name ? String(result.user.name).split(' ')[0] : null) ||
        values.firstName.trim() ||
        'friend';
      toast.brand(`Welcome to THIS Interiors, ${firstName}.`);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      const fieldErrors = err?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const emailRaw = fieldErrors.email;
        const emailMsg = Array.isArray(emailRaw) ? emailRaw[0] : emailRaw;
        if (emailMsg === 'taken') {
          setError(
            'email',
            { type: 'server', message: 'That email is already registered. Try signing in.' },
            { shouldFocus: true },
          );
          return;
        }
        onApiError(err);
        return;
      }
      const message =
        err?.status === 409
          ? 'That email is already registered. Try signing in.'
          : getApiErrorMessage(err) || 'Registration failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <>
      <Seo title="Create an account | THIS Interiors" noindex />
      <AuthShell>
        <Eyebrow as="p" color="brass" className={styles.eyebrow}>
          Begin your collection
        </Eyebrow>
        <h1 className={styles.title}>Create an account</h1>
        <hr className={styles.divider} aria-hidden="true" />

        {serverError ? (
          <Alert
            severity="error"
            variant="outlined"
            role="alert"
            className={styles.alert}
            id="register-server-error"
          >
            {serverError}
          </Alert>
        ) : null}

        <FormProvider {...methods}>
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-describedby={serverError ? 'register-server-error' : undefined}
          >
            <div className={styles.nameRow}>
              <AppTextField
                name="firstName"
                label="First name"
                autoComplete="given-name"
                required
                className={styles.field}
              />
              <AppTextField
                name="lastName"
                label="Last name"
                autoComplete="family-name"
                required
                className={styles.field}
              />
            </div>

            <div className={styles.fieldGroup}>
              <AppTextField
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                required
                className={styles.field}
                inputProps={{ 'aria-describedby': 'register-email-helper' }}
              />
              <p id="register-email-helper" className={styles.helper}>
                We&apos;ll never share your email.{' '}
                <Link to={PATHS.privacy}>Read our privacy policy.</Link>
              </p>
            </div>

            <div className={styles.fieldGroup}>
              <AppTextField
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                required
                className={styles.field}
                inputProps={{ 'aria-describedby': 'register-password-helper' }}
              />
              <PasswordStrengthMeter name="password" />
              <p id="register-password-helper" className={styles.helper}>
                Use 8+ characters with a number and a capital letter.
              </p>
            </div>

            <AppTextField
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              className={styles.field}
            />

            <div className={styles.checkboxes}>
              <AppCheckbox
                name="acceptsTerms"
                label={
                  <span className={styles.termsLabel}>
                    I agree to the <Link to={PATHS.terms}>Terms</Link> and{' '}
                    <Link to={PATHS.privacy}>Privacy Policy</Link>.
                  </span>
                }
              />
              <AppCheckbox
                name="subscribe"
                label={
                  <span className={styles.subscribeLabel}>
                    Receive letters from the studio.
                  </span>
                }
              />
            </div>

            <AppButton
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isSubmitting}
              className={styles.submit}
            >
              Create account
            </AppButton>
          </form>
        </FormProvider>

        <p className={styles.signinLine}>
          Already have an account?
          <Link to={PATHS.auth.login} className={styles.signinLink}>
            Sign in
          </Link>
        </p>
      </AuthShell>
    </>
  );
}

export default RegisterPage;
