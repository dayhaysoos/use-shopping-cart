import { useShoppingCart } from "use-shopping-cart";
import { useEffect } from "react";

export default function Success() {
  const { clearCart } = useShoppingCart();

  useEffect(() => {
    clearCart();
  }, []);

  return <h1>Your payment was successful. Thank you for your purchase.</h1>;
}
