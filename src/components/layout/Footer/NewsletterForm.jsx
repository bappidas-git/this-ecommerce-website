import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { ArrowRight } from 'lucide-react';
import { authService } from '../../../api/services/authService.js';
import styles from './NewsletterForm.module.css';

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Please enter your email address.')
    .email('Please enter a valid email address.'),
});

function NewsletterForm() {
  const { enqueueSnackbar } = useSnackbar();
  const inputId = useId();
  const errorId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values) => {
    try {
      if (typeof authService.subscribe === 'function') {
        await authService.subscribe({ email: values.email });
      }
      enqueueSnackbar('Thank you — confirmation in your inbox shortly.', {
        variant: 'success',
      });
      reset();
    } catch (err) {
      enqueueSnackbar('We could not subscribe you just now. Please try again.', {
        variant: 'error',
      });
    }
  };

  const hasError = Boolean(errors.email);

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Subscribe to our newsletter"
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
        <p className={styles.hint}>One letter a month. Unsubscribe anytime.</p>
      )}
    </form>
  );
}

export default NewsletterForm;
