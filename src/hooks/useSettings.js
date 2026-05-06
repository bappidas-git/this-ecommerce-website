import { useMemo } from 'react';

const MOCK_SETTINGS = Object.freeze({
  general: {
    storeName: 'THIS Interiors',
    address: 'Studio 14, Alserkal Avenue, Al Quoz 1, Dubai, UAE',
    email: 'studio@thisinteriors.com',
    phone: '+971 4 000 0000',
    openingHours: [
      { label: 'Monday – Friday', value: '10:00 – 19:00' },
      { label: 'Saturday', value: '11:00 – 18:00' },
      { label: 'Sunday', value: 'By appointment' },
    ],
    mapEmbedUrl:
      'https://www.google.com/maps?q=Alserkal+Avenue,+Al+Quoz+1,+Dubai&output=embed',
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
  legal: {
    privacyUpdatedAt: '2026-04-01',
    termsUpdatedAt: '2026-04-01',
    shippingUpdatedAt: '2026-04-01',
    governingLaw: 'United Arab Emirates',
    companyName: 'THIS Interiors Trading LLC',
    contactEmail: 'studio@thisinteriors.com',
  },
  payment: {
    cardEnabled: true,
    codEnabled: true,
    bankTransferEnabled: true,
    codFee: 15,
    currency: 'AED',
    bankDetails: {
      bankName: 'Emirates NBD',
      accountName: 'THIS Interiors Trading LLC',
      accountNumber: '0123 4567 8901 2345',
      iban: 'AE12 0260 0010 1234 5678 901',
      swift: 'EBILAEAD',
      reference: 'Use your order number as the transfer reference.',
    },
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
