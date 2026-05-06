import { Outlet } from 'react-router-dom';
import { UIProvider } from '../../../context/UIContext.jsx';
import { CartProvider } from '../../../context/CartContext.jsx';
import OfflineBanner from '../../common/OfflineBanner.jsx';
import Header from '../Header/Header.jsx';
import MobileNavDrawer from '../MobileNavDrawer/MobileNavDrawer.jsx';

export default function MainLayout() {
  return (
    <CartProvider>
      <UIProvider>
        <OfflineBanner />
        <Header />
        <MobileNavDrawer />
        <Outlet />
      </UIProvider>
    </CartProvider>
  );
}
