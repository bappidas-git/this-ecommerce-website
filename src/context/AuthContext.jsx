import { createContext, useContext, useMemo } from 'react';

const AuthContext = createContext({
  user: null,
  isLoading: false,
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const value = useMemo(
    () => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
