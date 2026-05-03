import { useWishlistContext } from '../context/WishlistContext.jsx';

export function useWishlist() {
  const ctx = useWishlistContext();
  return {
    productIds: ctx.productIds,
    isHydrated: ctx.isHydrated,
    isSyncing: ctx.isSyncing,
    isWishlisted: ctx.isWishlisted,
    toggle: ctx.toggle,
    add: ctx.add,
    remove: ctx.remove,
    clear: ctx.clear,
    count: ctx.count,
  };
}

export default useWishlist;
