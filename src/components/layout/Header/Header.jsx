import { useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AnnouncementBar from './AnnouncementBar.jsx';
import Logo from './Logo.jsx';
import PrimaryNav from './PrimaryNav.jsx';
import HeaderActions from './HeaderActions.jsx';
import { useScrollState } from '../../../hooks/useScrollState.js';
import { useUI } from '../../../context/UIContext.jsx';
import styles from './Header.module.css';

const HIDE_THRESHOLD = 240;
const SOLID_THRESHOLD = 8;

function Header({ onOpenMobileMenu, onOpenSearch, onOpenCart }) {
  const { y, dir } = useScrollState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { openCart, openSearch, openMobileNav } = useUI();

  const handleOpenCart = onOpenCart || openCart;
  const handleOpenSearch = onOpenSearch || openSearch;
  const handleOpenMobileMenu = onOpenMobileMenu || openMobileNav;

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (!isMobile) {
      if (hidden) setHidden(false);
      lastY.current = y;
      return;
    }
    if (y < HIDE_THRESHOLD) {
      if (hidden) setHidden(false);
    } else if (dir === 'down' && y > lastY.current) {
      if (!hidden) setHidden(true);
    } else if (dir === 'up') {
      if (hidden) setHidden(false);
    }
    lastY.current = y;
  }, [y, dir, isMobile, hidden]);

  const isScrolled = y > SOLID_THRESHOLD;
  const shellClassName = [
    styles.shell,
    isScrolled ? styles.scrolled : '',
    hidden ? styles.hidden : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={shellClassName}>
      <AnnouncementBar />
      <AppBar
        className={styles.appbar}
        position="static"
        elevation={0}
        component="div"
      >
        <div className={styles.row}>
          <div className={styles.left}>
            <IconButton
              className={styles.menuButton}
              aria-label="Open navigation menu"
              onClick={handleOpenMobileMenu}
              size="medium"
            >
              <MenuIcon />
            </IconButton>
            <Logo />
          </div>
          <div className={styles.center}>
            <PrimaryNav />
          </div>
          <div className={styles.right}>
            <HeaderActions onOpenSearch={handleOpenSearch} onOpenCart={handleOpenCart} />
          </div>
        </div>
      </AppBar>
    </header>
  );
}

export default Header;
