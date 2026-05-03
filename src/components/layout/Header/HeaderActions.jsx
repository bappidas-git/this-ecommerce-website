import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import { PATHS } from '../../../routes/paths.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useWishlistCount } from '../../../hooks/useWishlistCount.js';
import { useCartCount } from '../../../hooks/useCartCount.js';
import styles from './HeaderActions.module.css';

function HeaderActions({ onOpenSearch, onOpenCart }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const wishlistCount = useWishlistCount();
  const cartCount = useCartCount();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const userButtonRef = useRef(null);

  const handleSearch = () => {
    if (onOpenSearch) onOpenSearch();
    else navigate(PATHS.search);
  };

  const handleCart = () => {
    if (onOpenCart) onOpenCart();
    else navigate(PATHS.cart);
  };

  const handleUserClick = (event) => {
    if (!isAuthenticated) {
      navigate(PATHS.auth.login);
      return;
    }
    setUserMenuAnchor(event.currentTarget);
  };

  const closeUserMenu = () => setUserMenuAnchor(null);

  const handleSignOut = () => {
    closeUserMenu();
    navigate(PATHS.home);
  };

  return (
    <div className={styles.actions}>
      <IconButton
        className={styles.iconButton}
        aria-label="Open search"
        onClick={handleSearch}
        size="medium"
      >
        <SearchIcon />
      </IconButton>

      <IconButton
        className={styles.iconButton}
        aria-label={
          wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'
        }
        component={Link}
        to={PATHS.wishlist}
        size="medium"
      >
        <Badge
          className={styles.badge}
          badgeContent={wishlistCount}
          aria-live="polite"
          overlap="circular"
          invisible={wishlistCount === 0}
        >
          <FavoriteBorderIcon />
        </Badge>
      </IconButton>

      <IconButton
        className={styles.iconButton}
        aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'}
        onClick={handleCart}
        size="medium"
      >
        <Badge
          className={styles.badge}
          badgeContent={cartCount}
          aria-live="polite"
          overlap="circular"
          invisible={cartCount === 0}
        >
          <ShoppingBagOutlinedIcon />
        </Badge>
      </IconButton>

      <IconButton
        ref={userButtonRef}
        className={styles.iconButton}
        aria-label={isAuthenticated ? 'Account menu' : 'Sign in'}
        aria-haspopup={isAuthenticated ? 'menu' : undefined}
        aria-expanded={isAuthenticated ? Boolean(userMenuAnchor) : undefined}
        onClick={handleUserClick}
        size="medium"
      >
        <PersonOutlineIcon />
      </IconButton>

      {isAuthenticated ? (
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={closeUserMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { className: styles.menuPaper } }}
        >
          <div className={styles.userHeader}>
            <p className={styles.userName}>
              {user?.firstName ? `Hi, ${user.firstName}` : 'Welcome back'}
            </p>
            {user?.email ? <p className={styles.userEmail}>{user.email}</p> : null}
          </div>
          <MenuItem
            className={styles.menuItem}
            component={Link}
            to={PATHS.account.profile}
            onClick={closeUserMenu}
          >
            Profile
          </MenuItem>
          <MenuItem
            className={styles.menuItem}
            component={Link}
            to={PATHS.account.orders}
            onClick={closeUserMenu}
          >
            Orders
          </MenuItem>
          <MenuItem
            className={styles.menuItem}
            component={Link}
            to={PATHS.account.wishlist}
            onClick={closeUserMenu}
          >
            Wishlist
          </MenuItem>
          <Divider />
          <MenuItem className={styles.menuItem} onClick={handleSignOut}>
            Sign out
          </MenuItem>
        </Menu>
      ) : null}
    </div>
  );
}

export default HeaderActions;
