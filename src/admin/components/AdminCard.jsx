import styles from './AdminCard.module.css';

function AdminCard({
  title,
  eyebrow,
  action,
  children,
  className,
  bodyClassName,
  as: Tag = 'section',
  ...rest
}) {
  const classes = [styles.card, className].filter(Boolean).join(' ');
  const bodyClasses = [styles.body, bodyClassName].filter(Boolean).join(' ');
  const hasHeader = Boolean(title || eyebrow || action);

  return (
    <Tag className={classes} {...rest}>
      {hasHeader ? (
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            {title ? <h2 className={styles.title}>{title}</h2> : null}
          </div>
          {action ? <div className={styles.action}>{action}</div> : null}
        </header>
      ) : null}
      <div className={bodyClasses}>{children}</div>
    </Tag>
  );
}

export default AdminCard;
