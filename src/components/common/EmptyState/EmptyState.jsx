import styles from './EmptyState.module.css';

function EmptyState({ icon, title, description, cta, className, ...rest }) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" {...rest}>
      {icon ? (
        <div className={styles.icon} aria-hidden>
          {icon}
        </div>
      ) : null}
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {description ? <p className={styles.description}>{description}</p> : null}
      {cta ? <div className={styles.cta}>{cta}</div> : null}
    </div>
  );
}

export default EmptyState;
