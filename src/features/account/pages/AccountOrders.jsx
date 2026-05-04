import { Helmet } from 'react-helmet-async';
import useAccountSection from '../hooks/useAccountSection.js';

function AccountOrders() {
  useAccountSection({ descriptor: 'Your past and current orders.' });

  return (
    <>
      <Helmet>
        <title>Orders · My Account · THIS Interiors</title>
      </Helmet>
    </>
  );
}

export default AccountOrders;
