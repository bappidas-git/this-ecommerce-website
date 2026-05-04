import { Helmet } from 'react-helmet-async';
import useAccountSection from '../hooks/useAccountSection.js';

function AccountProfile() {
  useAccountSection({ descriptor: 'Manage your personal details.' });

  return (
    <>
      <Helmet>
        <title>Profile · My Account · THIS Interiors</title>
      </Helmet>
    </>
  );
}

export default AccountProfile;
