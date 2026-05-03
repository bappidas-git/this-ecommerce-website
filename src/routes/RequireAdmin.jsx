import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Loader from '../components/common/Loader/Loader.jsx';
import EmptyState from '../components/common/EmptyState/EmptyState.jsx';
import AppButton from '../components/common/AppButton/AppButton.jsx';
import { useAdminAuth } from '../admin/context/AdminAuthContext.jsx';
import { queueToast } from '../utils/toastQueue.js';
import { PATHS } from './paths.js';

function userHasArea(ctx, area) {
  if (!area) return true;
  if (typeof ctx?.hasArea === 'function') return Boolean(ctx.hasArea(area));
  if (typeof ctx?.hasPermission === 'function') return Boolean(ctx.hasPermission(area));
  if (Array.isArray(ctx?.permissions) && ctx.permissions.length > 0) {
    return ctx.permissions.includes(area);
  }
  return true;
}

function RequireAdmin({ children, area }) {
  const ctx = useAdminAuth();
  const location = useLocation();
  const toastedKeyRef = useRef(null);

  // TODO Prompt 39 — replace placeholder shape with real { user, isHydrating, ... }.
  const user = ctx?.user ?? ctx?.admin ?? null;
  const isHydrating = Boolean(ctx?.isHydrating ?? ctx?.isLoading);
  const isAuthenticated = Boolean(ctx?.isAuthenticated ?? user);

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
    return (
      <Navigate to={PATHS.admin.login} replace state={{ from: location }} />
    );
  }

  if (!userHasArea(ctx, area)) {
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
