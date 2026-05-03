import CircularProgress from '@mui/material/CircularProgress';
import styles from './Loader.module.css';

const SIZE_PX = {
  sm: 18,
  md: 28,
  lg: 44,
};

function Loader({
  size = 'md',
  label,
  fullScreen = false,
  wordmark = false,
  className,
  ...rest
}) {
  const px = SIZE_PX[size] || SIZE_PX.md;
  const classes = [
    styles.root,
    fullScreen ? styles.fullScreen : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="status"
      aria-live="polite"
      aria-busy="true"
      {...rest}
    >
      {wordmark ? (
        <span className={styles.wordmark} aria-hidden>
          THIS Interiors
        </span>
      ) : null}
      <CircularProgress
        size={px}
        thickness={4}
        sx={{ color: 'primary.main' }}
      />
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={styles.srOnly}>{label || 'Loading'}</span>
    </div>
  );
}

export default Loader;
