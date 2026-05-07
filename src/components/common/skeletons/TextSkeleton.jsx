import styles from './Skeleton.module.css';

const WIDTHS = ['textLong', 'textMedium', 'textShort'];

function TextSkeleton({ lines = 1, lineHeight = 12, gap = 8, className, ...rest }) {
  const total = Math.max(1, Math.floor(lines));
  const items = Array.from({ length: total }, (_, i) => {
    const isLast = i === total - 1 && total > 1;
    const widthClass = isLast ? styles.textShort : WIDTHS[i % WIDTHS.length];
    return (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        className={`${styles.base} ${styles.text} ${widthClass}`}
        style={{ height: lineHeight }}
        aria-hidden
      />
    );
  });

  const blockClasses = [styles.textBlock, className].filter(Boolean).join(' ');
  return (
    <div className={blockClasses} style={{ gap }} {...rest}>
      {items}
    </div>
  );
}

export default TextSkeleton;
