import { forwardRef } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import styles from './AppIconButton.module.css';

const AppIconButton = forwardRef(function AppIconButton(
  {
    'aria-label': ariaLabel,
    label,
    tooltip,
    size = 'medium',
    color = 'default',
    edge = false,
    disabled = false,
    children,
    className,
    ...rest
  },
  ref,
) {
  const accessibleLabel = ariaLabel || label || tooltip;

  if (!accessibleLabel && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('AppIconButton requires an aria-label, label, or tooltip prop for accessibility.');
  }

  const button = (
    <IconButton
      ref={ref}
      size={size}
      color={color}
      edge={edge}
      disabled={disabled}
      aria-label={accessibleLabel || 'icon button'}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </IconButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow disableInteractive>
        <span className={styles.tooltipWrap}>{button}</span>
      </Tooltip>
    );
  }

  return button;
});

export default AppIconButton;
