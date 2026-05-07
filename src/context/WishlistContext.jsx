import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import wishlistService from '../api/services/wishlistService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { getApiErrorMessage } from '../hooks/useApiError.js';

const GUEST_KEY = 'ti_wishlist_guest';
const userKeyFor = (id) => `ti_wishlist_user_${id}`;

const hasWindow = typeof window !== 'undefined';

const INITIAL_STATE = Object.freeze({
  productIds: [],
  isHydrated: false,
  isSyncing: false,
});

const ACTIONS = Object.freeze({
  HYDRATE: 'HYDRATE',
  TOGGLE: 'TOGGLE',
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  CLEAR: 'CLEAR',
  MERGE_GUEST: 'MERGE_GUEST',
  SET_SYNCING: 'SET_SYNCING',
  REPLACE: 'REPLACE',
});

const toId = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
};

const dedupe = (ids) => {
  const seen = new Set();
  const out = [];
  for (const raw of ids || []) {
    const id = toId(raw);
    if (id === null) continue;
    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(id);
  }
  return out;
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE: {
      const persisted = action.payload || {};
      return {
        ...INITIAL_STATE,
        productIds: dedupe(persisted.productIds),
        isHydrated: true,
      };
    }

    case ACTIONS.REPLACE: {
      return {
        ...state,
        productIds: dedupe(action.payload),
      };
    }

    case ACTIONS.TOGGLE: {
      const id = toId(action.payload);
      if (id === null) return state;
      const exists = state.productIds.some((pid) => String(pid) === String(id));
      const productIds = exists
        ? state.productIds.filter((pid) => String(pid) !== String(id))
        : [...state.productIds, id];
      return { ...state, productIds };
    }

    case ACTIONS.ADD: {
      const id = toId(action.payload);
      if (id === null) return state;
      if (state.productIds.some((pid) => String(pid) === String(id))) return state;
      return { ...state, productIds: [...state.productIds, id] };
    }

    case ACTIONS.REMOVE: {
      const id = toId(action.payload);
      if (id === null) return state;
      return {
        ...state,
        productIds: state.productIds.filter((pid) => String(pid) !== String(id)),
      };
    }

    case ACTIONS.CLEAR: {
      return { ...state, productIds: [] };
    }

    case ACTIONS.MERGE_GUEST: {
      const guestIds = Array.isArray(action.payload?.productIds)
        ? action.payload.productIds
        : [];
      return {
        ...state,
        productIds: dedupe([...state.productIds, ...guestIds]),
      };
    }

    case ACTIONS.SET_SYNCING: {
      return { ...state, isSyncing: Boolean(action.payload) };
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
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersisted(key, state) {
  if (!hasWindow || !key) return;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ productIds: state.productIds }),
    );
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

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { error: toastError } = useToast();

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const storageKey = useMemo(() => {
    if (isAuthenticated && user?.id != null) return userKeyFor(user.id);
    return GUEST_KEY;
  }, [isAuthenticated, user?.id]);

  const lastKeyRef = useRef(null);
  const liveRegionRef = useRef(null);

  // Hydrate when storage key changes (initial mount + auth transitions)
  useEffect(() => {
    if (lastKeyRef.current === storageKey) return;
    lastKeyRef.current = storageKey;
    const persisted = readPersisted(storageKey);
    dispatch({ type: ACTIONS.HYDRATE, payload: persisted || {} });
  }, [storageKey]);

  // Persist after every change (once hydrated)
  useEffect(() => {
    if (!state.isHydrated) return;
    writePersisted(storageKey, state);
  }, [state, storageKey]);

  const fetchAndReplace = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch({ type: ACTIONS.SET_SYNCING, payload: true });
    try {
      const data = await wishlistService.get();
      const ids = Array.isArray(data)
        ? data.map((entry) => entry?.productId ?? entry?.product_id ?? entry?.id)
        : Array.isArray(data?.productIds)
          ? data.productIds
          : [];
      dispatch({ type: ACTIONS.REPLACE, payload: ids });
    } catch {
      /* swallow — keep local state */
    } finally {
      dispatch({ type: ACTIONS.SET_SYNCING, payload: false });
    }
  }, [isAuthenticated]);

  // Login: merge guest list into user list, drop guest key, then refetch from server
  useEffect(() => {
    if (!hasWindow) return undefined;
    function onAuthLogin() {
      const guest = readPersisted(GUEST_KEY);
      if (guest && Array.isArray(guest.productIds) && guest.productIds.length > 0) {
        dispatch({ type: ACTIONS.MERGE_GUEST, payload: guest });
      }
      removePersisted(GUEST_KEY);
      fetchAndReplace();
    }
    function onAuthLogout() {
      dispatch({ type: ACTIONS.CLEAR });
    }
    window.addEventListener('ti:auth-login', onAuthLogin);
    window.addEventListener('ti:auth-logout', onAuthLogout);
    return () => {
      window.removeEventListener('ti:auth-login', onAuthLogin);
      window.removeEventListener('ti:auth-logout', onAuthLogout);
    };
  }, [fetchAndReplace]);

  // Initial server fetch when first authenticated
  const didFetchForUserRef = useRef(null);
  useEffect(() => {
    if (!isAuthenticated || user?.id == null) {
      didFetchForUserRef.current = null;
      return;
    }
    if (didFetchForUserRef.current === user.id) return;
    didFetchForUserRef.current = user.id;
    fetchAndReplace();
  }, [isAuthenticated, user?.id, fetchAndReplace]);

  const announce = useCallback((message) => {
    if (!message) return;
    if (typeof document === 'undefined') return;
    let region = liveRegionRef.current;
    if (!region) {
      region = document.getElementById('ti-wishlist-live');
      if (!region) {
        region = document.createElement('div');
        region.id = 'ti-wishlist-live';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.style.position = 'absolute';
        region.style.width = '1px';
        region.style.height = '1px';
        region.style.padding = '0';
        region.style.margin = '-1px';
        region.style.overflow = 'hidden';
        region.style.clip = 'rect(0, 0, 0, 0)';
        region.style.whiteSpace = 'nowrap';
        region.style.border = '0';
        document.body.appendChild(region);
      }
      liveRegionRef.current = region;
    }
    region.textContent = '';
    window.requestAnimationFrame(() => {
      if (region) region.textContent = message;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId) => {
      const id = toId(productId);
      if (id === null) return false;
      return state.productIds.some((pid) => String(pid) === String(id));
    },
    [state.productIds],
  );

  const toggle = useCallback(
    async (product) => {
      const id = toId(product?.productId ?? product?.id ?? product);
      if (id === null) return;

      const wasOn = state.productIds.some((pid) => String(pid) === String(id));
      // Optimistic update
      dispatch({ type: ACTIONS.TOGGLE, payload: id });
      announce(wasOn ? 'Removed from wishlist' : 'Saved to wishlist');

      if (hasWindow) {
        window.dispatchEvent(
          new CustomEvent(wasOn ? 'ti:wishlist-remove' : 'ti:wishlist-add', {
            detail: { productId: id },
          }),
        );
      }

      if (!isAuthenticated) return;

      try {
        await wishlistService.toggle(id);
      } catch (err) {
        // Revert
        dispatch({ type: ACTIONS.TOGGLE, payload: id });
        announce(wasOn ? 'Save failed — restored to wishlist' : 'Could not save to wishlist');
        toastError(getApiErrorMessage(err) || "Couldn't update — please try again.");
      }
    },
    [state.productIds, isAuthenticated, toastError, announce],
  );

  const add = useCallback(
    async (product) => {
      const id = toId(product?.productId ?? product?.id ?? product);
      if (id === null) return;
      if (state.productIds.some((pid) => String(pid) === String(id))) return;
      dispatch({ type: ACTIONS.ADD, payload: id });
      announce('Saved to wishlist');
      if (hasWindow) {
        window.dispatchEvent(
          new CustomEvent('ti:wishlist-add', { detail: { productId: id } }),
        );
      }
      if (!isAuthenticated) return;
      try {
        await wishlistService.toggle(id);
      } catch (err) {
        dispatch({ type: ACTIONS.REMOVE, payload: id });
        toastError(getApiErrorMessage(err) || 'Could not save to wishlist');
      }
    },
    [state.productIds, isAuthenticated, toastError, announce],
  );

  const remove = useCallback(
    async (productId) => {
      const id = toId(productId);
      if (id === null) return;
      const wasOn = state.productIds.some((pid) => String(pid) === String(id));
      if (!wasOn) return;
      dispatch({ type: ACTIONS.REMOVE, payload: id });
      announce('Removed from wishlist');
      if (hasWindow) {
        window.dispatchEvent(
          new CustomEvent('ti:wishlist-remove', { detail: { productId: id } }),
        );
      }
      if (!isAuthenticated) return;
      try {
        await wishlistService.toggle(id);
      } catch (err) {
        dispatch({ type: ACTIONS.ADD, payload: id });
        toastError(getApiErrorMessage(err) || 'Could not remove from wishlist');
      }
    },
    [state.productIds, isAuthenticated, toastError, announce],
  );

  const clear = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR });
    announce('Wishlist cleared');
  }, [announce]);

  const count = state.productIds.length;

  const value = useMemo(
    () => ({
      productIds: state.productIds,
      isHydrated: state.isHydrated,
      isSyncing: state.isSyncing,
      isWishlisted,
      toggle,
      add,
      remove,
      clear,
      count,
    }),
    [
      state.productIds,
      state.isHydrated,
      state.isSyncing,
      isWishlisted,
      toggle,
      add,
      remove,
      clear,
      count,
    ],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlistContext must be used inside <WishlistProvider>');
  }
  return ctx;
}

export { WishlistContext, ACTIONS as WISHLIST_ACTIONS };
export default WishlistContext;
