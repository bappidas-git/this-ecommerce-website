import { forwardRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import styles from './AppDialog.module.css';

const SIZE_MAX_WIDTH = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

const PaperWrap = forwardRef(function PaperWrap(props, ref) {
  const {
    children,
    className,
    elevation,
    square,
    variant,
    ownerState,
    sx,
    ...domProps
  } = props;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 4 }}
      transition={{ duration: 0.22, ease: [0.2, 0.6, 0.2, 1] }}
      className={[styles.paper, className].filter(Boolean).join(' ')}
      {...domProps}
    >
      {children}
    </motion.div>
  );
});

function AppDialog({
  open,
  onClose,
  title,
  description,
  icon,
  actions,
  size = 'md',
  dismissible = true,
  children,
  className,
  ariaLabelledBy,
  ...rest
}) {
  const handleClose = (event, reason) => {
    if (!dismissible && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
    onClose?.(event, reason);
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      maxWidth={SIZE_MAX_WIDTH[size] || 'sm'}
      fullWidth
      PaperComponent={PaperWrap}
      aria-labelledby={ariaLabelledBy || (title ? 'app-dialog-title' : undefined)}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {(title || dismissible) ? (
        <div className={styles.header}>
          {icon ? <span className={styles.icon} aria-hidden>{icon}</span> : null}
          {title ? (
            <DialogTitle id="app-dialog-title" className={styles.title}>
              {title}
            </DialogTitle>
          ) : <span className={styles.title} />}
          {dismissible ? (
            <IconButton
              onClick={(e) => onClose?.(e, 'closeButton')}
              aria-label="Close dialog"
              size="small"
              className={styles.close}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : null}
        </div>
      ) : null}

      <DialogContent className={styles.content}>
        {description ? <p className={styles.description}>{description}</p> : null}
        {children}
      </DialogContent>

      {actions ? <DialogActions className={styles.actions}>{actions}</DialogActions> : null}
    </Dialog>
  );
}

export default AppDialog;
