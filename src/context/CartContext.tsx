import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTotalWeight: () => number;
  getDeliveryCharge: () => number;
  cartCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mrm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mrm_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const getTotalWeight = () => cart.reduce((sum, item) => sum + item.product.weight * item.quantity, 0);

  const getDeliveryCharge = () => {
    if (cart.length === 0) return 0;
    const totalWeightGrams = getTotalWeight();
    // Tiered delivery charges
    if (totalWeightGrams <= 250) return 250;
    if (totalWeightGrams <= 500) return 350;
    if (totalWeightGrams <= 1000) return 450;
    // Over 1kg: Rs.450 for first kg + Rs.450 per additional kg
    const extraKg = Math.ceil((totalWeightGrams - 1000) / 1000);
    return 450 + extraKg * 450;
  };

  const getTotal = () => getSubtotal() + getDeliveryCharge();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      getTotal, getSubtotal, getTotalWeight, getDeliveryCharge, cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
