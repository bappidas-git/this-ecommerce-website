import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';

import useAccountSection from '../hooks/useAccountSection.js';
import SettingsCard from '../components/SettingsCard.jsx';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';

import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import authService from '../../../api/services/authService.js';

import styles from './AccountPreferences.module.css';

function AccountPreferences() {
  useAccountSection({ descriptor: 'Communication and personalization settings.' });
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const defaults = useMemo(() => {
    const prefs = user?.preferences || {};
    return {
      newsletter: Boolean(prefs.newsletter ?? false),
      restockAlerts: Boolean(prefs.restockAlerts ?? false),
      saleAlerts: Boolean(prefs.saleAlerts ?? false),
      orderUpdates: true,
      language: 'English',
      currency: 'AED',
    };
  }, [user]);

  const methods = useForm({
    mode: 'onChange',
    defaultValues: defaults,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const onSubmit = async (values) => {
    const patch = {
      newsletter: values.newsletter,
      restockAlerts: values.restockAlerts,
      saleAlerts: values.saleAlerts,
      orderUpdates: true,
    };
    // Optimistic update
    const prev = user?.preferences;
    updateUser({ preferences: { ...(prev || {}), ...patch } });
    try {
      const next = await authService.updatePreferences(patch);
      if (next?.preferences) updateUser({ preferences: next.preferences });
      reset(
        {
          ...defaults,
          ...patch,
        },
        { keepIsSubmitted: true, keepSubmitCount: true },
      );
      toast.success('Preferences saved.');
    } catch (err) {
      // rollback
      if (prev) updateUser({ preferences: prev });
      toast.error(getApiErrorMessage(err) || 'Could not save preferences.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Preferences · My Account · THIS Interiors</title>
      </Helmet>
      <FormProvider {...methods}>
        <div className={styles.stack}>
          <SettingsCard
            title="Communications"
            description="Choose what we send to your inbox."
            formId="preferences-form"
            onSubmit={handleSubmit(onSubmit)}
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            isSubmitSuccessful={isSubmitSuccessful && !isDirty}
          >
            <div className={styles.checkList}>
              <AppCheckbox
                name="newsletter"
                label="Newsletter — letters from the studio."
                description="A monthly note with new arrivals and styling notes."
              />
              <AppCheckbox
                name="restockAlerts"
                label="Restock alerts."
                description="Hear when your saved pieces return to stock."
              />
              <AppCheckbox
                name="saleAlerts"
                label="Sale alerts."
                description="Quiet notifications during private sales."
              />
              <AppCheckbox
                name="orderUpdates"
                label="Order updates (always on)."
                description="Transactional emails for orders and shipping."
                disabled
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Display"
            description="Language and currency for your account."
            hideSaveBar
          >
            <div className={styles.row2}>
              <AppTextField
                label="Language"
                value="English"
                disabled
                helperText="More languages coming soon."
                InputLabelProps={{ shrink: true }}
              />
              <AppTextField
                label="Currency"
                value="AED"
                disabled
                helperText="Currently AED only."
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </SettingsCard>
        </div>
      </FormProvider>
    </>
  );
}

export default AccountPreferences;
