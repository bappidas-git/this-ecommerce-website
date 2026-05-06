import Seo from './components/common/Seo.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import ScrollLockGuard from './components/system/ScrollLockGuard.jsx';

const brand = import.meta.env.VITE_BRAND_NAME || 'THIS Interiors';

function App() {
  return (
    <>
      <Seo title={brand} />
      <ScrollLockGuard />
      <AppRoutes />
    </>
  );
}

export default App;
