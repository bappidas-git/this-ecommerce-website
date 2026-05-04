import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import useAccountSection from '../hooks/useAccountSection.js';
import SettingsCard from '../components/SettingsCard.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import PasswordStrengthMeter from '../../auth/components/PasswordStrengthMeter.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import authService from '../../../api/services/authService.js';

import styles from './AccountPassword.module.css';

const FIELD_ORDER = ['currentPassword', 'newPassword', 'confirmPassword'];

const schema = yup
  .object({
    currentPassword: yup.string().required('Please enter your current password.'),
    newPassword: yup
      .string()
      .required('Please choose a new password.')
      .min(8, 'Use at least 8 characters.')
      .matches(/[a-z]/, 'Add a lowercase letter.')
      .matches(/[A-Z]/, 'Add an uppercase letter.')
      .matches(/\d/, 'Add a number.'),
    confirmPassword: yup
      .string()
      .required('Please confirm your new password.')
      .oneOf([yup.ref('newPassword')], 'Passwords must match.'),
  })
  .required();

function AccountPassword() {
  useAccountSection({ descriptor: 'Change your password.' });
  const { rotateToken } = useAuth();
  const toast = useToast();

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isDirty, isSubmitting, isSubmitSuccessful, errors, submitCount },
  } = methods;

  useEffect(() => {
    if (!submitCount) return;
    const first = FIELD_ORDER.find((name) => errors[name]);
    if (first) setFocus(first);
  }, [errors, setFocus, submitCount]);

  const onSubmit = async (values) => {
    try {
      const response = await authService.updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (response?.token) rotateToken(response.token);
      reset(
        { currentPassword: '', newPassword: '', confirmPassword: '' },
        { keepIsSubmitted: true, keepSubmitCount: true },
      );
      toast.success("Password updated. You'll stay signed in.");
    } catch (err) {
      const fieldErrors = err?.errors;
      let mapped = false;
      if (fieldErrors && typeof fieldErrors === 'object') {
        for (const key of Object.keys(fieldErrors)) {
          const raw = fieldErrors[key];
          const message = Array.isArray(raw) ? raw[0] : raw;
          if (!message) continue;
          setError(
            key,
            { type: 'server', message: String(message) },
            { shouldFocus: !mapped },
          );
          mapped = true;
        }
      }
      if (!mapped) {
        toast.error(getApiErrorMessage(err) || 'Could not update password.');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Password · My Account · THIS Interiors</title>
      </Helmet>
      <FormProvider {...methods}>
        <SettingsCard
          title="Change password"
          description="Choose a strong password you don't use anywhere else."
          formId="password-form"
          onSubmit={handleSubmit(onSubmit)}
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          isSubmitSuccessful={isSubmitSuccessful && !isDirty}
          submitLabel="Update password"
        >
          <AppTextField
            name="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
          />

          <div className={styles.field}>
            <AppTextField
              name="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              required
            />
            <PasswordStrengthMeter name="newPassword" />
          </div>

          <AppTextField
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
          />
        </SettingsCard>
      </FormProvider>
    </>
  );
}

export default AccountPassword;
