// Brand-coloured SVG placeholders used when remote images fail to load.
// Inline data URIs avoid any network dependency for fallbacks.

const PALETTE = [
  { bg: '#E5DED2', fg: '#8C7A4D' },
  { bg: '#EFE6D6', fg: '#7A6A4A' },
  { bg: '#DDD3C2', fg: '#5C4F36' },
  { bg: '#F0E7D6', fg: '#A38A52' },
  { bg: '#E2D8C5', fg: '#6E5E3E' },
  { bg: '#1F4034', fg: '#C9A973' },
];

function hashString(input) {
  const str = String(input ?? '');
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickPalette(seed) {
  const idx = hashString(seed) % PALETTE.length;
  return PALETTE[idx];
}

function getInitials(name = '') {
  const cleaned = String(name).trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'TI';
  const parts = cleaned.split(' ').filter(Boolean);
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || parts[0]?.[1] || '';
  return (first + second).toUpperCase().slice(0, 2);
}

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build an inline SVG data URI placeholder.
 * Renders a brand-toned background with subtle texture and the product initials.
 */
export function buildPlaceholderDataUri({ seed, width = 800, height = 1000 } = {}) {
  const { bg, fg } = pickPalette(seed);
  const initials = escapeXml(getInitials(seed));
  const fontSize = Math.round(Math.min(width, height) * 0.22);
  const ringR = Math.round(Math.min(width, height) * 0.42);
  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${fg}" stroke-opacity="0.18" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${Math.round(ringR * 0.62)}" fill="none" stroke="${fg}" stroke-opacity="0.12" stroke-width="2"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Playfair Display', serif" font-weight="500"
        font-size="${fontSize}" fill="${fg}" fill-opacity="0.78"
        letter-spacing="2">${initials}</text>
</svg>`;
  // encodeURIComponent keeps the SVG inline-safe across all browsers.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Memoised helper keyed by seed + dims. */
const cache = new Map();
export function getProductPlaceholder(seed = 'THIS Interiors', width = 800, height = 1000) {
  const key = `${seed}|${width}|${height}`;
  if (cache.has(key)) return cache.get(key);
  const uri = buildPlaceholderDataUri({ seed, width, height });
  cache.set(key, uri);
  return uri;
}

/**
 * Image error handler. Swaps the broken `<img>` source with the
 * brand-coloured placeholder so cards never render as empty boxes.
 */
export function handleImageError(event, seed) {
  const el = event?.currentTarget || event?.target;
  if (!el || el.dataset.fallback === 'true') return;
  el.dataset.fallback = 'true';
  el.src = getProductPlaceholder(seed || el.alt || 'THIS Interiors');
}

export default getProductPlaceholder;
