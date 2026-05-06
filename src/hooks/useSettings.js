import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import settingsService from '../api/services/settingsService.js';

const SETTINGS_UPDATED_EVENT = 'ti:settings-updated';

const FALLBACK_SETTINGS = Object.freeze({
  general: {
    storeName: 'THIS Interiors',
    address: 'Studio 14, Alserkal Avenue, Al Quoz 1, Dubai, UAE',
    email: 'studio@thisinteriors.com',
    supportEmail: 'studio@thisinteriors.com',
    phone: '+971 4 000 0000',
    supportPhone: '+971 4 000 0000',
    currency: 'AED',
    language: 'en',
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
    faviconUrl: 'https://placehold.co/64x64/F7F3ED/B8924F?text=T',
    accentColor: '#B8924F',
    ogImageUrl: 'https://placehold.co/1200x630/F7F3ED/1B1A17?text=THIS+Interiors',
    statement:
      'Editorial homewares assembled in Dubai. Quiet pieces, considered materials, made to live with for years.',
  },
  homepage: {
    heroTitle: 'Quiet objects for considered rooms.',
    heroSubtitle:
      'A small Dubai studio working in marble, brass, linen and stone — pieces designed to settle in and stay.',
    heroCta: 'Shop the collection',
    heroImage: 'https://placehold.co/1600x900/E5DED2/1B1A17?text=THIS+Interiors',
    featuredCategoryIds: [],
    featuredProductIds: [],
  },
  announcement: {
    isActive: true,
    text: 'Complimentary gift wrap on orders over AED 800.',
    link: '/shop',
    dismissible: true,
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
  emails: {
    welcome: 'Welcome to THIS Interiors. We are glad you are here.',
    orderConfirmation:
      'Thank you for your order. We are preparing it now and will share tracking once it ships.',
    shipped:
      'Your order is on its way — please allow 2–4 working days inside the UAE.',
    refund: 'Your refund has been processed and will appear within 5–7 working days.',
  },
});

function mergeWithFallback(remote) {
  if (!remote || typeof remote !== 'object') return FALLBACK_SETTINGS;
  const merged = { ...FALLBACK_SETTINGS };
  for (const [key, value] of Object.entries(remote)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      merged[key] = { ...(FALLBACK_SETTINGS[key] || {}), ...value };
    } else if (value !== undefined && value !== null) {
      merged[key] = value;
    }
  }
  return merged;
}

const hasWindow = typeof window !== 'undefined';

export function emitSettingsUpdated() {
  if (!hasWindow) return;
  window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT));
}

export function useSettings() {
  const [data, setData] = useState(FALLBACK_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const remote = await settingsService.getPublic();
      if (!mountedRef.current) return;
      setData(mergeWithFallback(remote));
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!hasWindow) return undefined;
    const onUpdated = () => fetchSettings();
    window.addEventListener(SETTINGS_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, onUpdated);
  }, [fetchSettings]);

  return useMemo(
    () => ({ data, isLoading, error, refetch: fetchSettings }),
    [data, isLoading, error, fetchSettings],
  );
}

export const SETTINGS_EVENTS = Object.freeze({
  updated: SETTINGS_UPDATED_EVENT,
});

export default useSettings;
