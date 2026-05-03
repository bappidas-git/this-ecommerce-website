import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { couponService } from '../api/services/couponService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useSettings } from '../hooks/useSettings.js';
import { getApiErrorMessage } from '../hooks/useApiError.js';

const GUEST_KEY = 'ti_cart_guest';
const userKeyFor = (id) => `ti_cart_user_${id}`;

const hasWindow = typeof window !== 'undefined';

const INITIAL_STATE = Object.freeze({
  items: [],
  couponCode: null,
  couponType: null,
  couponValue: 0,
  discount: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
  lastUpdatedAt: null,
  isHydrated: false,
});

const ACTIONS = Object.freeze({
  HYDRATE: 'HYDRATE',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_QTY: 'UPDATE_QTY',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR: 'CLEAR',
  APPLY_COUPON: 'APPLY_COUPON',
  CLEAR_COUPON: 'CLEAR_COUPON',
  MERGE_GUEST: 'MERGE_GUEST',
  RECONCILE_STOCK: 'RECONCILE_STOCK',
});

function clampQty(qty, stock) {
  const desired = Math.max(1, Math.floor(Number(qty) || 0));
  if (typeof stock === 'number' && stock >= 0) {
    return Math.min(desired, stock);
  }
  return desired;
}

function normaliseItem(input) {
  if (!input) return null;
  const productId = input.productId ?? input.id;
  if (productId === undefined || productId === null) return null;
  return {
    productId,
    slug: input.slug || '',
    name: input.name || '',
    image: input.image || (Array.isArray(input.images) ? input.images[0] : '') || '',
    price: Number(input.price) || 0,
    compareAtPrice:
      typeof input.compareAtPrice === 'number' ? input.compareAtPrice : null,
    currency: input.currency || 'AED',
    qty: Math.max(1, Math.floor(Number(input.qty) || 1)),
    stock: typeof input.stock === 'number' ? input.stock : null,
  };
}

function computeTotals(state, settings) {
  const items = Array.isArray(state.items) ? state.items : [];
  const subtotal = items.reduce(
    (sum, line) => sum + (Number(line.price) || 0) * (Number(line.qty) || 0),
    0,
  );

  let discount = 0;
  if (state.couponCode && state.couponType) {
    const value = Number(state.couponValue) || 0;
    if (state.couponType === 'percent') {
      discount = Math.min(subtotal, (subtotal * value) / 100);
    } else if (state.couponType === 'fixed') {
      discount = Math.min(subtotal, value);
    }
  }

  const taxableBase = Math.max(0, subtotal - discount);
  const taxRate = Number(settings?.tax?.rate) || 0;
  const tax = +(taxableBase * taxRate).toFixed(2);
  const total = +(taxableBase + tax).toFixed(2);

  return {
    ...state,
    subtotal: +subtotal.toFixed(2),
    discount: +discount.toFixed(2),
    tax,
    total,
  };
}

