import { Helmet } from 'react-helmet-async';
import AppRoutes from './routes/AppRoutes.jsx';

const brand = import.meta.env.VITE_BRAND_NAME || 'THIS Interiors';

function App() {
  return (
    <>
      <Helmet>
        <title>{brand}</title>
      </Helmet>
      <AppRoutes />
    </>
  );
}

export default App;
