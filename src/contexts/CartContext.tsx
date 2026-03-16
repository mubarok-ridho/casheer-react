import React, { createContext, useState, useContext } from 'react';
import { CartItem, Menu, MenuVariation } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (menu: Menu, quantity: number, variation?: MenuVariation, notes?: string) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

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

    // Cek apakah item yang sama sudah ada di cart
    const existingIndex = items.findIndex(
      (item) => 
        item.menu_id === menu.id && 
        item.variation_id === variation?.id &&
        item.notes === notes
    );

    if (existingIndex >= 0) {
      // Update quantity jika sudah ada
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
      updatedItems[existingIndex].subtotal = updatedItems[existingIndex].price * updatedItems[existingIndex].quantity;
      setItems(updatedItems);
      toast.success('Quantity updated in cart');
    } else {
      // Tambah item baru
      setItems([...items, newItem]);
      toast.success('Added to cart');
    }
  };

  const removeFromCart = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    toast.success('Removed from cart');
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(index);
      return;
    }

    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].subtotal = updatedItems[index].price * quantity;
    setItems(updatedItems);
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    addToCart,
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