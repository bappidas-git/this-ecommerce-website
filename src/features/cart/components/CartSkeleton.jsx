import {
  RectSkeleton,
  TextSkeleton,
} from '../../../components/common/skeletons/index.js';

import styles from './CartSkeleton.module.css';

const ROWS = 3;

function CartSkeleton() {
  return (
    <div className={styles.layout} aria-hidden="true">
      <div className={styles.itemsCol}>
        <ul className={styles.list}>
          {Array.from({ length: ROWS }).map((_, i) => (
            <li
              // eslint-disable-next-line react/no-array-index-key
              key={`cart-row-${i}`}
              className={styles.row}
            >
              <RectSkeleton w={96} h={120} r={8} className={styles.thumb} />
              <div className={styles.body}>
                <TextSkeleton lines={2} lineHeight={14} />
                <RectSkeleton w={80} h={14} r={4} />
              </div>
              <div className={styles.tail}>
                <RectSkeleton w={120} h={36} r={999} />
                <RectSkeleton w={80} h={14} r={4} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className={styles.summary} aria-hidden="true">
        <RectSkeleton w="60%" h={16} r={4} />
        <div className={styles.summaryRows}>
          <div className={styles.summaryRow}>
            <RectSkeleton w="40%" h={12} r={4} />
            <RectSkeleton w="20%" h={12} r={4} />
          </div>
          <div className={styles.summaryRow}>
            <RectSkeleton w="35%" h={12} r={4} />
            <RectSkeleton w="22%" h={12} r={4} />
          </div>
          <div className={styles.summaryRow}>
            <RectSkeleton w="30%" h={12} r={4} />
            <RectSkeleton w="22%" h={12} r={4} />
          </div>
          <div className={styles.divider} />
          <div className={styles.summaryRow}>
            <RectSkeleton w="30%" h={16} r={4} />
            <RectSkeleton w="30%" h={16} r={4} />
          </div>
        </div>
        <RectSkeleton w="100%" h={48} r={999} />
      </aside>
    </div>
  );
}

export default CartSkeleton;
