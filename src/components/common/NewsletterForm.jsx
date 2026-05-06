import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowRight } from 'lucide-react';
import { authService } from '../../api/services/authService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getApiErrorMessage } from '../../hooks/useApiError.js';
import useApiFormError from '../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../hooks/useFocusFirstInvalid.js';
import { emailField } from '../../utils/validators.js';
import styles from './NewsletterForm.module.css';

const schema = yup.object({ email: emailField() });

function NewsletterForm({ tone = 'dark', hint, ariaLabel = 'Subscribe to our newsletter' }) {
  const { brand, error: toastError } = useToast();
  const inputId = useId();
  const errorId = useId();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const onApiError = useApiFormError(methods);
  useFocusFirstInvalid(methods, ['email']);

  const onSubmit = async (values) => {
    try {
      if (typeof authService.subscribe === 'function') {
        await authService.subscribe({ email: values.email });
      }
      brand('Thank you — confirmation in your inbox shortly.');
      reset();
    } catch (err) {
      if (err?.errors && typeof err.errors === 'object' && Object.keys(err.errors).length > 0) {
        onApiError(err);
        return;
      }
      toastError(getApiErrorMessage(err) || 'We could not subscribe you just now. Please try again.');
    }
  };

  const hasError = Boolean(errors.email);
  const toneClass =
    tone === 'light'
      ? styles.toneLight
      : tone === 'emerald'
        ? styles.toneEmerald
        : styles.toneDark;
  const hintText = hint || 'One letter a month. Unsubscribe anytime.';

  return (
    <form
      className={[styles.form, toneClass].join(' ')}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label={ariaLabel}
    >
      <label htmlFor={inputId} className={styles.label}>
        Email address
      </label>
      <div className={styles.field}>
        <input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={[styles.input, hasError ? styles.inputError : ''].filter(Boolean).join(' ')}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          disabled={isSubmitting}
          {...register('email')}
        />
        <button
          type="submit"
          className={styles.submit}
          disabled={isSubmitting}
          aria-label="Subscribe to newsletter"
        >
          <span>{isSubmitting ? 'Sending…' : 'Subscribe'}</span>
          <ArrowRight size={16} aria-hidden />
        </button>
      </div>
      {hasError ? (
        <p id={errorId} className={styles.error} role="alert">
          {errors.email?.message}
        </p>
      ) : (
        <p className={styles.hint}>{hintText}</p>
      )}
    </form>
  );
}

export default NewsletterForm;
