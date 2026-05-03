import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Loader from '../components/common/Loader/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { queueToast } from '../utils/toastQueue.js';
import { PATHS } from './paths.js';

function buildSafeRedirect(location) {
  const target = `${location.pathname}${location.search}`;
  // Drop the param if it would resolve back to the login page itself.
  if (
    !target ||
    target === PATHS.auth.login ||
    target.startsWith(`${PATHS.auth.login}?`) ||
    target.startsWith(`${PATHS.auth.login}/`)
  ) {
    return null;
  }
  return encodeURIComponent(target);
}

function RequireAuth({ children }) {
  const { user, isAuthenticated, isHydrating } = useAuth();
  const location = useLocation();
  const toastedKeyRef = useRef(null);

  // Reset the toast lock once the user becomes authenticated again.
  useEffect(() => {
    if (isAuthenticated) {
      toastedKeyRef.current = null;
    }
  }, [isAuthenticated]);

  if (isHydrating) {
    return (
      <Box
        sx={{
          minHeight: '40vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 6, md: 10 },
        }}
      >
        <Loader size="md" label="Just a moment…" wordmark />
      </Box>
    );
  }

  if (!user || !isAuthenticated) {
    const redirectKey = `${location.pathname}${location.search}`;
    if (toastedKeyRef.current !== redirectKey) {
      toastedKeyRef.current = redirectKey;
      queueToast({ variant: 'info', message: 'Please sign in to continue.' });
    }
    const redirect = buildSafeRedirect(location);
    const target = redirect
      ? `${PATHS.auth.login}?redirect=${redirect}`
      : PATHS.auth.login;
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
