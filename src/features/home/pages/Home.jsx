import { lazy, Suspense } from 'react';

import Seo from '../../../components/common/Seo.jsx';

import Hero, { HERO_IMAGE } from '../components/Hero/Hero.jsx';
import CategoryMosaic from '../components/CategoryMosaic/CategoryMosaic.jsx';

const NewArrivals = lazy(() => import('../components/NewArrivals.jsx'));
const Bestsellers = lazy(() => import('../components/Bestsellers.jsx'));
const BrandStoryStrip = lazy(() =>
  import('../components/BrandStoryStrip/BrandStoryStrip.jsx'),
);
const Testimonials = lazy(() => import('../components/Testimonials/Testimonials.jsx'));
const NewsletterBand = lazy(() =>
  import('../components/NewsletterBand/NewsletterBand.jsx'),
);

const SEO_TITLE = 'THIS Interiors — Pieces that quiet a room.';
const SEO_DESCRIPTION =
  'THIS Interiors — editorial homewares assembled in Dubai. Quiet pieces, considered materials, made to live with for years.';
const SEO_OG_IMAGE =
  'https://placehold.co/1200x630/F7F3ED/1B1A17?text=THIS+Interiors&font=playfair';

function Home() {
  return (
    <>
      <Seo
        title={SEO_TITLE}
        description={SEO_DESCRIPTION}
        canonical="/"
        image={SEO_OG_IMAGE}
      >
        <link rel="preload" as="image" href={HERO_IMAGE} fetchpriority="high" />
      </Seo>
      <Hero />
      <CategoryMosaic />
      <Suspense fallback={null}>
        <NewArrivals />
        <BrandStoryStrip />
        <Bestsellers />
        <Testimonials />
        <NewsletterBand />
      </Suspense>
    </>
  );
}

export default Home;
