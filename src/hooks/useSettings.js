import { useMemo } from 'react';

const MOCK_SETTINGS = Object.freeze({
  general: {
    storeName: 'THIS Interiors',
  },
  branding: {
    logoText: 'THIS Interiors',
    statement:
      'Editorial homewares assembled in Dubai. Quiet pieces, considered materials, made to live with for years.',
  },
  announcement: {
    isActive: true,
    text: 'Complimentary gift wrap on orders over AED 800.',
    link: '/shop',
  },
  contact: {
    addressLines: ['Studio 14, Alserkal Avenue', 'Al Quoz 1, Dubai, UAE'],
    email: 'studio@thisinteriors.com',
    phone: '+971 4 000 0000',
  },
  social: {
    instagram: 'https://instagram.com/thisinteriors',
    pinterest: 'https://pinterest.com/thisinteriors',
    tiktok: 'https://tiktok.com/@thisinteriors',
    facebook: 'https://facebook.com/thisinteriors',
  },
});

export function useSettings() {
  return useMemo(
    () => ({
      data: MOCK_SETTINGS,
      isLoading: false,
      error: null,
    }),
    [],
  );
}

export default useSettings;
