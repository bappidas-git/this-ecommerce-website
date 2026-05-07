import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout.jsx';
import CheckoutLayout from '../components/layout/CheckoutLayout.jsx';
import AccountLayout from '../components/layout/AccountLayout.jsx';
import AdminLayout from '../admin/layout/AdminLayout.jsx';

import { AuthProvider } from '../context/AuthContext.jsx';
import { AdminAuthProvider } from '../admin/context/AdminAuthContext.jsx';

import RequireAuth from './RequireAuth.jsx';
import RequireAdmin from './RequireAdmin.jsx';
import { PATHS } from './paths.js';

import RouteFallback from '../components/common/RouteFallback/RouteFallback.jsx';

import Home from '../features/home/pages/Home.jsx';

const ShopPage = lazy(() => import('../features/shop/pages/ShopPage.jsx'));
const ProductDetailPage = lazy(() =>
  import('../features/product/pages/ProductDetailPage.jsx'),
);
const SearchPage = lazy(() => import('../features/search/pages/SearchPage.jsx'));
const CartPage = lazy(() => import('../features/cart/pages/CartPage.jsx'));
const WishlistPage = lazy(() => import('../features/account/pages/WishlistPage.jsx'));

const Login = lazy(() => import('../features/auth/pages/Login.jsx'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() =>
  import('../features/auth/pages/ForgotPasswordPage.jsx'),
);
const ResetPasswordPage = lazy(() =>
  import('../features/auth/pages/ResetPasswordPage.jsx'),
);

const AboutPage = lazy(() => import('../features/static/pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('../features/static/pages/ContactPage.jsx'));
const Faq = lazy(() => import('../features/static/pages/Faq.jsx'));
const Privacy = lazy(() => import('../features/static/pages/Privacy.jsx'));
const Terms = lazy(() => import('../features/static/pages/Terms.jsx'));
const ShippingReturns = lazy(() =>
  import('../features/static/pages/ShippingReturns.jsx'),
);
const NotFound = lazy(() => import('../features/static/pages/NotFound.jsx'));

const CheckoutAddress = lazy(() =>
  import('../features/checkout/pages/CheckoutAddressPage.jsx'),
);
const CheckoutPayment = lazy(() =>
  import('../features/checkout/pages/CheckoutPaymentPage.jsx'),
);
const CheckoutReview = lazy(() =>
  import('../features/checkout/pages/CheckoutReviewPage.jsx'),
);
const OrderConfirmation = lazy(() =>
  import('../features/checkout/pages/CheckoutConfirmationPage.jsx'),
);

const AccountProfile = lazy(() => import('../features/account/pages/AccountProfile.jsx'));
const OrdersListPage = lazy(() => import('../features/account/pages/OrdersListPage.jsx'));
const OrderDetailPage = lazy(() =>
  import('../features/account/pages/OrderDetailPage.jsx'),
);
const AddressesPage = lazy(() => import('../features/account/pages/AddressesPage.jsx'));
const AccountPassword = lazy(() =>
  import('../features/account/pages/AccountPassword.jsx'),
);
const AccountPreferences = lazy(() =>
  import('../features/account/pages/AccountPreferences.jsx'),
);

const AdminLoginPage = lazy(() => import('../admin/pages/AdminLoginPage.jsx'));
const AdminDashboard = lazy(() => import('../admin/pages/AdminDashboard.jsx'));
const AdminProducts = lazy(() =>
  import('../admin/pages/products/ProductsListPage.jsx'),
);
const AdminProductForm = lazy(() =>
  import('../admin/pages/products/ProductFormPage.jsx'),
);
const AdminCategories = lazy(() =>
  import('../admin/pages/categories/CategoriesPage.jsx'),
);
const AdminInventory = lazy(() =>
  import('../admin/pages/inventory/InventoryPage.jsx'),
);
const AdminOrders = lazy(() => import('../admin/pages/orders/OrdersListPage.jsx'));
const AdminOrderDetail = lazy(() =>
  import('../admin/pages/orders/OrderDetailPage.jsx'),
);
const AdminCustomers = lazy(() =>
  import('../admin/pages/customers/CustomersListPage.jsx'),
);
const AdminCustomerDetail = lazy(() =>
  import('../admin/pages/customers/CustomerDetailPage.jsx'),
);
const AdminReviews = lazy(() =>
  import('../admin/pages/reviews/ReviewsModerationPage.jsx'),
);
const AdminCoupons = lazy(() => import('../admin/pages/coupons/CouponsListPage.jsx'));
const AdminSettings = lazy(() => import('../admin/pages/settings/SettingsPage.jsx'));
const AdminReports = lazy(() => import('../admin/pages/AdminReports.jsx'));
const AdminUsers = lazy(() => import('../admin/pages/users/UsersPage.jsx'));

const KitchenSink = lazy(() => import('./KitchenSink.jsx'));
const KitchenSinkProducts = lazy(() => import('./KitchenSinkProducts.jsx'));

const isDev = import.meta.env.DEV;

const wrap = (variant, node) => (
  <Suspense fallback={<RouteFallback variant={variant} />}>{node}</Suspense>
);

function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <AuthProvider>
            <MainLayout />
          </AuthProvider>
        }
      >
        <Route index element={<Home />} />
        <Route path="shop" element={wrap('shop', <ShopPage />)} />
        <Route path="shop/:slug" element={wrap('shop', <ShopPage />)} />
        <Route path="product/:slug" element={wrap('product', <ProductDetailPage />)} />
        <Route path="search" element={wrap('shop', <SearchPage />)} />
        <Route path="cart" element={wrap('page', <CartPage />)} />
        <Route path="wishlist" element={wrap('shop', <WishlistPage />)} />

        <Route path="forgot-password" element={wrap('page', <ForgotPasswordPage />)} />
        <Route path="reset-password" element={wrap('page', <ResetPasswordPage />)} />

        <Route path="about" element={wrap('page', <AboutPage />)} />
        <Route path="contact" element={wrap('page', <ContactPage />)} />
        <Route path="faq" element={wrap('page', <Faq />)} />
        <Route path="privacy" element={wrap('page', <Privacy />)} />
        <Route path="terms" element={wrap('page', <Terms />)} />
        <Route path="shipping-returns" element={wrap('page', <ShippingReturns />)} />

        <Route
          path="account"
          element={
            <RequireAuth>
              <AccountLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to={PATHS.account.profile} replace />} />
          <Route path="profile" element={wrap('account', <AccountProfile />)} />
          <Route path="orders" element={wrap('account', <OrdersListPage />)} />
          <Route path="orders/:id" element={wrap('account', <OrderDetailPage />)} />
          <Route path="addresses" element={wrap('account', <AddressesPage />)} />
          <Route
            path="wishlist"
            element={wrap('account', <WishlistPage variant="account" />)}
          />
          <Route path="password" element={wrap('account', <AccountPassword />)} />
          <Route path="preferences" element={wrap('account', <AccountPreferences />)} />
        </Route>

        {isDev ? (
          <Route path="_kitchen-sink" element={wrap('page', <KitchenSink />)} />
        ) : null}
        {isDev ? (
          <Route
            path="_kitchen-sink/products"
            element={wrap('page', <KitchenSinkProducts />)}
          />
        ) : null}
      </Route>

      <Route
        path="checkout"
        element={
          <AuthProvider>
            <CheckoutLayout />
          </AuthProvider>
        }
      >
        <Route index element={<Navigate to={PATHS.checkoutAddress} replace />} />
        <Route path="address" element={wrap('checkout', <CheckoutAddress />)} />
        <Route path="payment" element={wrap('checkout', <CheckoutPayment />)} />
        <Route path="review" element={wrap('checkout', <CheckoutReview />)} />
      </Route>

      <Route
        path="order"
        element={
          <AuthProvider>
            <CheckoutLayout />
          </AuthProvider>
        }
      >
        <Route
          path="confirmation/:id"
          element={wrap('checkout', <OrderConfirmation />)}
        />
      </Route>

      <Route
        path="login"
        element={
          <AuthProvider>{wrap('page', <Login />)}</AuthProvider>
        }
      />
      <Route
        path="register"
        element={
          <AuthProvider>{wrap('page', <RegisterPage />)}</AuthProvider>
        }
      />

      <Route
        path="admin/login"
        element={
          <AdminAuthProvider>{wrap('admin', <AdminLoginPage />)}</AdminAuthProvider>
        }
      />
      <Route path="admin" element={<AdminLayout />}>
        <Route
          index
          element={
            <RequireAdmin area="dashboard">
              {wrap('admin', <AdminDashboard />)}
            </RequireAdmin>
          }
        />
        <Route
          path="products"
          element={
            <RequireAdmin area="products">
              {wrap('admin', <AdminProducts />)}
            </RequireAdmin>
          }
        />
        <Route
          path="products/new"
          element={
            <RequireAdmin area="products">
              {wrap('admin', <AdminProductForm />)}
            </RequireAdmin>
          }
        />
        <Route
          path="products/:id"
          element={
            <RequireAdmin area="products">
              {wrap('admin', <AdminProductForm />)}
            </RequireAdmin>
          }
        />
        <Route
          path="categories"
          element={
            <RequireAdmin area="categories">
              {wrap('admin', <AdminCategories />)}
            </RequireAdmin>
          }
        />
        <Route
          path="inventory"
          element={
            <RequireAdmin area="inventory">
              {wrap('admin', <AdminInventory />)}
            </RequireAdmin>
          }
        />
        <Route
          path="orders"
          element={
            <RequireAdmin area="orders">{wrap('admin', <AdminOrders />)}</RequireAdmin>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequireAdmin area="orders">
              {wrap('admin', <AdminOrderDetail />)}
            </RequireAdmin>
          }
        />
        <Route
          path="customers"
          element={
            <RequireAdmin area="customers">
              {wrap('admin', <AdminCustomers />)}
            </RequireAdmin>
          }
        />
        <Route
          path="customers/:id"
          element={
            <RequireAdmin area="customers">
              {wrap('admin', <AdminCustomerDetail />)}
            </RequireAdmin>
          }
        />
        <Route
          path="reviews"
          element={
            <RequireAdmin area="reviews">
              {wrap('admin', <AdminReviews />)}
            </RequireAdmin>
          }
        />
        <Route
          path="coupons"
          element={
            <RequireAdmin area="coupons">
              {wrap('admin', <AdminCoupons />)}
            </RequireAdmin>
          }
        />
        <Route
          path="settings"
          element={
            <RequireAdmin area="settings">
              {wrap('admin', <AdminSettings />)}
            </RequireAdmin>
          }
        />
        <Route
          path="reports"
          element={
            <RequireAdmin area="reports">
              {wrap('admin', <AdminReports />)}
            </RequireAdmin>
          }
        />
        <Route
          path="users"
          element={
            <RequireAdmin area="users">{wrap('admin', <AdminUsers />)}</RequireAdmin>
          }
        />
      </Route>

      <Route path="*" element={wrap('page', <NotFound />)} />
    </Routes>
  );
}

export default AppRoutes;
