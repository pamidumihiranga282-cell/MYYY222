import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  totalWeight: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const calcDelivery = (weightKg: number): number => {
  if (weightKg <= 0.25) return 150;
  if (weightKg <= 0.5) return 250;
  if (weightKg <= 0.75) return 350;
  if (weightKg <= 1) return 450;
  // Over 1kg: add 450 per kg bracket
  const extra = Math.ceil((weightKg - 1) / 0.25);
  return 450 + extra * 100;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mrm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mrm_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        toast.success('Cart updated!');
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      toast.success('Added to cart!');
      return [...prev, { productId: product.id, product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalWeight = items.reduce((s, i) => s + (i.product.weight || 0.25) * i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const deliveryCharge = items.length > 0 ? calcDelivery(totalWeight) : 0;
  const total = subtotal + deliveryCharge;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, deliveryCharge, total, totalWeight }}>
      {children}
    </CartContext.Provider>
  );
};
