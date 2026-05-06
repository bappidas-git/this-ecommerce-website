import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';

import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import Loader from '../../../components/common/Loader/Loader.jsx';
import Rating from '../../../components/common/Rating/Rating.jsx';

import { PATHS } from '../../../routes/paths.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import useHasPurchased from '../../../hooks/useHasPurchased.js';

import styles from './WriteReviewDialog.module.css';

const schema = yup
  .object({
    rating: yup
      .number()
      .typeError('Pick a rating')
      .required('Pick a rating')
      .min(1, 'Pick a rating')
      .max(5),
    title: yup
      .string()
      .trim()
      .required('Add a short title')
      .min(4, 'Title must be at least 4 characters')
      .max(100, 'Title must be 100 characters or fewer'),
    body: yup
      .string()
      .trim()
      .required('Tell us a little more')
      .min(10, 'Please write at least 10 characters')
      .max(800, 'Please keep it under 800 characters'),
  })
  .required();

function CharCounter({ value = '', max }) {
  const len = String(value || '').length;
  const isWarn = len > max - 30;
  const isOver = len > max;
  return (
    <span
      className={[
        styles.counter,
        isWarn ? styles.counterWarn : '',
        isOver ? styles.counterOver : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
    >
      {len}/{max}
    </span>
  );
}

function WriteReviewDialog({ open, onClose, productId, productName, onSubmit }) {
  const { isAuthenticated } = useAuth();
  const { isLoading, hasPurchased } = useHasPurchased(open ? productId : null);

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: { rating: 0, title: '', body: '' },
  });
  const {
    handleSubmit,
    control,
    reset,
    setError,
    watch,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = methods;

  const bodyValue = watch('body');

  useEffect(() => {
    if (open) {
      reset({ rating: 0, title: '', body: '' });
    }
  }, [open, reset]);

  const submit = async (values) => {
    try {
      await onSubmit({ ...values, productId });
    } catch (err) {
      const apiErrors = err?.errors || err?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        Object.entries(apiErrors).forEach(([name, message]) => {
          if (['rating', 'title', 'body'].includes(name)) {
            setError(name, { type: 'server', message: String(message) });
          }
        });
        return;
      }
      setError('root.serverError', {
        type: 'server',
        message: err?.message || 'Could not submit your review.',
      });
    }
  };

  const renderBody = () => {
    if (!isAuthenticated) {
      return (
        <EmptyState
          title="Sign in to write a review"
          description="Reviews are open to verified buyers signed in to their account."
          cta={
            <AppButton variant="primary" to={PATHS.auth.login}>
              Sign in
            </AppButton>
          }
        />
      );
    }
    if (isLoading) {
      return (
        <div className={styles.loadingWrap}>
          <Loader label="Checking your purchases…" />
        </div>
      );
    }
    if (!hasPurchased) {
      return (
        <EmptyState
          title="Reviews are open to verified buyers."
          description="Once you’ve received a piece, you’ll be able to share your thoughts here."
          cta={
            <AppButton variant="primary" to={PATHS.shop} onClick={onClose}>
              Browse the collection
            </AppButton>
          }
        />
      );
    }

    if (isSubmitSuccessful) {
      return (
        <div className={styles.successWrap}>
          <h3 className={styles.successTitle}>Thank you.</h3>
          <p className={styles.successBody}>
            Your review will appear once reviewed by our team.
          </p>
          <div className={styles.successActions}>
            <AppButton variant="primary" onClick={onClose}>
              Done
            </AppButton>
          </div>
        </div>
      );
    }

    const rootError = errors?.root?.serverError?.message;

    return (
      <FormProvider {...methods}>
        <form
          className={styles.form}
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          {rootError ? (
            <Alert severity="error" variant="outlined" role="alert">
              {rootError}
            </Alert>
          ) : null}

          <Controller
            name="rating"
            control={control}
            render={({ field, fieldState }) => (
              <div className={styles.ratingField}>
                <span className={styles.ratingLabel}>Your rating</span>
                <Rating
                  value={Number(field.value) || 0}
                  onChange={(v) => field.onChange(v || 0)}
                  size="md"
                  precision={1}
                />
                {fieldState.error ? (
                  <span className={styles.fieldError}>{fieldState.error.message}</span>
                ) : null}
              </div>
            )}
          />

          <AppTextField
            name="title"
            label="Headline"
            placeholder="Sum it up"
            inputProps={{ maxLength: 120 }}
            required
          />

          <div className={styles.textareaWrap}>
            <AppTextField
              name="body"
              label="Your review"
              placeholder="Tell us about how it lives with you."
              multiline
              minRows={5}
              maxRows={10}
              inputProps={{ maxLength: 1000 }}
              required
            />
            <CharCounter value={bodyValue} max={800} />
          </div>

          <div className={styles.actions}>
            <AppButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </AppButton>
            <AppButton type="submit" variant="primary" loading={isSubmitting}>
              Post review
            </AppButton>
          </div>
        </form>
      </FormProvider>
    );
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      size="md"
      title={productName ? `Write a review · ${productName}` : 'Write a review'}
      ariaLabelledBy="write-review-title"
    >
      {renderBody()}
    </AppDialog>
  );
}

export default WriteReviewDialog;
