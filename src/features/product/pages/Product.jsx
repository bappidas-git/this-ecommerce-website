import { useParams } from 'react-router-dom';
import PageStub from '../../../components/common/PageStub.jsx';

function Product() {
  const { slug } = useParams();
  return (
    <PageStub
      name={slug ? `Product · ${slug}` : 'Product'}
      eyebrow="Object"
      kicker="Product detail will live here."
    />
  );
}

export default Product;
