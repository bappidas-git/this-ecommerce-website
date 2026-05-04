import { Helmet } from 'react-helmet-async';
import useAccountSection from '../hooks/useAccountSection.js';

function AccountAddresses() {
  useAccountSection({ descriptor: 'Manage delivery addresses.' });

  return (
    <>
      <Helmet>
        <title>Addresses · My Account · THIS Interiors</title>
      </Helmet>
    </>
  );
}

export default AccountAddresses;
