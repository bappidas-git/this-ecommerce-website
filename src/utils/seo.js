const DEFAULT_SITE_URL = 'https://shop.thisinteriors.com';

export function getSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (fromEnv && typeof fromEnv === 'string') return fromEnv.replace(/\/$/, '');
  return DEFAULT_SITE_URL;
}

export function buildOrganizationJsonLd(settings) {
  const siteUrl = getSiteUrl();
  const storeName = settings?.general?.storeName || 'THIS Interiors';
  const email = settings?.general?.email || 'studio@thisinteriors.com';
  const phone = settings?.general?.phone || '+971 4 000 0000';
  const address = settings?.general?.address || 'Dubai, United Arab Emirates';

  const sameAs = [
    settings?.social?.instagram,
    settings?.social?.pinterest,
    settings?.social?.facebook,
    settings?.social?.tiktok,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: storeName,
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    email,
    telephone: phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}
