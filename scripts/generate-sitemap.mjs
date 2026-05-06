#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://shop.thisinteriors.com').replace(/\/$/, '');
const DB_PATH = resolve(ROOT, 'db.json');
const OUT_PATH = resolve(ROOT, 'public', 'sitemap.xml');

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/shop', changefreq: 'daily', priority: 0.9 },
  { path: '/search', changefreq: 'weekly', priority: 0.4 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
  { path: '/faq', changefreq: 'monthly', priority: 0.5 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms', changefreq: 'yearly', priority: 0.3 },
  { path: '/shipping-returns', changefreq: 'yearly', priority: 0.4 },
];

const EXCLUDE_PREFIXES = [
  '/admin',
  '/checkout',
  '/account',
  '/cart',
  '/wishlist',
  '/order',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/_kitchen-sink',
];

function isExcluded(path) {
  return EXCLUDE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function loadDb() {
  if (!existsSync(DB_PATH)) {
    console.warn(`[sitemap] db.json not found at ${DB_PATH}; emitting static routes only.`);
    return { categories: [], products: [] };
  }
  try {
    const raw = readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      products: Array.isArray(data.products) ? data.products : [],
    };
  } catch (err) {
    console.warn(`[sitemap] Could not parse db.json: ${err.message}`);
    return { categories: [], products: [] };
  }
}

function buildEntries() {
  const { categories, products } = loadDb();
  const today = toIsoDate(new Date());
  const entries = [];

  for (const route of STATIC_ROUTES) {
    if (isExcluded(route.path)) continue;
    entries.push({
      loc: `${SITE_URL}${route.path}`,
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  }

  for (const cat of categories) {
    if (!cat?.slug) continue;
    const path = `/shop/${cat.slug}`;
    if (isExcluded(path)) continue;
    entries.push({
      loc: `${SITE_URL}${path}`,
      lastmod: toIsoDate(cat.updatedAt) || today,
      changefreq: 'weekly',
      priority: 0.7,
    });
  }

  for (const product of products) {
    if (!product?.slug) continue;
    if (product.isActive === false) continue;
    const path = `/product/${product.slug}`;
    if (isExcluded(path)) continue;
    entries.push({
      loc: `${SITE_URL}${path}`,
      lastmod: toIsoDate(product.updatedAt || product.createdAt) || today,
      changefreq: 'weekly',
      priority: 0.6,
    });
  }

  return entries;
}

function renderSitemap(entries) {
  const urls = entries
    .map((entry) => {
      const lines = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (typeof entry.priority === 'number') {
        lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${lines.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function main() {
  const entries = buildEntries();
  const xml = renderSitemap(entries);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, xml, 'utf-8');
  console.log(`[sitemap] Wrote ${entries.length} URLs to ${OUT_PATH}`);
}

main();
