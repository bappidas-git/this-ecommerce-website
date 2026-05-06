import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../routes/paths.js';
import { useToast } from './ToastContext.jsx';
import orderService from '../api/services/orderService.js';
import paymentService from '../api/services/paymentService.js';

const STORAGE_KEY = 'ti_checkout';
const LAST_ORDER_KEY = 'ti_last_order';
const TTL_MS = 24 * 60 * 60 * 1000;

const STEP_INDEX = Object.freeze({
  address: 1,
  payment: 2,
  review: 3,
});

const STEP_PATH = Object.freeze({
  1: PATHS.checkoutAddress,
  2: PATHS.checkoutPayment,
  3: PATHS.checkoutReview,
});

const INITIAL_STATE = Object.freeze({
  step: 1,
  address: null,
  billingAddress: null,
  billingSameAsShipping: true,
  payment: null,
  notes: '',
  couponCode: null,
  isPlacingOrder: false,
  error: null,
  allowGuest: true,
  savedAt: null,
});

const ACTIONS = Object.freeze({
  HYDRATE: 'HYDRATE',
  SET_ADDRESS: 'SET_ADDRESS',
  SET_BILLING: 'SET_BILLING',
  SET_BILLING_SAME: 'SET_BILLING_SAME',
  SET_PAYMENT: 'SET_PAYMENT',
  SET_NOTES: 'SET_NOTES',
  SET_COUPON: 'SET_COUPON',
  SET_STEP: 'SET_STEP',
  PLACING: 'PLACING',
  PLACED: 'PLACED',
  ERROR: 'ERROR',
  RESET: 'RESET',
});

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE:
      return { ...INITIAL_STATE, ...(action.payload || {}) };
    case ACTIONS.SET_ADDRESS:
      return { ...state, address: action.payload || null, error: null };
    case ACTIONS.SET_BILLING:
      return { ...state, billingAddress: action.payload || null };
    case ACTIONS.SET_BILLING_SAME:
      return { ...state, billingSameAsShipping: !!action.payload };
    case ACTIONS.SET_PAYMENT:
      return { ...state, payment: action.payload || null, error: null };
    case ACTIONS.SET_NOTES:
      return { ...state, notes: String(action.payload || '') };
    case ACTIONS.SET_COUPON:
      return { ...state, couponCode: action.payload || null };
    case ACTIONS.SET_STEP: {
      const next = Math.min(3, Math.max(1, Number(action.payload) || 1));
      return { ...state, step: next };
    }
    case ACTIONS.PLACING:
      return { ...state, isPlacingOrder: true, error: null };
    case ACTIONS.PLACED:
      return { ...state, isPlacingOrder: false, error: null };
    case ACTIONS.ERROR:
      return { ...state, isPlacingOrder: false, error: action.payload || null };
    case ACTIONS.RESET:
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

const REQUIRED_ADDRESS_FIELDS = ['phone', 'line1', 'city', 'country'];

function isFilled(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean(value);
}

function validateAddress(address) {
  if (!address || typeof address !== 'object') return false;
  const hasName =
    isFilled(address.fullName) ||
    isFilled(address.firstName) ||
    isFilled(address.lastName);
  if (!hasName) return false;
  return REQUIRED_ADDRESS_FIELDS.every((key) => isFilled(address[key]));
}

function validatePayment(payment) {
  if (!payment || typeof payment !== 'object') return false;
  if (!payment.method) return false;
  if (payment.method === 'card') {
    return Boolean(payment.brand && payment.last4);
  }
  return true;
}

function readPersisted() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.savedAt && Date.now() - parsed.savedAt > TTL_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePersisted(state) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      step: state.step,
      address: state.address,
      billingAddress: state.billingAddress,
      billingSameAsShipping: state.billingSameAsShipping,
      payment: state.payment,
      notes: state.notes,
      couponCode: state.couponCode,
      allowGuest: state.allowGuest,
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota/privacy errors */
  }
}

