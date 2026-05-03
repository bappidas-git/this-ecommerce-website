import { useParams } from 'react-router-dom';
import PageStub from '../../../components/common/PageStub.jsx';

function OrderConfirmation() {
  const { id } = useParams();
  return (
    <PageStub
      name="Order confirmed"
      eyebrow={id ? `Order #${id}` : 'Thank you'}
      kicker="A receipt has been sent to your email."
      tone="surface"
    />
  );
}

export default OrderConfirmation;
