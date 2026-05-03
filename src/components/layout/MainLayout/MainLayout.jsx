import { Outlet } from 'react-router-dom';
import { UIProvider } from '../../../context/UIContext.jsx';
import Header from '../Header/Header.jsx';
import MobileNavDrawer from '../MobileNavDrawer/MobileNavDrawer.jsx';

export default function MainLayout() {
  return (
    <UIProvider>
      <Header />
      <MobileNavDrawer />
      <Outlet />
    </UIProvider>
  );
}
