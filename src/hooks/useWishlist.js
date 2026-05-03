import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import wishlistService from '../api/services/wishlistService.js';

export function useWishlist() {
  const { enqueueSnackbar } = useSnackbar();

  const add = useCallback(
    async (product) => {
      const productId = product?.productId ?? product?.id;
      if (productId === undefined || productId === null) return null;
      try {
        const result = await wishlistService.toggle(productId);
        enqueueSnackbar('Saved to wishlist', { variant: 'success' });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('ti:wishlist-add', { detail: { productId } }),
          );
        }
        return result;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Could not save to wishlist';
        enqueueSnackbar(message, { variant: 'error' });
        return null;
      }
    },
    [enqueueSnackbar],
  );

  const remove = useCallback(
    async (productId) => {
      if (productId === undefined || productId === null) return null;
      try {
        const result = await wishlistService.toggle(productId);
        return result;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Could not remove from wishlist';
        enqueueSnackbar(message, { variant: 'error' });
        return null;
      }
    },
    [enqueueSnackbar],
  );

  return { add, remove };
}

export default useWishlist;
