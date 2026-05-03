import { createContext, useContext, useMemo } from 'react';

// TODO Prompt 39 — wire real admin auth (token hydration, role/permission resolution).
const AdminAuthContext = createContext({
  user: null,
  admin: null,
  isHydrating: false,
  isLoading: false,
  isAuthenticated: false,
  permissions: [],
  hasPermission: () => false,
  hasArea: () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }) {
  const value = useMemo(
    () => ({
      user: null,
      admin: null,
      isHydrating: false,
      isLoading: false,
      isAuthenticated: false,
      permissions: [],
      hasPermission: () => false,
      hasArea: () => false,
      logout: () => {},
    }),
    [],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export { AdminAuthContext };
export default AdminAuthContext;
