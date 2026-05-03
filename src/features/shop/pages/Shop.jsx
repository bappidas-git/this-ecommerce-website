import { useParams } from 'react-router-dom';
import PageStub from '../../../components/common/PageStub.jsx';

function Shop() {
  const { slug } = useParams();
  return (
    <PageStub
      name={slug ? `Shop · ${slug}` : 'Shop'}
      eyebrow="The collection"
      kicker={slug ? `Browsing the ${slug} category.` : 'All small decor for considered homes.'}
    />
  );
}

export default Shop;
