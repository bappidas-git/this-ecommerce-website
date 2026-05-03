import { forwardRef } from 'react';
import { SnackbarContent, closeSnackbar } from 'notistack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import styles from './BrandSnackbar.module.css';

const ICONS = {
  success: CheckCircleOutlinedIcon,
  error: ErrorOutlineRoundedIcon,
  info: InfoOutlinedIcon,
  warning: WarningAmberRoundedIcon,
  brand: AutoAwesomeOutlinedIcon,
};

const BrandSnackbar = forwardRef(function BrandSnackbar(props, ref) {
  const {
    id,
    message,
    variant = 'info',
    action,
    hideIconVariant,
    persist,
    style,
  } = props;

  const Icon = ICONS[variant] || ICONS.info;
  const variantClass = styles[variant] || styles.info;
  const resolvedAction = typeof action === 'function' ? action(id) : action;
  const showCloseButton = persist || Boolean(resolvedAction);

  return (
    <SnackbarContent ref={ref} role="alert" style={style}>
      <div className={[styles.root, variantClass].join(' ')}>
        {!hideIconVariant ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon fontSize="inherit" />
          </span>
        ) : null}
        <div className={styles.message}>{message}</div>
        {(resolvedAction || showCloseButton) ? (
          <div className={styles.actions}>
            {resolvedAction}
            {showCloseButton ? (
              <button
                type="button"
                className={styles.close}
                aria-label="Dismiss notification"
                onClick={() => closeSnackbar(id)}
              >
                <CloseRoundedIcon fontSize="inherit" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </SnackbarContent>
  );
});

export default BrandSnackbar;
