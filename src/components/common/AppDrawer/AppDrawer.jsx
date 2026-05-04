import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import styles from './AppDrawer.module.css';

const ANCHOR_WIDTHS = {
  left: { xs: '100vw', sm: 380, md: 420 },
  right: { xs: '100vw', sm: 380, md: 420 },
  top: { height: 'auto', maxHeight: '85vh', width: '100%' },
  bottom: { height: 'auto', maxHeight: '85vh', width: '100%' },
};

function AppDrawer({
  open,
  onClose,
  anchor = 'right',
  title,
  description,
  footer,
  children,
  width,
  className,
  hideHeader = false,
  ariaLabelledBy,
  paperRef,
  closeButtonRef,
  closeButtonLabel = 'Close drawer',
  disableScrollLock = false,
  ...rest
}) {
  // Side-anchored drawers (left/right) cover one edge of the viewport, so the
  // body doesn't need to scroll-lock; opting out also avoids the well-known
  // "body stuck with overflow:hidden" bug when the drawer unmounts mid-close.
  // Top/bottom sheets keep the lock for a calmer mobile experience.
  const shouldLock = !disableScrollLock && (anchor === 'top' || anchor === 'bottom');

  const widths = ANCHOR_WIDTHS[anchor] || ANCHOR_WIDTHS.right;
  const paperSx =
    anchor === 'top' || anchor === 'bottom'
      ? { width: '100%', maxHeight: widths.maxHeight }
      : { width: width ?? widths };

  return (
    <Drawer
      anchor={anchor}
      open={Boolean(open)}
      onClose={onClose}
      disableScrollLock={!shouldLock}
      PaperProps={{ className: styles.paper, sx: paperSx, ref: paperRef }}
      ModalProps={{ keepMounted: false }}
      aria-labelledby={ariaLabelledBy || (title ? 'app-drawer-title' : undefined)}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {!hideHeader ? (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title ? (
              <h2 id="app-drawer-title" className={styles.title}>
                {title}
              </h2>
            ) : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          <IconButton
            ref={closeButtonRef}
            onClick={onClose}
            aria-label={closeButtonLabel}
            size="small"
            className={styles.close}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      ) : null}

      <div className={styles.body}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </Drawer>
  );
}

export default AppDrawer;
