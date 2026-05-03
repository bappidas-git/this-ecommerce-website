import { Helmet } from 'react-helmet-async';

import Hero from '../components/Hero/Hero.jsx';
import CategoryMosaic from '../components/CategoryMosaic/CategoryMosaic.jsx';
import NewArrivals from '../components/NewArrivals.jsx';
import Bestsellers from '../components/Bestsellers.jsx';
import BrandStoryStrip from '../components/BrandStoryStrip/BrandStoryStrip.jsx';
import Testimonials from '../components/Testimonials/Testimonials.jsx';
import NewsletterBand from '../components/NewsletterBand/NewsletterBand.jsx';

const SEO_TITLE = 'THIS Interiors — Pieces that quiet a room.';
const SEO_DESCRIPTION =
  'THIS Interiors — editorial homewares assembled in Dubai. Quiet pieces, considered materials, made to live with for years.';
const SEO_OG_IMAGE =
  'https://placehold.co/1200x630/F7F3ED/1B1A17?text=THIS+Interiors&font=playfair';

function Home() {
  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <link rel="canonical" href="/" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SEO_OG_IMAGE} />
        <meta property="og:url" content="/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        <meta name="twitter:image" content={SEO_OG_IMAGE} />
      </Helmet>
      <Hero />
      <CategoryMosaic />
      <NewArrivals />
      <BrandStoryStrip />
      <Bestsellers />
      <Testimonials />
      <NewsletterBand />
    </>
  );
}

export default Home;
