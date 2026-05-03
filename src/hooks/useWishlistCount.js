import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext.jsx';

export function useWishlistCount() {
  const ctx = useContext(WishlistContext);
  return ctx?.count ?? 0;
}

export default useWishlistCount;
