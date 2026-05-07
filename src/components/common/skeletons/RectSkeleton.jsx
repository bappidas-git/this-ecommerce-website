import styles from './Skeleton.module.css';

function toCssSize(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return value;
}

function RectSkeleton({ w, h, r, className, style, ...rest }) {
  const classes = [styles.base, styles.rect, className].filter(Boolean).join(' ');
  const inline = {
    ...style,
    width: toCssSize(w) ?? style?.width ?? '100%',
    height: toCssSize(h) ?? style?.height ?? 12,
  };
  if (r !== undefined) inline.borderRadius = toCssSize(r);
  return <div className={classes} style={inline} aria-hidden {...rest} />;
}

export default RectSkeleton;
