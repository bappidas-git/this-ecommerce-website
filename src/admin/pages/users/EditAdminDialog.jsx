import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';

import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import { nameField } from '../../../utils/validators.js';

import styles from './UsersPage.module.css';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'viewer', label: 'Viewer' },
];

const editSchema = yup.object({
  name: nameField({ label: 'name', min: 1, max: 80 }),
  role: yup
    .string()
    .oneOf(['admin', 'manager', 'viewer'], 'Please choose a role.')
    .required('Please choose a role.'),
});

function EditAdminDialog({ open, user, onClose, onSave, isLastAdmin }) {
  const methods = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: { name: '', role: 'viewer' },
    mode: 'onBlur',
  });
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, ['name', 'role']);

  const [topError, setTopError] = useState(null);

  useEffect(() => {
    if (!open || !user) return;
    reset({
      name: user.name || '',
      role: user.role || 'viewer',
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTopError(null);
  }, [open, user, reset]);

  const onValid = async (values) => {
    setTopError(null);
    if (
      isLastAdmin &&
      user?.role === 'admin' &&
      values.role !== 'admin'
    ) {
      setError('role', {
        type: 'business',
        message:
          'You cannot remove the admin role from the last remaining admin.',
      });
      return;
    }
    try {
      await onSave({ name: values.name.trim(), role: values.role });
      onClose?.();
    } catch (err) {
      const fieldErrors = err?.errors;
      if (fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
        onApiError(err);
        return;
      }
      setTopError(getApiErrorMessage(err) || 'Could not save changes.');
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
      title="Edit admin user"
      description="Update the teammate's display name and role."
      actions={
        <>
          <AppButton variant="ghost" onClick={closeDialog} disabled={isSubmitting}>
            Cancel
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSubmit(onValid)}
            loading={isSubmitting}
          >
            Save changes
          </AppButton>
        </>
      }
    >
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
          {...register('name')}
          error={errors.name?.message}
          fullWidth
        />
        <AppTextField
          label="Email"
          value={user?.email || ''}
          disabled
          helperText="Email cannot be changed after the account is created."
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
        {isLastAdmin && user?.role === 'admin' ? (
          <Alert severity="info" className={styles.lastAdminAlert}>
            This is the last remaining admin. The admin role must stay
            assigned.
          </Alert>
        ) : null}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </AppDialog>
  );
}

export default EditAdminDialog;
