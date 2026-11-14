import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { Cart, CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      // Local storage fallback for guests
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    const res = await api.post('/cart/items', { productId, quantity });
    if (res.data.success) {
      setCart(res.data.cart);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    if (res.data.success) {
      setCart(res.data.cart);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    if (res.data.success) {
      setCart(res.data.cart);
    }
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart((prev) => (prev ? { ...prev, items: [] } : null));
  };

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.discountPrice ?? item.product?.price ?? 0) * item.quantity,
    0
  );
  const deliveryCharge = itemCount > 0 ? 50 : 0;
  const total = subtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        deliveryCharge,
        total,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
