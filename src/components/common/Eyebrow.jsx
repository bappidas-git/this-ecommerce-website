import styles from './Eyebrow.module.css';

const COLOR_CLASS = {
  muted: styles.muted,
  brass: styles.brass,
  emerald: styles.emerald,
  bg: styles.bg,
};

function Eyebrow({ as: Tag = 'span', color = 'muted', className, children, ...rest }) {
  const colorClass = COLOR_CLASS[color] || COLOR_CLASS.muted;
  const classes = [styles.eyebrow, colorClass, className].filter(Boolean).join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export default Eyebrow;
