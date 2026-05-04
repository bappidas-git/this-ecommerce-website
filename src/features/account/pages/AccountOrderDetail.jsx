import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import useAccountSection from '../hooks/useAccountSection.js';

function AccountOrderDetail() {
  const { id } = useParams();
  const title = id ? `Order #${id}` : 'Order details';
  useAccountSection({ title, descriptor: 'Review the items and status of this order.' });

  return (
    <>
      <Helmet>
        <title>{title} · My Account · THIS Interiors</title>
      </Helmet>
    </>
  );
}

export default AccountOrderDetail;
