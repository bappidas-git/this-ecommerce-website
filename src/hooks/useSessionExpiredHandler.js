import { useEffect } from 'react';
import { queueToast } from '../utils/toastQueue.js';

const STOREFRONT_EVENT = 'ti:auth-expired';
const ADMIN_EVENT = 'ti:admin-auth-expired';

const STOREFRONT_MESSAGE = 'Your session has ended — please sign in again.';
const ADMIN_MESSAGE = 'Your admin session has ended — please sign in again.';

function callIfFn(fn) {
  if (typeof fn === 'function') {
    try {
      const out = fn();
      if (out && typeof out.catch === 'function') out.catch(() => {});
    } catch {
      /* swallow — clearing local state shouldn't throw */
    }
  }
}

/**
 * Subscribe to session-expiry events and handle them quietly.
 *
 * - `scope: 'storefront'` (default) listens to `ti:auth-expired`.
 * - `scope: 'admin'` listens to `ti:admin-auth-expired` only.
 *
 * Pass a `logout` callback to silently clear local auth state.
 */
export default function useSessionExpiredHandler({
  scope = 'storefront',
  logout,
} = {}) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const eventName = scope === 'admin' ? ADMIN_EVENT : STOREFRONT_EVENT;
    const message = scope === 'admin' ? ADMIN_MESSAGE : STOREFRONT_MESSAGE;

    function handle() {
      queueToast({ variant: 'info', message });
      callIfFn(logout);
    }

    window.addEventListener(eventName, handle);
    return () => window.removeEventListener(eventName, handle);
  }, [scope, logout]);
}
