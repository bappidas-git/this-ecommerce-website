import { formatCurrency } from '../../utils/format.js';
import styles from './PriceTag.module.css';

const SIZE_CLASS = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

function PriceTag({ value, compareAt, size = 'md', currency, className, ...rest }) {
  const resolvedCurrency = currency || import.meta.env.VITE_DEFAULT_CURRENCY || 'AED';
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;
  const classes = [styles.root, sizeClass, className].filter(Boolean).join(' ');

  const hasDiscount =
    typeof compareAt === 'number' && typeof value === 'number' && compareAt > value;
  const savePct = hasDiscount ? Math.round(((compareAt - value) / compareAt) * 100) : 0;

  return (
    <span className={classes} {...rest}>
      <span className={styles.price}>{formatCurrency(value, resolvedCurrency)}</span>
      {hasDiscount ? (
        <span className={styles.compare} aria-label="Original price">
          {formatCurrency(compareAt, resolvedCurrency)}
        </span>
      ) : null}
      {hasDiscount && savePct > 0 ? (
        <span className={styles.save} aria-label={`Save ${savePct} percent`}>
          Save {savePct}%
        </span>
      ) : null}
    </span>
  );
}

export default PriceTag;
