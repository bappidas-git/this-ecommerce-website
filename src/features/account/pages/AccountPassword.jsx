import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import useAccountSection from '../hooks/useAccountSection.js';
import SettingsCard from '../components/SettingsCard.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import Seo from '../../../components/common/Seo.jsx';
import PasswordStrengthMeter from '../../auth/components/PasswordStrengthMeter.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { passwordField } from '../../../utils/validators.js';
import authService from '../../../api/services/authService.js';

import styles from './AccountPassword.module.css';

const FIELD_ORDER = ['currentPassword', 'newPassword', 'confirmPassword'];

const schema = yup
  .object({
    currentPassword: yup.string().required('Please enter your current password.'),
    newPassword: passwordField({ label: 'new password' }),
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
    formState: { isDirty, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, FIELD_ORDER);

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
      if (err?.errors && typeof err.errors === 'object' && Object.keys(err.errors).length > 0) {
        onApiError(err);
        return;
      }
      toast.error(getApiErrorMessage(err) || 'Could not update password.');
    }
  };

  return (
    <>
      <Seo title="Password · My Account · THIS Interiors" noindex />
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
