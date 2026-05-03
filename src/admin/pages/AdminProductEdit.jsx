import { useParams } from 'react-router-dom';
import PageStub from '../../components/common/PageStub.jsx';

function AdminProductEdit() {
  const { id } = useParams();
  return <PageStub name={`Edit product${id ? ` #${id}` : ''}`} eyebrow="Edit" tone="surface" />;
}

export default AdminProductEdit;
