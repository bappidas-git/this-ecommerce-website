import Seo from './components/common/Seo.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import ScrollLockGuard from './components/system/ScrollLockGuard.jsx';
import ResponsiveBadge from './components/common/dev/ResponsiveBadge.jsx';

const brand = import.meta.env.VITE_BRAND_NAME || 'THIS Interiors';

function App() {
  return (
    <>
      <Seo title={brand} />
      <ScrollLockGuard />
      <AppRoutes />
      <ResponsiveBadge />
    </>
  );
}

export default App;
