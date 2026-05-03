import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAdminAuth } from '../admin/context/AdminAuthContext.jsx';
import { PATHS } from './paths.js';

const TOAST_QUEUE_KEY = 'ti_admin_toast_queue';

function queueToast(toast) {
  try {
    const existing = JSON.parse(sessionStorage.getItem(TOAST_QUEUE_KEY) || '[]');
    existing.push(toast);
    sessionStorage.setItem(TOAST_QUEUE_KEY, JSON.stringify(existing));
  } catch {
    // sessionStorage may be unavailable; non-fatal for guard logic
  }
}

function RequireAdmin({ children, permission }) {
  const { isAuthenticated, isLoading, hasPermission } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={28} thickness={4} color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${PATHS.admin.login}?redirect=${redirect}`} replace />;
  }

  if (permission && typeof hasPermission === 'function' && !hasPermission(permission)) {
    queueToast({
      variant: 'warning',
      message: 'You do not have permission to view that page.',
    });
    return <Navigate to={PATHS.admin.root} replace />;
  }

  return children;
}

export default RequireAdmin;
