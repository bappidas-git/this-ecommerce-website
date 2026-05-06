import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import adminAuthService from '../../api/services/admin/adminAuthService.js';
import { queueToast } from '../../utils/toastQueue.js';
import { getApiErrorMessage } from '../../hooks/useApiError.js';

const TOKEN_KEY = 'ti_admin_token';
const AUTH_EXPIRED_EVENT = 'ti:admin-auth-expired';
const AUTH_LOGIN_EVENT = 'ti:admin-auth-login';
const AUTH_LOGOUT_EVENT = 'ti:admin-auth-logout';

const VALID_ROLES = new Set(['admin', 'manager', 'viewer']);

const hasWindow = typeof window !== 'undefined';

function readToken() {
  if (!hasWindow) return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token) {
  if (!hasWindow) return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore quota / privacy mode */
  }
}

function emit(name, detail) {
  if (!hasWindow) return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function normalizeUser(raw) {
  if (!raw) return null;
  const role = VALID_ROLES.has(raw.role) ? raw.role : 'viewer';
  return { ...raw, role };
}

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => readToken());
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(() => Boolean(readToken()));
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSet = useCallback((setter) => {
    if (mountedRef.current) setter();
  }, []);

  // Hydration: validate persisted admin token via /admin/auth/me
  useEffect(() => {
    let cancelled = false;
    const persisted = readToken();
    if (!persisted) {
      setIsHydrating(false);
      return undefined;
    }
    setIsHydrating(true);
    adminAuthService
      .me()
      .then((data) => {
        if (cancelled) return;
        const nextUser = normalizeUser(data?.user ?? data ?? null);
        safeSet(() => {
          setUser(nextUser);
          setToken(persisted);
          setError(null);
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 401) {
          writeToken(null);
          safeSet(() => {
            setUser(null);
            setToken(null);
          });
        } else {
          safeSet(() => {
            setError(getApiErrorMessage(err) || 'Could not restore admin session');
          });
        }
      })
      .finally(() => {
        if (cancelled) return;
        safeSet(() => setIsHydrating(false));
      });
    return () => {
      cancelled = true;
    };
  }, [safeSet]);

  // Listen for axios 401 (admin only)
  useEffect(() => {
    if (!hasWindow) return undefined;
    function onExpired() {
      writeToken(null);
      safeSet(() => {
        setUser(null);
        setToken(null);
      });
      queueToast({
        variant: 'info',
        message: 'Your admin session has ended — please sign in again.',
      });
      emit(AUTH_LOGOUT_EVENT, { reason: 'expired' });
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [safeSet]);

  const applyAuthSuccess = useCallback(
    (data) => {
      const nextToken = data?.token ?? null;
      const nextUser = normalizeUser(data?.user ?? null);
      if (nextToken) {
        writeToken(nextToken);
        safeSet(() => setToken(nextToken));
      }
      if (nextUser) {
        safeSet(() => setUser(nextUser));
        emit(AUTH_LOGIN_EVENT, nextUser);
      }
      return { user: nextUser, token: nextToken };
    },
    [safeSet],
  );

  const login = useCallback(
    async ({ email, password } = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminAuthService.login({ email, password });
        return applyAuthSuccess(data);
      } catch (err) {
        const message = getApiErrorMessage(err) || 'Sign in failed';
        safeSet(() => setError(message));
        throw err;
      } finally {
        safeSet(() => setIsLoading(false));
      }
    },
    [applyAuthSuccess, safeSet],
  );

  const me = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminAuthService.me();
      const nextUser = normalizeUser(data?.user ?? data ?? null);
      safeSet(() => setUser(nextUser));
      return nextUser;
    } catch (err) {
      const message = getApiErrorMessage(err) || 'Could not load admin profile';
      safeSet(() => setError(message));
      throw err;
    } finally {
      safeSet(() => setIsLoading(false));
    }
  }, [safeSet]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await adminAuthService.logout();
    } catch {
      /* server logout failure is non-fatal — still clear locally */
    } finally {
      writeToken(null);
      safeSet(() => {
        setUser(null);
        setToken(null);
        setError(null);
        setIsLoading(false);
      });
      emit(AUTH_LOGOUT_EVENT, { reason: 'manual' });
    }
  }, [safeSet]);

  const updateUser = useCallback((patch) => {
    if (!patch || typeof patch !== 'object') return;
    setUser((prev) => (prev ? normalizeUser({ ...prev, ...patch }) : prev));
  }, []);

  const isAuthenticated = Boolean(user && token);

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role ?? null,
      isLoading,
      isHydrating,
      error,
      isAuthenticated,
      login,
      logout,
      me,
      updateUser,
    }),
    [
      user,
      token,
      isLoading,
      isHydrating,
      error,
      isAuthenticated,
      login,
      logout,
      me,
      updateUser,
    ],
  );

  // Dev-only debug surface
  useEffect(() => {
    if (!hasWindow) return undefined;
    if (!import.meta.env.DEV) return undefined;
    window.__adminAuth = value;
    return () => {
      if (window.__adminAuth === value) {
        try {
          delete window.__adminAuth;
        } catch {
          window.__adminAuth = undefined;
        }
      }
    };
  }, [value]);

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within <AdminAuthProvider>');
  }
  return ctx;
}

export { AdminAuthContext };
export default AdminAuthContext;
