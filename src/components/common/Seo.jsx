import { Helmet } from 'react-helmet-async';

function Seo({ title, description, canonical, noindex = false, children }) {
  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
      {children}
    </Helmet>
  );
}

export default Seo;
