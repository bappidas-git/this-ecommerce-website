import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';

import BrandSnackbar from '../components/common/BrandSnackbar/BrandSnackbar.jsx';
import { drainToastQueue } from '../utils/toastQueue.js';

const SNACK_COMPONENTS = {
  success: BrandSnackbar,
  error: BrandSnackbar,
  info: BrandSnackbar,
  warning: BrandSnackbar,
  brand: BrandSnackbar,
};

const DESKTOP_QUERY = '(min-width: 768px)';

const ToastContext = createContext(null);

function useDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return true;
    }
    return window.matchMedia(DESKTOP_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mq = window.matchMedia(DESKTOP_QUERY);
    const handler = (event) => setIsDesktop(event.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  return isDesktop;
}

function ToastBridge({ children }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const location = useLocation();

  const enqueue = useCallback(
    (variant, message, options = {}) => {
      if (!message) return null;
      return enqueueSnackbar(message, { ...options, variant });
    },
    [enqueueSnackbar],
  );

  const value = useMemo(
    () => ({
      success: (message, options) => enqueue('success', message, options),
      error: (message, options) => enqueue('error', message, options),
      info: (message, options) => enqueue('info', message, options),
      warning: (message, options) => enqueue('warning', message, options),
      brand: (message, options) => enqueue('brand', message, options),
      dismiss: (key) => closeSnackbar(key),
    }),
    [enqueue, closeSnackbar],
  );

  // Drain queued toasts on mount and on every route change.
  useEffect(() => {
    const items = drainToastQueue();
    for (const t of items) {
      enqueueSnackbar(t.message, { variant: t.variant });
    }
  }, [location.pathname, location.search, enqueueSnackbar]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function ToastProvider({ children }) {
  const isDesktop = useDesktop();

  return (
    <SnackbarProvider
      key={isDesktop ? 'desk' : 'mob'}
      maxSnack={3}
      autoHideDuration={4000}
      preventDuplicate
      anchorOrigin={
        isDesktop
          ? { vertical: 'bottom', horizontal: 'right' }
          : { vertical: 'top', horizontal: 'center' }
      }
      Components={SNACK_COMPONENTS}
    >
      <ToastBridge>{children}</ToastBridge>
    </SnackbarProvider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

export { ToastContext };
export default ToastContext;
