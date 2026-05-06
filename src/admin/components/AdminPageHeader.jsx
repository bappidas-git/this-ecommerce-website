import styles from './AdminPageHeader.module.css';

function AdminPageHeader({ title, description, actions, eyebrow }) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        {title && <h1 className={styles.title}>{title}</h1>}
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

export default AdminPageHeader;