function dedupeAndCap(items) {
  const map = new Map();
  for (const raw of items) {
    const item = normaliseItem(raw);
    if (!item) continue;
    const existing = map.get(item.productId);
    if (existing) {
      const merged = {
        ...existing,
        qty: clampQty(existing.qty + item.qty, item.stock ?? existing.stock),
        stock: item.stock ?? existing.stock,
      };
      map.set(item.productId, merged);
    } else {
      map.set(item.productId, { ...item, qty: clampQty(item.qty, item.stock) });
    }
  }
  return Array.from(map.values());
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE: {
      const persisted = action.payload || {};
      return {
        ...INITIAL_STATE,
        ...persisted,
        items: Array.isArray(persisted.items)
          ? persisted.items.map(normaliseItem).filter(Boolean)
          : [],
        isHydrated: true,
        lastUpdatedAt: persisted.lastUpdatedAt || null,
      };
    }

    case ACTIONS.ADD_ITEM: {
      const incoming = normaliseItem(action.payload);
      if (!incoming) return state;
      const idx = state.items.findIndex((it) => it.productId === incoming.productId);
      let items;
      if (idx >= 0) {
        const existing = state.items[idx];
        const stock = incoming.stock ?? existing.stock;
        const nextQty = clampQty(existing.qty + incoming.qty, stock);
        items = state.items.map((it, i) =>
          i === idx ? { ...existing, ...incoming, qty: nextQty, stock } : it,
        );
      } else {
        items = [
          ...state.items,
          { ...incoming, qty: clampQty(incoming.qty, incoming.stock) },
        ];
      }
      return { ...state, items, lastUpdatedAt: Date.now() };
    }

    case ACTIONS.UPDATE_QTY: {
      const { productId, qty } = action.payload;
      const items = state.items
        .map((it) => {
          if (it.productId !== productId) return it;
          const nextQty = Math.max(0, Math.floor(Number(qty) || 0));
          if (nextQty <= 0) return null;
          return { ...it, qty: clampQty(nextQty, it.stock) };
        })
        .filter(Boolean);
      return { ...state, items, lastUpdatedAt: Date.now() };
    }

    case ACTIONS.REMOVE_ITEM: {
      const { productId } = action.payload;
      const items = state.items.filter((it) => it.productId !== productId);
      return { ...state, items, lastUpdatedAt: Date.now() };
    }

    case ACTIONS.CLEAR: {
      return {
        ...INITIAL_STATE,
        isHydrated: state.isHydrated,
        lastUpdatedAt: Date.now(),
      };
    }

    case ACTIONS.APPLY_COUPON: {
      const { code, type, value } = action.payload;
      return {
        ...state,
        couponCode: code,
        couponType: type,
        couponValue: Number(value) || 0,
        lastUpdatedAt: Date.now(),
      };
    }

    case ACTIONS.CLEAR_COUPON: {
      return {
        ...state,
        couponCode: null,
        couponType: null,
        couponValue: 0,
        discount: 0,
        lastUpdatedAt: Date.now(),
      };
    }

    case ACTIONS.MERGE_GUEST: {
      const guestItems = Array.isArray(action.payload?.items) ? action.payload.items : [];
      const merged = dedupeAndCap([...state.items, ...guestItems]);
      const guestCoupon = action.payload?.couponCode && !state.couponCode
        ? {
            couponCode: action.payload.couponCode,
            couponType: action.payload.couponType || null,
            couponValue: action.payload.couponValue || 0,
          }
        : {};
      return {
        ...state,
        items: merged,
        ...guestCoupon,
        lastUpdatedAt: Date.now(),
      };
    }

    case ACTIONS.RECONCILE_STOCK: {
      const updates = action.payload || {};
      const items = state.items
        .map((it) => {
          const nextStock = updates[it.productId];
          if (typeof nextStock !== 'number') return it;
          if (nextStock <= 0) return null;
          if (it.qty > nextStock) {
            return { ...it, stock: nextStock, qty: nextStock };
          }
          return { ...it, stock: nextStock };
        })
        .filter(Boolean);
      return { ...state, items, lastUpdatedAt: Date.now() };
    }

    default:
      return state;
  }
}

