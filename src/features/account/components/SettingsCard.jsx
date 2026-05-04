import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import styles from './SettingsCard.module.css';

function SettingsCard({
  as: Tag = 'section',
  title,
  description,
  children,
  formId,
  onSubmit,
  noValidate = true,
  isDirty = false,
  isSubmitting = false,
  isSubmitSuccessful = false,
  submitLabel = 'Save changes',
  hideSaveBar = false,
  saveBarSlot = null,
  className,
  ...rest
}) {
  const showStatus = isDirty || isSubmitSuccessful;
  const statusLabel = isDirty
    ? 'Unsaved changes'
    : isSubmitSuccessful
      ? 'Saved'
      : null;
  const statusClass = [
    styles.status,
    isDirty ? styles.statusDirty : '',
    !isDirty && isSubmitSuccessful ? styles.statusSaved : '',
  ]
    .filter(Boolean)
    .join(' ');

  const Wrapper = onSubmit ? 'form' : Tag;
  const wrapperProps = onSubmit
    ? { onSubmit, noValidate, id: formId }
    : { id: formId };

  return (
    <Wrapper
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...wrapperProps}
      {...rest}
    >
      <header className={styles.header}>
        {title ? <h3 className={styles.title}>{title}</h3> : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </header>
      <div className={styles.body}>{children}</div>

      {hideSaveBar ? null : (
        <div className={styles.saveBar}>
          <span
            className={statusClass}
            aria-live="polite"
            data-visible={showStatus ? 'true' : 'false'}
          >
            {statusLabel || ''}
          </span>
          <div className={styles.saveActions}>
            {saveBarSlot}
            <AppButton
              type="submit"
              variant="primary"
              size="medium"
              loading={isSubmitting}
              disabled={!isDirty || isSubmitting}
              form={formId}
            >
              {submitLabel}
            </AppButton>
          </div>
        </div>
      )}
    </Wrapper>
  );
}

export default SettingsCard;
