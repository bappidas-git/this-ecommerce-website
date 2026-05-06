import Seo from '../../../components/common/Seo.jsx';

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
      <Seo
        title={SEO_TITLE}
        description={SEO_DESCRIPTION}
        canonical="/"
        image={SEO_OG_IMAGE}
      />
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
