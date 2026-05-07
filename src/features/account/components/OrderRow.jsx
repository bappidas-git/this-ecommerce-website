import { memo } from 'react';
import { Link } from 'react-router-dom';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import StatusPill from './StatusPill.jsx';
import { PATHS } from '../../../routes/paths.js';
import { formatCurrency, formatDate } from '../../../utils/format.js';
import styles from './OrderRow.module.css';

const MAX_THUMBS = 5;

function OrderRow({ order }) {
  if (!order) return null;
  const items = Array.isArray(order.items) ? order.items : [];
  const itemCount = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  const visibleThumbs = items.slice(0, MAX_THUMBS);
  const overflow = Math.max(0, items.length - visibleThumbs.length);
  const detailHref = PATHS.account.orderDetail(order.id);

  return (
    <article className={styles.row} aria-label={`Order ${order.number}`}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.number}>{order.number}</span>
          <span className={styles.dot} aria-hidden>
            ·
          </span>
          <time className={styles.date} dateTime={order.createdAt}>
            {formatDate(order.createdAt)}
          </time>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className={styles.body}>
        <div className={styles.thumbs} aria-label={`${itemCount} pieces`}>
          {visibleThumbs.map((it, idx) => (
            <span
              key={`${order.id}-${it.productId ?? idx}`}
              className={styles.thumb}
              style={{ zIndex: visibleThumbs.length - idx }}
            >
              {it.image ? (
                <img src={it.image} alt="" loading="lazy" />
              ) : (
                <span className={styles.thumbFallback} aria-hidden />
              )}
            </span>
          ))}
          {overflow > 0 ? (
            <span className={styles.overflow} aria-label={`${overflow} more`}>
              +{overflow}
            </span>
          ) : null}
        </div>

        <div className={styles.meta}>
          <span className={styles.total}>
            {formatCurrency(order.total, order.currency || 'AED')}
          </span>
          <span className={styles.pieces}>
            {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
          </span>
        </div>

        <Link to={detailHref} className={styles.viewLink}>
          View order
          <ChevronRightRoundedIcon fontSize="small" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export default memo(OrderRow);