function clearPersisted() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function writeLastOrder(order) {
  if (typeof window === 'undefined' || !order || !order.id) return;
  try {
    window.sessionStorage.setItem(
      `${LAST_ORDER_KEY}_${order.id}`,
      JSON.stringify({ order, savedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

export function readLastOrder(id) {
  if (typeof window === 'undefined' || !id) return null;
  try {
    const raw = window.sessionStorage.getItem(`${LAST_ORDER_KEY}_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.savedAt && Date.now() - parsed.savedAt > TTL_MS) {
      window.sessionStorage.removeItem(`${LAST_ORDER_KEY}_${id}`);
      return null;
    }
    return parsed.order || null;
  } catch {
    return null;
  }
}

const CheckoutContext = createContext(null);

export function CheckoutProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const hydratedRef = useRef(false);
  const navigate = useNavigate();
  const { info } = useToast();

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const persisted = readPersisted();
    if (persisted) {
      dispatch({ type: ACTIONS.HYDRATE, payload: persisted });
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    writePersisted(state);
  }, [state]);

  const isAddressValid = useCallback(() => validateAddress(state.address), [state.address]);
  const isPaymentValid = useCallback(() => validatePayment(state.payment), [state.payment]);

  const setAddress = useCallback((address) => {
    dispatch({ type: ACTIONS.SET_ADDRESS, payload: address });
  }, []);

  const setBillingAddress = useCallback((address) => {
    dispatch({ type: ACTIONS.SET_BILLING, payload: address });
  }, []);

  const setBillingSameAsShipping = useCallback((flag) => {
    dispatch({ type: ACTIONS.SET_BILLING_SAME, payload: flag });
  }, []);

  const setPayment = useCallback((payment) => {
    dispatch({ type: ACTIONS.SET_PAYMENT, payload: payment });
  }, []);

  const setNotes = useCallback((notes) => {
    dispatch({ type: ACTIONS.SET_NOTES, payload: notes });
  }, []);

  const setCouponCode = useCallback((code) => {
    dispatch({ type: ACTIONS.SET_COUPON, payload: code });
  }, []);

  const goToStep = useCallback(
    (n) => {
      const target = Number(n);
      if (![1, 2, 3].includes(target)) return false;
      if (target >= 2 && !validateAddress(state.address)) {
        info('Please add a delivery address first.');
        dispatch({ type: ACTIONS.SET_STEP, payload: 1 });
        navigate(PATHS.checkoutAddress);
        return false;
      }
      if (target >= 3 && !validatePayment(state.payment)) {
        info('Please choose a payment method.');
        dispatch({ type: ACTIONS.SET_STEP, payload: 2 });
        navigate(PATHS.checkoutPayment);
        return false;
      }
      dispatch({ type: ACTIONS.SET_STEP, payload: target });
      navigate(STEP_PATH[target]);
      return true;
    },
    [state.address, state.payment, info, navigate],
  );

  const goNext = useCallback(() => {
    const next = Math.min(3, state.step + 1);
    return goToStep(next);
  }, [state.step, goToStep]);

  const goPrev = useCallback(() => {
    const prev = Math.max(1, state.step - 1);
    dispatch({ type: ACTIONS.SET_STEP, payload: prev });
    navigate(STEP_PATH[prev]);
    return true;
  }, [state.step, navigate]);

  const setStepFromPath = useCallback((step) => {
    dispatch({ type: ACTIONS.SET_STEP, payload: step });
  }, []);

  const placeOrder = useCallback(
    async ({ cartState, clearCart } = {}) => {
      if (!validateAddress(state.address) || !validatePayment(state.payment)) {
        const message = 'Please complete all checkout steps.';
        dispatch({ type: ACTIONS.ERROR, payload: message });
        throw new Error(message);
      }
      if (!cartState || !Array.isArray(cartState.items) || cartState.items.length === 0) {
        const message = 'Your bag is empty.';
        dispatch({ type: ACTIONS.ERROR, payload: message });
        throw new Error(message);
      }

      dispatch({ type: ACTIONS.PLACING });

      try {
        const currency = cartState.items[0]?.currency || 'AED';

        // 1) Process payment first when card — fail loudly on rejection so we
        // never create an order without funds.
        if (state.payment.method === 'card') {
          const paymentResult = await paymentService.processPayment({
            method: 'card',
            brand: state.payment.brand,
            last4: state.payment.last4,
            cardName: state.payment.cardName,
            expiry: state.payment.expiry,
            amount: cartState.total,
            currency,
          });
          if (!paymentResult || paymentResult.ok === false) {
            const message =
              paymentResult?.message ||
              'Your card was declined. Try a different card or method.';
            throw new Error(message);
          }
        }

        // 2) Create the order
        const order = await orderService.create({
          items: cartState.items.map((it) => ({
            productId: it.productId,
            quantity: it.qty,
          })),
          shippingAddress: state.address,
          billingAddress: state.billingSameAsShipping ? null : state.billingAddress,
          paymentMethod: state.payment.method,
          paymentStatus: state.payment.paymentStatus || null,
          notes: state.notes ? [{ body: state.notes, source: 'customer' }] : [],
          couponCode: cartState.couponCode || state.couponCode || null,
        });

        // 3) Cache for refresh + guest fallback on the confirmation page
        writeLastOrder(order);

        // 4) Clear cart + checkout state, then navigate (replace history so
        // Back doesn't return to the review page after success).
        if (typeof clearCart === 'function') clearCart();
        clearPersisted();
        dispatch({ type: ACTIONS.RESET });

        const orderId = order?.id ?? order?.number;
        if (orderId != null) {
          navigate(PATHS.orderConfirmation(orderId), { replace: true });
        }

        return order;
      } catch (err) {
        const message =
          err?.message || 'Could not place your order. Please try again.';
        dispatch({ type: ACTIONS.ERROR, payload: message });
        throw err;
      }
    },
    [
      state.address,
      state.billingAddress,
      state.billingSameAsShipping,
      state.payment,
      state.notes,
      state.couponCode,
      navigate,
    ],
  );

  const reset = useCallback(() => {
    clearPersisted();
    dispatch({ type: ACTIONS.RESET });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAddressValid,
      isPaymentValid,
      setAddress,
      setBillingAddress,
      setBillingSameAsShipping,
      setPayment,
      setNotes,
      setCouponCode,
      goNext,
      goPrev,
      goToStep,
      setStepFromPath,
      placeOrder,
      reset,
    }),
    [
      state,
      isAddressValid,
      isPaymentValid,
      setAddress,
      setBillingAddress,
      setBillingSameAsShipping,
      setPayment,
      setNotes,
      setCouponCode,
      goNext,
      goPrev,
      goToStep,
      setStepFromPath,
      placeOrder,
      reset,
    ],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used inside <CheckoutProvider>');
  return ctx;
}

export {
  CheckoutContext,
  STEP_INDEX,
  STEP_PATH,
  validateAddress,
  validatePayment,
};
export default CheckoutContext;
