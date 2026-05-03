import { forwardRef } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Link as RouterLink } from 'react-router-dom';
import styles from './AppButton.module.css';

const VARIANT_MAP = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'primary' },
  ghost: { variant: 'text', color: 'primary' },
  danger: { variant: 'contained', color: 'error' },
};

const SIZE_PROGRESS = {
  small: 16,
  medium: 18,
  large: 20,
};

const AppButton = forwardRef(function AppButton(
  {
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon = null,
    iconPosition = 'start',
    fullWidth = false,
    to,
    href,
    type = 'button',
    onClick,
    className,
    children,
    as,
    ...rest
  },
  ref,
) {
  const mapped = VARIANT_MAP[variant] || VARIANT_MAP.primary;
  const isDisabled = disabled || loading;

  const startIcon =
    loading && iconPosition === 'start'
      ? <CircularProgress size={SIZE_PROGRESS[size] || 18} thickness={5} color="inherit" />
      : iconPosition === 'start'
        ? icon
        : undefined;

  const endIcon =
    loading && iconPosition === 'end'
      ? <CircularProgress size={SIZE_PROGRESS[size] || 18} thickness={5} color="inherit" />
      : iconPosition === 'end'
        ? icon
        : undefined;

  const linkProps = to
    ? { component: RouterLink, to }
    : href
      ? { component: 'a', href }
      : as
        ? { component: as }
        : {};

  const classes = [styles.root, styles[`variant_${variant}`], className].filter(Boolean).join(' ');

  return (
    <Button
      ref={ref}
      type={to || href ? undefined : type}
      variant={mapped.variant}
      color={mapped.color}
      size={size}
      disabled={isDisabled}
      fullWidth={fullWidth}
      onClick={isDisabled ? undefined : onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      aria-busy={loading || undefined}
      className={classes}
      {...linkProps}
      {...rest}
    >
      {children}
    </Button>
  );
});

export default AppButton;
