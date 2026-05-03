import styles from './SkeletonCard.module.css';

function SkeletonCard({ className, ...rest }) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={classes} aria-hidden {...rest}>
      <div className={styles.image} />
      <div className={styles.lines}>
        <div className={`${styles.line} ${styles.lineLong}`} />
        <div className={`${styles.line} ${styles.lineShort}`} />
      </div>
      <div className={`${styles.line} ${styles.price}`} />
    </div>
  );
}

export default SkeletonCard;
