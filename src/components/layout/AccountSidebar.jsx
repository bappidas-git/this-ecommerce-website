import { NavLink } from 'react-router-dom';
import styles from './AccountSidebar.module.css';

function navClass({ isActive }) {
  return [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ');
}

function AccountSidebar({ links }) {
  return (
    <aside className={styles.sidebar} aria-label="Account navigation">
      <nav className={styles.nav}>
        {links.map((item) => (
          <NavLink key={item.to} to={item.to} end className={navClass}>
            <span className={styles.bar} aria-hidden />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AccountSidebar;
