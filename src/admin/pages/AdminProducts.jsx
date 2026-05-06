import Seo from '../../components/common/Seo.jsx';
import AdminPageHeader from '../components/AdminPageHeader.jsx';
import useAdminBreadcrumbs from '../hooks/useAdminBreadcrumbs.js';
import { PATHS } from '../../routes/paths.js';

function AdminProducts() {
  useAdminBreadcrumbs([
    { label: 'Admin', to: PATHS.admin.root },
    { label: 'Catalog' },
    { label: 'Products' },
  ]);

  return (
    <>
      <Seo title="Products — THIS Admin" />
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage your product catalog, variants, and inventory."
      />
    </>
  );
}

export default AdminProducts;
