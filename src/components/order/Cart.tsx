import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/format';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface CartProps {
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Keranjang masih kosong</p>
          <p className="text-sm text-gray-400 mt-2">Pilih menu untuk memulai</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Keranjang</h2>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              {item.variation_name && (
                <p className="text-sm text-gray-600">{item.variation_name}</p>
              )}
              {item.notes && (
                <p className="text-xs text-gray-500 mt-1">Catatan: {item.notes}</p>
              )}
              <p className="text-sm text-primary-600 mt-1">
                {formatCurrency(item.price)} x {item.quantity}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(item.subtotal)}
              </p>
              
              {/* Quantity Controls */}
              <div className="flex items-center justify-end mt-2 space-x-2">
                <button
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  className="p-1 text-gray-500 hover:text-primary-600"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                  className="p-1 text-gray-500 hover:text-primary-600"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeFromCart(index)}
                  className="p-1 text-red-500 hover:text-red-700 ml-2"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pajak (0%)</span>
          <span className="font-medium text-gray-900">Rp 0</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-primary-600">{formatCurrency(subtotal)}</span>
        </div>

        <Button onClick={onCheckout} variant="primary" fullWidth size="lg">
          Proses Pembayaran
        </Button>
      </div>
    </Card>
  );
};