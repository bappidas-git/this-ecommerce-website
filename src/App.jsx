import { Helmet } from 'react-helmet-async';
import AppRoutes from './routes/AppRoutes.jsx';
import ScrollLockGuard from './components/system/ScrollLockGuard.jsx';

const brand = import.meta.env.VITE_BRAND_NAME || 'THIS Interiors';

function App() {
  return (
    <>
      <Helmet>
        <title>{brand}</title>
      </Helmet>
      <ScrollLockGuard />
      <AppRoutes />
    </>
  );
}

export default App;
