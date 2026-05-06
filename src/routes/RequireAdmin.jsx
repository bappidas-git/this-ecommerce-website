import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Loader from '../components/common/Loader/Loader.jsx';
import EmptyState from '../components/common/EmptyState/EmptyState.jsx';
import AppButton from '../components/common/AppButton/AppButton.jsx';
import { useAdminAuth } from '../admin/context/AdminAuthContext.jsx';
import useCanAdminAccess from '../admin/hooks/useCanAdminAccess.js';
import { queueToast } from '../utils/toastQueue.js';
import { PATHS } from './paths.js';

function RequireAdmin({ children, area }) {
  const { user, isHydrating, isAuthenticated } = useAdminAuth();
  const { canRead } = useCanAdminAccess(area);
  const location = useLocation();
  const toastedKeyRef = useRef(null);

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

  if (!isAuthenticated || !user) {
    const redirectKey = `${location.pathname}${location.search}`;
    if (toastedKeyRef.current !== redirectKey) {
      toastedKeyRef.current = redirectKey;
      queueToast({ variant: 'info', message: 'Please sign in to continue.' });
    }
    return <Navigate to={PATHS.admin.login} replace state={{ from: location }} />;
  }

  if (area && !canRead) {
    return (
      <Box sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
        <EmptyState
          title="You don't have access to this area."
          description="Your account is signed in, but this section is restricted. Ask an administrator to grant access."
          cta={
            <AppButton variant="secondary" to={PATHS.admin.root}>
              Back to dashboard
            </AppButton>
          }
        />
      </Box>
    );
  }

  return children;
}

export default RequireAdmin;
