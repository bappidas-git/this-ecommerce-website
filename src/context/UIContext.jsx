import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleSearch = useCallback(() => setSearchOpen((v) => !v), []);

  // Cmd/Ctrl+K opens the global search overlay.
  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key?.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close transient overlays on route change.
  const location = useLocation();
  useEffect(() => {
    setSearchOpen(false);
    setCartOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname, location.search]);

  const value = useMemo(
    () => ({
      isMobileNavOpen,
      openMobileNav,
      closeMobileNav,
      isCartOpen,
      openCart,
      closeCart,
      isSearchOpen,
      openSearch,
      closeSearch,
      toggleSearch,
    }),
    [
      isMobileNavOpen,
      openMobileNav,
      closeMobileNav,
      isCartOpen,
      openCart,
      closeCart,
      isSearchOpen,
      openSearch,
      closeSearch,
      toggleSearch,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
