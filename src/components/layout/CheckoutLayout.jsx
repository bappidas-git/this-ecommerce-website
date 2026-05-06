import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock as LockIcon } from 'lucide-react';
import { CartProvider, useCart } from '../../context/CartContext.jsx';
import {
  CheckoutProvider,
  useCheckout,
} from '../../context/CheckoutContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import StepperBar from '../../features/checkout/components/StepperBar.jsx';
import OrderSummaryAside from '../../features/checkout/components/OrderSummaryAside.jsx';
import MobileOrderBar from '../../features/checkout/components/MobileOrderBar.jsx';
import { PATHS } from '../../routes/paths.js';
import styles from './CheckoutLayout.module.css';

function pathToStep(pathname) {
  if (pathname.includes('/payment')) return 2;
  if (pathname.includes('/review')) return 3;
  return 1;
}

function CheckoutGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useCart();
  const { isAddressValid, isPaymentValid, setStepFromPath, allowGuest } = useCheckout();
  const { info } = useToast();

  const isConfirmation = location.pathname.includes('/confirmation');

  useEffect(() => {
    if (!state.isHydrated) return;
    if (isConfirmation) return;
    if (state.items.length === 0) {
      navigate(PATHS.cart, { replace: true });
    }
  }, [state.isHydrated, state.items.length, isConfirmation, navigate]);

  useEffect(() => {
    if (isConfirmation) return;
    const step = pathToStep(location.pathname);
    setStepFromPath(step);
    if (step >= 2 && !isAddressValid()) {
      info('Please add a delivery address first.');
      navigate(PATHS.checkoutAddress, { replace: true });
      return;
    }
    if (step >= 3 && !isPaymentValid()) {
      info('Please choose a payment method.');
      navigate(PATHS.checkoutPayment, { replace: true });
    }
  }, [
    location.pathname,
    isConfirmation,
    isAddressValid,
    isPaymentValid,
    setStepFromPath,
    info,
    navigate,
  ]);

  useEffect(() => {
    if (!allowGuest) {
      navigate(PATHS.auth.login, {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [allowGuest, location.pathname, navigate]);

  return null;
}

function CheckoutBody() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const isConfirmation = location.pathname.includes('/confirmation');

  return (
    <>
      {!isConfirmation ? <StepperBar /> : null}
      <div className={styles.container}>
        <div className={styles.grid}>
          <motion.section
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.6, 0.2, 1] }}
            className={styles.mainCol}
          >
            <Outlet />
          </motion.section>
          {!isConfirmation ? (
            <div className={styles.summaryColumn}>
              <OrderSummaryAside />
            </div>
          ) : null}
        </div>
      </div>
      {!isConfirmation ? <MobileOrderBar /> : null}
    </>
  );
}

function CheckoutLayoutInner() {
  return (
    <div className={styles.shell}>
      <header className={styles.header} role="banner">
        <div className={styles.headerInner}>
          <Link to={PATHS.home} className={styles.brand} aria-label="THIS Interiors home">
            THIS Interiors
          </Link>
          <span className={styles.secure} aria-label="Secure checkout">
            <LockIcon size={14} aria-hidden className={styles.lockIcon} />
            Secure checkout
          </span>
          <Link to={PATHS.cart} className={styles.back}>
            Continue shopping
          </Link>
        </div>
      </header>

      <CheckoutGuard />

      <main id="main" className={styles.main}>
        <CheckoutBody />
      </main>

      <footer className={styles.footer} role="contentinfo">
        <span>Encrypted checkout</span>
        <span className={styles.dot} aria-hidden>
          &middot;
        </span>
        <span>
          Need help?{' '}
          <a href="mailto:contact@thisinteriors.com" className={styles.footerLink}>
            contact@thisinteriors.com
          </a>
        </span>
      </footer>
    </div>
  );
}

function CheckoutLayout() {
  return (
    <CartProvider>
      <CheckoutProvider>
        <CheckoutLayoutInner />
      </CheckoutProvider>
    </CartProvider>
  );
}

export default CheckoutLayout;
