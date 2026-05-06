import { useCallback } from 'react';

import { useToast } from '../context/ToastContext.jsx';
import { getApiErrorMessage } from './useApiError.js';

/**
 * Map a normalized API error onto a react-hook-form instance.
 *
 * Usage:
 *   const onApiError = useApiFormError(methods);
 *   try { await api(...); } catch (err) { onApiError(err); }
 *
 * The error is expected to look like `{ message, errors, status }` where
 * `errors` is a flat object keyed by field name with either a string or an
 * array of strings as the value. When a field error is mapped onto the form,
 * the first invalid field is focused. When only a top-level `message` is
 * present (no field errors), the message is surfaced via the toast `error`
 * channel so the user sees something actionable.
 *
 * Returns the same error shape so callers can `return onApiError(err);` if
 * they want a value back.
 */
export default function useApiFormError(formMethods) {
  const toast = useToast();

  return useCallback(
    (error) => {
      if (!error || !formMethods) return error;

      const fieldErrors =
        error.errors && typeof error.errors === 'object' ? error.errors : null;

      let mapped = false;
      if (fieldErrors) {
        for (const key of Object.keys(fieldErrors)) {
          const raw = fieldErrors[key];
          const message = Array.isArray(raw) ? raw[0] : raw;
          if (!message) continue;
          formMethods.setError(
            key,
            { type: 'server', message: String(message) },
            { shouldFocus: !mapped },
          );
          mapped = true;
        }
      }

      if (!mapped) {
        const top = getApiErrorMessage(error);
        if (top) toast.error(top);
      } else if (typeof error.message === 'string' && error.message.trim()) {
        // We mapped field errors but the server also sent a top-level message;
        // show it as a toast so the user sees the full picture without losing
        // the per-field details.
        const top = getApiErrorMessage(error);
        if (top) toast.error(top);
      }

      return error;
    },
    [formMethods, toast],
  );
}
