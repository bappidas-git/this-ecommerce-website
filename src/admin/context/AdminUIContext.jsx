import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const SIDEBAR_KEY = 'ti_admin_sidebar_collapsed';
const hasWindow = typeof window !== 'undefined';

function readCollapsed() {
  if (!hasWindow) return false;
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(value) {
  if (!hasWindow) return;
  try {
    window.localStorage.setItem(SIDEBAR_KEY, value ? '1' : '0');
  } catch {
    /* ignore */
  }
}

const AdminUIContext = createContext(null);

export function AdminUIProvider({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => readCollapsed());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbsState] = useState([]);

  useEffect(() => {
    writeCollapsed(isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const openMobileSidebar = useCallback(() => setIsMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(
    () => setIsMobileSidebarOpen((prev) => !prev),
    [],
  );

  const setBreadcrumbs = useCallback((next) => {
    setBreadcrumbsState(Array.isArray(next) ? next : []);
  }, []);

  const value = useMemo(
    () => ({
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebar,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
      breadcrumbs,
      setBreadcrumbs,
    }),
    [
      isSidebarCollapsed,
      toggleSidebar,
      isMobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
      breadcrumbs,
      setBreadcrumbs,
    ],
  );

  return <AdminUIContext.Provider value={value}>{children}</AdminUIContext.Provider>;
}

export function useAdminUI() {
  const ctx = useContext(AdminUIContext);
  if (!ctx) {
    throw new Error('useAdminUI must be used within <AdminUIProvider>');
  }
  return ctx;
}

export { AdminUIContext };
export default AdminUIContext;
