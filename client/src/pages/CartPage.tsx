import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatNPR } from '../types';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, deliveryCharge, total } =
    useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your shopping cart is empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Explore our localized catalog across Electronics, Fashion, Grocery, and Home Essentials in Butwal.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md hover:bg-orange-700 transition"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Shopping Cart</h1>
          <p className="text-xs text-gray-500">
            {items.length} unique {items.length === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const unitPrice = item.product.discountPrice ?? item.product.price;
            const itemTotal = unitPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4"
              >
                <img
                  src={item.product.images[0] || 'https://via.placeholder.com/100'}
                  alt={item.product.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                    {item.product.category?.name}
                  </span>
                  <Link to={`/product/${item.product.id}`}>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 hover:text-orange-600 truncate transition">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-semibold text-gray-600 mt-0.5">
                    {formatNPR(unitPrice)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded-l transition text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded-r transition text-xs"
                  >
                    +
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right min-w-[70px]">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {formatNPR(itemTotal)}
                  </span>
                </div>

                {/* Remove item */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 h-fit">
          <h3 className="font-extrabold text-base text-gray-900 pb-3 border-b border-gray-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatNPR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-orange-600" />
                <span>Butwal Standard Delivery</span>
              </span>
              <span className="font-semibold text-gray-900">{formatNPR(deliveryCharge)}</span>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900">Total Amount</span>
              <span className="text-xl font-black text-orange-600">{formatNPR(total)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Prisma Atomic Transaction Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
