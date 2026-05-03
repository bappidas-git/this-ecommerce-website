import { useContext } from 'react';
import CartContext from '../context/CartContext.jsx';

export function useCartCount() {
  const ctx = useContext(CartContext);
  return ctx?.itemCount ?? 0;
}

export default useCartCount;
