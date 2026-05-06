import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const DEFAULT_SITE_URL = 'https://shop.thisinteriors.com';

function resolveSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (fromEnv && typeof fromEnv === 'string') return fromEnv.replace(/\/$/, '');
  return DEFAULT_SITE_URL;
}

function toAbsolute(url, base) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function Seo({
  title,
  description,
  canonical,
  image,
  noindex = false,
  jsonLd,
  type = 'website',
  children,
}) {
  const location = useLocation();
  const siteUrl = resolveSiteUrl();

  const canonicalPath = canonical || location.pathname || '/';
  const canonicalUrl = toAbsolute(canonicalPath, siteUrl);
  const imageUrl = image ? toAbsolute(image, siteUrl) : undefined;

  const jsonLdList = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean)
    : [];

  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      <meta property="og:type" content={type} />
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}

      {jsonLdList.map((node, i) => (
        <script key={`ti-jsonld-${i}`} type="application/ld+json">
          {JSON.stringify(node)}
        </script>
      ))}
      {children}
    </Helmet>
  );
}

export default Seo;
