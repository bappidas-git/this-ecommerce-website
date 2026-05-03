import { Outlet } from 'react-router-dom';
import Header from './Header/index.js';
import Footer from './Footer/Footer.jsx';
import styles from './MainLayout.module.css';

function MainLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
