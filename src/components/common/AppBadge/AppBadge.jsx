import styles from './AppBadge.module.css';

const VARIANT_LABEL = {
  new: 'New',
  sale: 'Sale',
  limited: 'Limited',
  'low-stock': 'Low stock',
  'sold-out': 'Sold out',
};

const VARIANT_CLASS = {
  new: styles.new,
  sale: styles.sale,
  limited: styles.limited,
  'low-stock': styles.lowStock,
  'sold-out': styles.soldOut,
};

function AppBadge({ variant = 'new', children, className, ...rest }) {
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.new;
  const classes = [styles.root, variantClass, className].filter(Boolean).join(' ');
  const content = children ?? VARIANT_LABEL[variant] ?? variant;

  return (
    <span className={classes} {...rest}>
      {content}
    </span>
  );
}

export default AppBadge;
