import { createContext, useCallback, useContext, useMemo, useState } from 'react';

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
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
