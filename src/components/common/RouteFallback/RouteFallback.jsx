import RectSkeleton from '../skeletons/RectSkeleton.jsx';
import TextSkeleton from '../skeletons/TextSkeleton.jsx';
import styles from './RouteFallback.module.css';

const VARIANTS = {
  page: 'page',
  shop: 'shop',
  product: 'product',
  account: 'account',
  checkout: 'checkout',
  admin: 'admin',
};

function ShopFallback() {
  return (
    <div className={styles.shop}>
      <div className={styles.shopHeader}>
        <RectSkeleton h={28} w="40%" r={4} />
        <RectSkeleton h={14} w="60%" r={4} />
      </div>
      <div className={styles.shopToolbar}>
        <RectSkeleton h={36} w={120} r={8} />
        <RectSkeleton h={36} w={120} r={8} />
        <RectSkeleton h={36} w={140} r={8} />
      </div>
      <div className={styles.shopGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.shopCard}>
            <RectSkeleton h={220} r={14} />
            <TextSkeleton lines={2} lineHeight={12} gap={8} />
            <RectSkeleton h={14} w="40%" r={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductFallback() {
  return (
    <div className={styles.product}>
      <RectSkeleton h={420} r={14} />
      <div className={styles.productMeta}>
        <RectSkeleton h={14} w="30%" r={4} />
        <RectSkeleton h={36} w="80%" r={4} />
        <TextSkeleton lines={3} lineHeight={12} gap={10} />
        <RectSkeleton h={48} w="60%" r={8} />
      </div>
    </div>
  );
}

function AccountFallback() {
  return (
    <div className={styles.account}>
      <RectSkeleton h={28} w="30%" r={4} />
      <RectSkeleton h={140} r={14} />
      <TextSkeleton lines={4} lineHeight={12} gap={10} />
    </div>
  );
}

function CheckoutFallback() {
  return (
    <div className={styles.checkout}>
      <RectSkeleton h={32} w="40%" r={4} />
      <RectSkeleton h={220} r={14} />
      <RectSkeleton h={120} r={14} />
    </div>
  );
}

function AdminFallback() {
  return (
    <div className={styles.admin}>
      <RectSkeleton h={28} w="35%" r={4} />
      <div className={styles.adminGrid}>
        <RectSkeleton h={120} r={14} />
        <RectSkeleton h={120} r={14} />
        <RectSkeleton h={120} r={14} />
      </div>
      <RectSkeleton h={320} r={14} />
    </div>
  );
}

function PageFallback() {
  return (
    <div className={styles.page}>
      <RectSkeleton h={32} w="50%" r={4} />
      <TextSkeleton lines={4} lineHeight={12} gap={10} />
      <RectSkeleton h={200} r={14} />
    </div>
  );
}

function RouteFallback({ variant = 'page' }) {
  const v = VARIANTS[variant] || VARIANTS.page;
  if (v === 'shop') return <ShopFallback />;
  if (v === 'product') return <ProductFallback />;
  if (v === 'account') return <AccountFallback />;
  if (v === 'checkout') return <CheckoutFallback />;
  if (v === 'admin') return <AdminFallback />;
  return <PageFallback />;
}

export default RouteFallback;
