import Seo from '../../components/common/Seo.jsx';
import AdminPageHeader from '../components/AdminPageHeader.jsx';
import useAdminBreadcrumbs from '../hooks/useAdminBreadcrumbs.js';
import { PATHS } from '../../routes/paths.js';

function AdminDashboard() {
  useAdminBreadcrumbs([{ label: 'Admin', to: PATHS.admin.root }, { label: 'Dashboard' }]);

  return (
    <>
      <Seo title="Dashboard — THIS Admin" />
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Today's metrics and quick actions."
      />
    </>
  );
}

export default AdminDashboard;
