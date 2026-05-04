import { Helmet } from 'react-helmet-async';
import useAccountSection from '../hooks/useAccountSection.js';

function AccountPassword() {
  useAccountSection({ descriptor: 'Change your password.' });

  return (
    <>
      <Helmet>
        <title>Password · My Account · THIS Interiors</title>
      </Helmet>
    </>
  );
}

export default AccountPassword;
