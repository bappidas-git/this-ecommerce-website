import { Outlet } from 'react-router-dom';
import Header from './Header/index.js';
import Footer from './Footer/Footer.jsx';
import MiniCartDrawer from './MiniCartDrawer/MiniCartDrawer.jsx';
import { CartProvider } from '../../context/CartContext.jsx';
import { UIProvider } from '../../context/UIContext.jsx';
import styles from './MainLayout.module.css';

function MainLayout() {
  return (
    <CartProvider>
      <UIProvider>
        <div className={styles.shell}>
          <Header />
          <main id="main" className={styles.main}>
            <Outlet />
          </main>
          <Footer />
        </div>
        <MiniCartDrawer />
      </UIProvider>
    </CartProvider>
  );
}

export default MainLayout;
