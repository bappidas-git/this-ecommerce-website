import AppButton from '../AppButton/AppButton.jsx';
import styles from './ErrorState.module.css';

function ErrorState({
  icon,
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  className,
  ...rest
}) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="alert" {...rest}>
      {icon ? (
        <div className={styles.icon} aria-hidden>
          {icon}
        </div>
      ) : null}
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.description}>{description}</p> : null}
      {onRetry ? (
        <div className={styles.cta}>
          <AppButton variant="primary" onClick={onRetry}>
            {retryLabel}
          </AppButton>
        </div>
      ) : null}
    </div>
  );
}

export default ErrorState;
