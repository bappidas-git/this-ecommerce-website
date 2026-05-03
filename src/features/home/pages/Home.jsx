import { Helmet } from 'react-helmet-async';

import Hero from '../components/Hero/Hero.jsx';
import CategoryMosaic from '../components/CategoryMosaic/CategoryMosaic.jsx';

const SEO_DESCRIPTION =
  'THIS Interiors — editorial homewares assembled in Dubai. Quiet pieces, considered materials, made to live with for years.';

function Home() {
  return (
    <>
      <Helmet>
        <title>THIS Interiors — Pieces that quiet a room.</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta property="og:title" content="THIS Interiors — Pieces that quiet a room." />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Hero />
      <CategoryMosaic />
    </>
  );
}

export default Home;
