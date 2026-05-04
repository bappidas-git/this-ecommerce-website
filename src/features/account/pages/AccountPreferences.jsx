import { Helmet } from 'react-helmet-async';
import useAccountSection from '../hooks/useAccountSection.js';

function AccountPreferences() {
  useAccountSection({ descriptor: 'Communication and personalization settings.' });

  return (
    <>
      <Helmet>
        <title>Preferences · My Account · THIS Interiors</title>
      </Helmet>
    </>
  );
}

export default AccountPreferences;
