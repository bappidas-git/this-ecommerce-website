import Seo from '../../components/common/Seo.jsx';
import AdminPageHeader from '../components/AdminPageHeader.jsx';
import useAdminBreadcrumbs from '../hooks/useAdminBreadcrumbs.js';
import { PATHS } from '../../routes/paths.js';

function AdminOrders() {
  useAdminBreadcrumbs([
    { label: 'Admin', to: PATHS.admin.root },
    { label: 'Sales' },
    { label: 'Orders' },
  ]);

  return (
    <>
      <Seo title="Orders — THIS Admin" />
      <AdminPageHeader
        eyebrow="Sales"
        title="Orders"
        description="Track, fulfill, and manage customer orders."
      />
    </>
  );
}

export default AdminOrders;
