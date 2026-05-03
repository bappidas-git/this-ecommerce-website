import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import { Link as RouterLink } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

function Breadcrumbs({ items = [], separator = '/', className, ...rest }) {
  if (!items.length) return null;
  const lastIndex = items.length - 1;

  return (
    <MuiBreadcrumbs
      separator={<span className={styles.sep} aria-hidden>{separator}</span>}
      className={[styles.root, className].filter(Boolean).join(' ')}
      aria-label="breadcrumb"
      {...rest}
    >
      {items.map((item, idx) => {
        if (idx === lastIndex || !item.to) {
          return (
            <span key={`${item.label}-${idx}`} className={styles.current} aria-current="page">
              {item.label}
            </span>
          );
        }
        return (
          <RouterLink key={`${item.label}-${idx}`} to={item.to} className={styles.link}>
            {item.label}
          </RouterLink>
        );
      })}
    </MuiBreadcrumbs>
  );
}

export default Breadcrumbs;
