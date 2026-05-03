import { createContext, useContext, useMemo } from 'react';

const AdminAuthContext = createContext({
  admin: null,
  isLoading: false,
  isAuthenticated: false,
  permissions: [],
});

export function AdminAuthProvider({ children }) {
  const value = useMemo(
    () => ({
      admin: null,
      isLoading: false,
      isAuthenticated: false,
      permissions: [],
      hasPermission: () => false,
    }),
    [],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export default AdminAuthContext;
