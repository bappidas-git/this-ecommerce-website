import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import authService from '../api/services/authService.js';
import { queueToast } from '../utils/toastQueue.js';
import { getApiErrorMessage } from '../hooks/useApiError.js';

const TOKEN_KEY = 'ti_token';
const AUTH_EXPIRED_EVENT = 'ti:auth-expired';
const AUTH_LOGIN_EVENT = 'ti:auth-login';
const AUTH_LOGOUT_EVENT = 'ti:auth-logout';

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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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

  // Hydration: validate persisted token via /auth/me
  useEffect(() => {
    let cancelled = false;
    const persisted = readToken();
    if (!persisted) {
      setIsHydrating(false);
      return undefined;
    }
    setIsHydrating(true);
    authService
      .me()
      .then((data) => {
        if (cancelled) return;
        const nextUser = data?.user ?? data ?? null;
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
            setError(getApiErrorMessage(err) || 'Could not restore session');
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

  // Listen for axios 401 (storefront only)
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
        message: 'Your session has ended — please sign in again.',
      });
      emit(AUTH_LOGOUT_EVENT, { reason: 'expired' });
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [safeSet]);

  const applyAuthSuccess = useCallback(
    (data) => {
      const nextToken = data?.token ?? null;
      const nextUser = data?.user ?? null;
      if (nextToken) {
        writeToken(nextToken);
        safeSet(() => setToken(nextToken));
      }
      if (nextUser) {
        safeSet(() => setUser(nextUser));
      }
      if (nextUser) {
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
        const data = await authService.login({ email, password });
        const result = applyAuthSuccess(data);
        return result;
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

  const register = useCallback(
    async ({ name, email, password, subscribe } = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await authService.register({ name, email, password, subscribe });
        if (data?.token) {
          return applyAuthSuccess(data);
        }
        // Backend didn't return a token — auto-login.
        const loginData = await authService.login({ email, password });
        return applyAuthSuccess(loginData);
      } catch (err) {
        const message = getApiErrorMessage(err) || 'Registration failed';
        safeSet(() => setError(message));
        throw err;
      } finally {
        safeSet(() => setIsLoading(false));
      }
    },
    [applyAuthSuccess, safeSet],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
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

  const forgot = useCallback(async ({ email } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.forgot({ email });
      return data;
    } catch (err) {
      const message = getApiErrorMessage(err) || 'Could not send reset link';
      safeSet(() => setError(message));
      throw err;
    } finally {
      safeSet(() => setIsLoading(false));
    }
  }, [safeSet]);

  const reset = useCallback(
    async ({ token: resetToken, password } = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await authService.reset({ token: resetToken, password });
        if (data?.token) {
          return applyAuthSuccess(data);
        }
        return data;
      } catch (err) {
        const message = getApiErrorMessage(err) || 'Could not reset password';
        safeSet(() => setError(message));
        throw err;
      } finally {
        safeSet(() => setIsLoading(false));
      }
    },
    [applyAuthSuccess, safeSet],
  );

  const updateUser = useCallback((patch) => {
    if (!patch || typeof patch !== 'object') return;
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const isAuthenticated = Boolean(user && token);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isHydrating,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      forgot,
      reset,
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
      register,
      logout,
      forgot,
      reset,
      updateUser,
    ],
  );

  // Dev-only debug surface
  useEffect(() => {
    if (!hasWindow) return undefined;
    if (!import.meta.env.DEV) return undefined;
    window.__auth = value;
    return () => {
      if (window.__auth === value) {
        try {
          delete window.__auth;
        } catch {
          window.__auth = undefined;
        }
      }
    };
  }, [value]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}

export { AuthContext };
export default AuthContext;
