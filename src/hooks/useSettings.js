import { useMemo } from 'react';

const MOCK_SETTINGS = Object.freeze({
  general: {
    storeName: 'THIS Interiors',
  },
  branding: {
    logoText: 'THIS Interiors',
  },
  announcement: {
    isActive: true,
    text: 'Complimentary gift wrap on orders over AED 800.',
    link: '/shop',
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
