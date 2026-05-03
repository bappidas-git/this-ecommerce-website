import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext.jsx';
import { queueToast } from '../utils/toastQueue.js';
import { PATHS } from './paths.js';

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
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
    return <Navigate to={`${PATHS.auth.login}?redirect=${redirect}`} replace />;
  }

  return children;
}

export default RequireAuth;
