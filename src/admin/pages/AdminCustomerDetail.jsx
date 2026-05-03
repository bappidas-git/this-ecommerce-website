import { useParams } from 'react-router-dom';
import PageStub from '../../components/common/PageStub.jsx';

function AdminCustomerDetail() {
  const { id } = useParams();
  return <PageStub name={`Customer${id ? ` #${id}` : ''}`} eyebrow="Detail" tone="surface" />;
}

export default AdminCustomerDetail;
