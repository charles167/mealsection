import { useCartContext } from "../context/CartContext";

const useCart = () => {
  const { cart, addToCart, removeFromCart } = useCartContext();
  return { cart, addToCart, removeFromCart };
};

export default useCart;
