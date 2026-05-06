import { Outlet } from 'react-router-dom';
import Header from './Header/index.js';
import Footer from './Footer/Footer.jsx';
import MiniCartDrawer from './MiniCartDrawer/MiniCartDrawer.jsx';
import SearchOverlay from '../../features/search/components/SearchOverlay/SearchOverlay.jsx';
import Seo from '../common/Seo.jsx';
import { CartProvider } from '../../context/CartContext.jsx';
import { WishlistProvider } from '../../context/WishlistContext.jsx';
import { UIProvider } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useSessionExpiredHandler from '../../hooks/useSessionExpiredHandler.js';
import useScrollToTop from '../../hooks/useScrollToTop.js';
import useSettings from '../../hooks/useSettings.js';
import { buildOrganizationJsonLd } from '../../utils/seo.js';
import styles from './MainLayout.module.css';

function MainLayout() {
  const { logout } = useAuth();
  useSessionExpiredHandler({ scope: 'storefront', logout });
  useScrollToTop();

  const { data: settings } = useSettings();
  const organizationJsonLd = buildOrganizationJsonLd(settings);

  return (
    <CartProvider>
      <WishlistProvider>
        <UIProvider>
          <Seo jsonLd={organizationJsonLd} />
          <div className={styles.shell}>
            <Header />
            <main id="main" className={styles.main}>
              <Outlet />
            </main>
            <Footer />
          </div>
          <MiniCartDrawer />
          <SearchOverlay />
        </UIProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default MainLayout;
