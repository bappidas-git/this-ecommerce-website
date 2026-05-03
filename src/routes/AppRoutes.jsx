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

import Home from '../features/home/pages/Home.jsx';
import ShopPage from '../features/shop/pages/ShopPage.jsx';
import ProductDetailPage from '../features/product/pages/ProductDetailPage.jsx';
import Search from '../features/search/pages/Search.jsx';
import CartPage from '../features/cart/pages/CartPage.jsx';
import Wishlist from '../features/cart/pages/Wishlist.jsx';

import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import ForgotPassword from '../features/auth/pages/ForgotPassword.jsx';
import ResetPassword from '../features/auth/pages/ResetPassword.jsx';

import About from '../features/static/pages/About.jsx';
import Contact from '../features/static/pages/Contact.jsx';
import Faq from '../features/static/pages/Faq.jsx';
import Privacy from '../features/static/pages/Privacy.jsx';
import Terms from '../features/static/pages/Terms.jsx';
import ShippingReturns from '../features/static/pages/ShippingReturns.jsx';
import NotFound from '../features/static/pages/NotFound.jsx';

import CheckoutAddress from '../features/checkout/pages/CheckoutAddress.jsx';
import CheckoutPayment from '../features/checkout/pages/CheckoutPayment.jsx';
import CheckoutReview from '../features/checkout/pages/CheckoutReview.jsx';
import OrderConfirmation from '../features/checkout/pages/OrderConfirmation.jsx';

import AccountProfile from '../features/account/pages/AccountProfile.jsx';
import AccountOrders from '../features/account/pages/AccountOrders.jsx';
import AccountOrderDetail from '../features/account/pages/AccountOrderDetail.jsx';
import AccountAddresses from '../features/account/pages/AccountAddresses.jsx';
import AccountWishlist from '../features/account/pages/AccountWishlist.jsx';
import AccountPassword from '../features/account/pages/AccountPassword.jsx';
import AccountPreferences from '../features/account/pages/AccountPreferences.jsx';

import AdminLogin from '../admin/pages/AdminLogin.jsx';
import AdminDashboard from '../admin/pages/AdminDashboard.jsx';
import AdminProducts from '../admin/pages/AdminProducts.jsx';
import AdminProductNew from '../admin/pages/AdminProductNew.jsx';
import AdminProductEdit from '../admin/pages/AdminProductEdit.jsx';
import AdminCategories from '../admin/pages/AdminCategories.jsx';
import AdminInventory from '../admin/pages/AdminInventory.jsx';
import AdminOrders from '../admin/pages/AdminOrders.jsx';
import AdminOrderDetail from '../admin/pages/AdminOrderDetail.jsx';
import AdminCustomers from '../admin/pages/AdminCustomers.jsx';
import AdminCustomerDetail from '../admin/pages/AdminCustomerDetail.jsx';
import AdminReviews from '../admin/pages/AdminReviews.jsx';
import AdminCoupons from '../admin/pages/AdminCoupons.jsx';
import AdminSettings from '../admin/pages/AdminSettings.jsx';
import AdminReports from '../admin/pages/AdminReports.jsx';
import AdminUsers from '../admin/pages/AdminUsers.jsx';

import KitchenSink from './KitchenSink.jsx';
import KitchenSinkProducts from './KitchenSinkProducts.jsx';

const isDev = import.meta.env.DEV;

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
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:slug" element={<ShopPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="search" element={<Search />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<Wishlist />} />

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<Faq />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="shipping-returns" element={<ShippingReturns />} />

        <Route
          path="account"
          element={
            <RequireAuth>
              <AccountLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to={PATHS.account.profile} replace />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:id" element={<AccountOrderDetail />} />
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="wishlist" element={<AccountWishlist />} />
          <Route path="password" element={<AccountPassword />} />
          <Route path="preferences" element={<AccountPreferences />} />
        </Route>

        {isDev ? <Route path="_kitchen-sink" element={<KitchenSink />} /> : null}
        {isDev ? <Route path="_kitchen-sink/products" element={<KitchenSinkProducts />} /> : null}
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
        <Route path="address" element={<CheckoutAddress />} />
        <Route path="payment" element={<CheckoutPayment />} />
        <Route path="review" element={<CheckoutReview />} />
      </Route>

      <Route
        path="order"
        element={
          <AuthProvider>
            <CheckoutLayout />
          </AuthProvider>
        }
      >
        <Route path="confirmation/:id" element={<OrderConfirmation />} />
      </Route>

      <Route
        path="admin/login"
        element={
          <AdminAuthProvider>
            <AdminLogin />
          </AdminAuthProvider>
        }
      />
      <Route
        path="admin"
        element={
          <AdminAuthProvider>
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          </AdminAuthProvider>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductNew />} />
        <Route path="products/:id" element={<AdminProductEdit />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:id" element={<AdminCustomerDetail />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
