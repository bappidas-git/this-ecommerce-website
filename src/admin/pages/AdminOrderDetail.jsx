import { useParams } from 'react-router-dom';
import PageStub from '../../components/common/PageStub.jsx';

function AdminOrderDetail() {
  const { id } = useParams();
  return <PageStub name={`Order${id ? ` #${id}` : ''}`} eyebrow="Detail" tone="surface" />;
}

export default AdminOrderDetail;