function readPersisted(key) {
  if (!hasWindow || !key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writePersisted(key, state) {
  if (!hasWindow || !key) return;
  try {
    const payload = {
      items: state.items,
      couponCode: state.couponCode,
      couponType: state.couponType,
      couponValue: state.couponValue,
      lastUpdatedAt: state.lastUpdatedAt,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* quota or privacy mode — ignore */
  }
}

function removePersisted(key) {
  if (!hasWindow || !key) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { data: settings } = useSettings();
  const { success, error: toastError, warning } = useToast();

  const [rawState, dispatch] = useReducer(reducer, INITIAL_STATE);
  const state = useMemo(() => computeTotals(rawState, settings), [rawState, settings]);

  const storageKey = useMemo(() => {
    if (isAuthenticated && user?.id != null) return userKeyFor(user.id);
    return GUEST_KEY;
  }, [isAuthenticated, user?.id]);

  const lastKeyRef = useRef(null);

  // Hydrate when storage key changes (initial mount + auth transitions)
  useEffect(() => {
    if (lastKeyRef.current === storageKey) return;
    lastKeyRef.current = storageKey;
    const persisted = readPersisted(storageKey);
    dispatch({ type: ACTIONS.HYDRATE, payload: persisted || {} });
  }, [storageKey]);

  // Persist after every change (once hydrated)
  useEffect(() => {
    if (!rawState.isHydrated) return;
    writePersisted(storageKey, rawState);
  }, [rawState, storageKey]);

  // Auth login: merge guest cart into user cart, then drop the guest key
  useEffect(() => {
    if (!hasWindow) return undefined;
    function onAuthLogin() {
      const guest = readPersisted(GUEST_KEY);
      if (guest && Array.isArray(guest.items) && guest.items.length > 0) {
        dispatch({ type: ACTIONS.MERGE_GUEST, payload: guest });
      }
      removePersisted(GUEST_KEY);
    }
    function onAuthLogout() {
      // Reset in-memory state; user cart stays under its own key for next login.
      dispatch({ type: ACTIONS.CLEAR });
    }
    window.addEventListener('ti:auth-login', onAuthLogin);
    window.addEventListener('ti:auth-logout', onAuthLogout);
    return () => {
      window.removeEventListener('ti:auth-login', onAuthLogin);
      window.removeEventListener('ti:auth-logout', onAuthLogout);
    };
  }, []);

  const addItem = useCallback(
    (product, qty = 1) => {
      const normalized = normaliseItem({ ...product, qty });
      if (!normalized) return;
      const stock = normalized.stock;
      const desired = Math.max(1, Math.floor(Number(qty) || 1));
      const existing = rawState.items.find((it) => it.productId === normalized.productId);
      const projected = (existing?.qty || 0) + desired;
      if (typeof stock === 'number' && projected > stock) {
        const remaining = Math.max(0, stock - (existing?.qty || 0));
        if (remaining <= 0) {
          warning(`Only ${stock} available`);
          return;
        }
        normalized.qty = remaining;
        warning(`Only ${stock} available`);
      } else {
        normalized.qty = desired;
      }
      dispatch({ type: ACTIONS.ADD_ITEM, payload: normalized });
      if (hasWindow) {
        window.dispatchEvent(
          new CustomEvent('ti:cart-add', { detail: normalized }),
        );
      }
    },
    [rawState.items, warning],
  );

  const updateQty = useCallback(
    (productId, qty) => {
      const item = rawState.items.find((it) => it.productId === productId);
      if (!item) return;
      const desired = Math.max(0, Math.floor(Number(qty) || 0));
      if (typeof item.stock === 'number' && desired > item.stock) {
        warning(`Only ${item.stock} available`);
        return;
      }
      dispatch({ type: ACTIONS.UPDATE_QTY, payload: { productId, qty: desired } });
    },
    [rawState.items, warning],
  );

  const removeItem = useCallback((productId) => {
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: { productId } });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR });
  }, []);

  const applyCoupon = useCallback(
    async (code) => {
      const trimmed = String(code || '').trim();
      if (!trimmed) return null;
      try {
        const result = await couponService.validate(trimmed, state.subtotal);
        const data = result?.data || result || {};
        dispatch({
          type: ACTIONS.APPLY_COUPON,
          payload: {
            code: data.code || trimmed,
            type: data.type || data.discountType || 'fixed',
            value: data.value ?? data.amount ?? data.discountValue ?? 0,
          },
        });
        success(data.message || `Coupon ${trimmed} applied`);
        return data;
      } catch (err) {
        toastError(getApiErrorMessage(err) || 'Coupon could not be applied');
        return null;
      }
    },
    [state.subtotal, success, toastError],
  );

  const clearCoupon = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_COUPON });
  }, []);

  const setCoupon = useCallback(({ code, type, value } = {}) => {
    if (!code) return;
    dispatch({
      type: ACTIONS.APPLY_COUPON,
      payload: { code, type: type || 'fixed', value: Number(value) || 0 },
    });
  }, []);

  const reconcileStock = useCallback(
    (updates) => {
      if (!updates) return;
      const before = rawState.items.reduce(
        (acc, it) => ({ ...acc, [it.productId]: it.qty }),
        {},
      );
      dispatch({ type: ACTIONS.RECONCILE_STOCK, payload: updates });
      const adjusted = Object.entries(updates).some(([id, stock]) => {
        const prev = before[id];
        return typeof prev === 'number' && typeof stock === 'number' && prev > stock;
      });
      if (adjusted) {
        warning('Quantity adjusted to available stock');
      }
    },
    [rawState.items, warning],
  );

  const isInCart = useCallback(
    (productId) => state.items.some((it) => it.productId === productId),
    [state.items],
  );

  const getQty = useCallback(
    (productId) => {
      const item = state.items.find((it) => it.productId === productId);
      return item?.qty || 0;
    },
    [state.items],
  );

  const itemCount = useMemo(
    () => state.items.reduce((n, it) => n + (Number(it.qty) || 0), 0),
    [state.items],
  );

  const value = useMemo(
    () => ({
      state,
      addItem,
      updateQty,
      removeItem,
      clear,
      applyCoupon,
      clearCoupon,
      setCoupon,
      reconcileStock,
      isInCart,
      getQty,
      itemCount,
    }),
    [
      state,
      addItem,
      updateQty,
      removeItem,
      clear,
      applyCoupon,
      clearCoupon,
      setCoupon,
      reconcileStock,
      isInCart,
      getQty,
      itemCount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export { CartContext, ACTIONS as CART_ACTIONS, computeTotals };
export default CartContext;
