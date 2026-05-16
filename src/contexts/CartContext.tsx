import React, { createContext, useState, useContext } from 'react';
import { CartItem, Menu, MenuVariation, Promo, PromoItem } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (menu: Menu, quantity: number, variation?: MenuVariation, notes?: string) => void;
  addPromoToCart: (promo: Promo, selectedItems?: PromoItem[]) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // ── Menu biasa ─────────────────────────────────────────────────────────────
  const addToCart = (menu: Menu, quantity: number, variation?: MenuVariation, notes?: string) => {
    const price = variation ? menu.base_price + variation.price : menu.base_price;
    const variationName = variation ? `${variation.name}: ${variation.option}` : undefined;

    const newItem: CartItem = {
      menu_id: menu.id,
      name: menu.name,
      price,
      quantity,
      variation_id: variation?.id,
      variation_name: variationName,
      notes,
      subtotal: price * quantity,
    };

    const existingIndex = items.findIndex(
      (item) =>
        item.menu_id === menu.id &&
        item.variation_id === variation?.id &&
        item.notes === notes
    );

    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
      updatedItems[existingIndex].subtotal =
        updatedItems[existingIndex].price * updatedItems[existingIndex].quantity;
      setItems(updatedItems);
      toast.success('Quantity updated in cart');
    } else {
      setItems((prev) => [...prev, newItem]);
      toast.success('Added to cart');
    }
  };

  // ── Promo / bundle ─────────────────────────────────────────────────────────
  // addPromoToCart — promo_items sudah berisi variation_id yang dipilih user
  const addPromoToCart = (promo: Promo, selectedItems?: PromoItem[]) => {
    const existingIndex = items.findIndex(
      (item) => item.is_promo && item.promo_id === promo.id
    );

    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].subtotal =
        updatedItems[existingIndex].price * updatedItems[existingIndex].quantity;
      setItems(updatedItems);
      toast.success('Quantity promo diupdate');
    } else {
      const newItem: CartItem = {
        menu_id: 0,
        name: promo.name,
        price: promo.promo_price,
        quantity: 1,
        subtotal: promo.promo_price,
        is_promo: true,
        promo_id: promo.id,
        promo_items: selectedItems ?? promo.items, // simpan items dengan variation
      };
      setItems((prev) => [...prev, newItem]);
      toast.success(`${promo.name} ditambahkan!`);
    }
  };

  // ── Cart ops ───────────────────────────────────────────────────────────────
  const removeFromCart = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.success('Removed from cart');
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) { removeFromCart(index); return; }
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].subtotal = updatedItems[index].price * quantity;
    setItems(updatedItems);
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    addToCart,
    addPromoToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};