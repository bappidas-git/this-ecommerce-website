import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAdminAuth } from '../admin/context/AdminAuthContext.jsx';
import { queueToast } from '../utils/toastQueue.js';
import { PATHS } from './paths.js';

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
    queueToast({ variant: 'info', message: 'Please sign in to continue.' });
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
