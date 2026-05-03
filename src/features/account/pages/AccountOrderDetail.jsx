import { useParams } from 'react-router-dom';

function AccountOrderDetail() {
  const { id } = useParams();
  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, margin: 0 }}>
        Order {id ? `#${id}` : ''}
      </h2>
      <p style={{ color: 'var(--color-ink-2)', marginTop: 8 }}>Order details.</p>
    </section>
  );
}

export default AccountOrderDetail;
