import { useEffect } from 'react';

/**
 * Focus the first invalid field on every submit failure.
 *
 * Pass the full react-hook-form `methods` (or a subset containing `formState`
 * and `setFocus`). On each `submitCount` change, we walk the registered field
 * order and call `setFocus` on the first key that has an error. Nested errors
 * (e.g. `address.city`) are flattened to dotted paths.
 *
 * Pass an explicit `order` array if you want submit-time focus to follow a
 * different order than React's discovery order.
 */
export default function useFocusFirstInvalid(formMethods, order) {
  const submitCount = formMethods?.formState?.submitCount;
  const errors = formMethods?.formState?.errors;
  const setFocus = formMethods?.setFocus;

  useEffect(() => {
    if (!submitCount || !setFocus || !errors) return;

    const keys = order && order.length > 0 ? order : flattenErrorKeys(errors);
    const firstInvalid = keys.find((key) => hasErrorAtPath(errors, key));
    if (!firstInvalid) return;

    try {
      setFocus(firstInvalid, { shouldSelect: false });
    } catch {
      /* setFocus throws if the field isn't registered yet — ignore. */
    }
  }, [submitCount, errors, setFocus, order]);
}

function hasErrorAtPath(errors, path) {
  if (!errors) return false;
  const parts = String(path).split('.');
  let cursor = errors;
  for (const part of parts) {
    if (!cursor || typeof cursor !== 'object') return false;
    cursor = cursor[part];
  }
  return Boolean(cursor);
}

function flattenErrorKeys(errors, prefix = '') {
  if (!errors || typeof errors !== 'object') return [];
  const keys = [];
  for (const key of Object.keys(errors)) {
    const value = errors[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && value.message) {
      keys.push(path);
    } else if (value && typeof value === 'object') {
      keys.push(...flattenErrorKeys(value, path));
    }
  }
  return keys;
}
