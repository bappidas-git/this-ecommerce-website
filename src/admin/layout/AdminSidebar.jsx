import { useMemo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Ticket,
  Users,
  Star,
  Settings as SettingsIcon,
  BarChart3,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
  X as CloseIcon,
} from 'lucide-react';

import { PATHS } from '../../routes/paths.js';
import useCanAdminAccess from '../hooks/useCanAdminAccess.js';
import { useAdminUI } from '../context/AdminUIContext.jsx';
import styles from './AdminSidebar.module.css';

const SECTIONS = [
  {
    label: 'Overview',
    items: [
      { area: 'dashboard', to: PATHS.admin.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { area: 'products', to: PATHS.admin.products, label: 'Products', icon: Package },
      { area: 'categories', to: PATHS.admin.categories, label: 'Categories', icon: FolderTree },
      { area: 'inventory', to: PATHS.admin.inventory, label: 'Inventory', icon: Boxes },
    ],
  },
  {
    label: 'Sales',
    items: [
      { area: 'orders', to: PATHS.admin.orders, label: 'Orders', icon: ShoppingBag },
      { area: 'coupons', to: PATHS.admin.coupons, label: 'Coupons', icon: Ticket },
    ],
  },
  {
    label: 'People',
    items: [
      { area: 'customers', to: PATHS.admin.customers, label: 'Customers', icon: Users },
      { area: 'reviews', to: PATHS.admin.reviews, label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Site',
    items: [
      { area: 'settings', to: PATHS.admin.settings, label: 'Settings', icon: SettingsIcon },
      { area: 'reports', to: PATHS.admin.reports, label: 'Reports', icon: BarChart3 },
      { area: 'users', to: PATHS.admin.users, label: 'Users', icon: ShieldCheck },
    ],
  },
];

function navLinkClass({ isActive }) {
  return [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ');
}

function SidebarItem({ item, collapsed, onNavigate, count }) {
  const Icon = item.icon;
  const linkContent = (
    <NavLink
      to={item.to}
      end={item.end}
      className={navLinkClass}
      onClick={onNavigate}
    >
      <span className={styles.itemIcon} aria-hidden="true">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      {!collapsed && (
        <>
          <span className={styles.itemLabel}>{item.label}</span>
          {typeof count === 'number' && (
            <span className={styles.itemCount}>{count}</span>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        {linkContent}
      </Tooltip>
    );
  }
  return linkContent;
}

function SidebarContent({ collapsed, variant, onNavigate, onClose }) {
  const dashboardAccess = useCanAdminAccess('dashboard');
  const productsAccess = useCanAdminAccess('products');
  const categoriesAccess = useCanAdminAccess('categories');
  const inventoryAccess = useCanAdminAccess('inventory');
  const ordersAccess = useCanAdminAccess('orders');
  const couponsAccess = useCanAdminAccess('coupons');
  const customersAccess = useCanAdminAccess('customers');
  const reviewsAccess = useCanAdminAccess('reviews');
  const settingsAccess = useCanAdminAccess('settings');
  const reportsAccess = useCanAdminAccess('reports');
  const usersAccess = useCanAdminAccess('users');

  const accessByArea = {
    dashboard: dashboardAccess,
    products: productsAccess,
    categories: categoriesAccess,
    inventory: inventoryAccess,
    orders: ordersAccess,
    coupons: couponsAccess,
    customers: customersAccess,
    reviews: reviewsAccess,
    settings: settingsAccess,
    reports: reportsAccess,
    users: usersAccess,
  };

  const sections = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) => accessByArea[item.area]?.canRead),
      })).filter((section) => section.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dashboardAccess.canRead,
      productsAccess.canRead,
      categoriesAccess.canRead,
      inventoryAccess.canRead,
      ordersAccess.canRead,
      couponsAccess.canRead,
      customersAccess.canRead,
      reviewsAccess.canRead,
      settingsAccess.canRead,
      reportsAccess.canRead,
      usersAccess.canRead,
    ],
  );

  const { isSidebarCollapsed, toggleSidebar } = useAdminUI();
  const isMobile = variant === 'mobile';

  return (
    <div className={[styles.inner, collapsed ? styles.innerCollapsed : ''].filter(Boolean).join(' ')}>
      <div className={styles.brandRow}>
        <Link
          to={PATHS.admin.root}
          className={styles.brand}
          onClick={onNavigate}
          aria-label="THIS Admin home"
        >
          <span className={styles.brandMark} aria-hidden="true">TI</span>
          {!collapsed && <span className={styles.brandText}>THIS Admin</span>}
        </Link>
        {isMobile && (
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close navigation"
            className={styles.closeBtn}
          >
            <CloseIcon size={18} />
          </IconButton>
        )}
      </div>

      <nav className={styles.nav} aria-label="Admin sections">
        {sections.map((section) => (
          <div key={section.label} className={styles.section}>
            {!collapsed && (
              <p className={styles.sectionLabel}>{section.label}</p>
            )}
            <ul className={styles.sectionList}>
              {section.items.map((item) => (
                <li key={item.to}>
                  <SidebarItem
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {!isMobile && (
        <div className={styles.footer}>
          <Tooltip
            title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
            placement="right"
            arrow
          >
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={isSidebarCollapsed}
            >
              {isSidebarCollapsed ? (
                <ChevronsRight size={18} strokeWidth={1.75} />
              ) : (
                <ChevronsLeft size={18} strokeWidth={1.75} />
              )}
              {!collapsed && <span>Collapse</span>}
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function AdminSidebar() {
  const { isSidebarCollapsed, isMobileSidebarOpen, closeMobileSidebar } = useAdminUI();
  const location = useLocation();

  return (
    <>
      <aside
        className={[
          styles.sidebar,
          isSidebarCollapsed ? styles.sidebarCollapsed : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Admin primary navigation"
        data-collapsed={isSidebarCollapsed ? 'true' : 'false'}
      >
        <SidebarContent collapsed={isSidebarCollapsed} variant="desktop" />
      </aside>

      <Drawer
        anchor="left"
        open={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
        ModalProps={{ keepMounted: false }}
        PaperProps={{
          className: styles.mobileDrawerPaper,
        }}
        // re-close on route change is handled by AdminLayout; keep key on location for reset
        key={location.pathname}
      >
        <SidebarContent
          collapsed={false}
          variant="mobile"
          onNavigate={closeMobileSidebar}
          onClose={closeMobileSidebar}
        />
      </Drawer>
    </>
  );
}

export default AdminSidebar;
