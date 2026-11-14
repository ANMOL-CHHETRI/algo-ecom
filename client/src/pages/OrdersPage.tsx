import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, MapPin, Calendar, Clock, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { Order, formatNPR } from '../types';
import { Spinner } from '../components/Spinner';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500">Loading your order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">No orders placed yet</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          You haven't placed any orders yet. Explore our localized products in Butwal and place your first order.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md hover:bg-orange-700 transition"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
        <p className="text-xs text-gray-500">
          Track active fulfillment across Butwal road intersections.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs">
              <div className="space-y-1">
                <span className="font-mono font-bold text-gray-900 text-sm">
                  #{order.orderNumber}
                </span>
                <div className="flex items-center space-x-3 text-gray-500 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span>•</span>
                  <span>Payment: {order.paymentMethod} ({order.paymentStatus})</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus.replace(/_/g, ' ')}
                </span>
                <Link
                  to={`/orders/${order.id}`}
                  className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white font-bold text-xs transition flex items-center space-x-1"
                >
                  <span>Track Order</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Content summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-1">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Items ({order.items?.length || 0})
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 text-xs flex items-center space-x-2"
                    >
                      <span className="font-medium text-gray-800">{item.product.name}</span>
                      <span className="text-gray-400 font-mono">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 pt-2 md:pt-0">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Delivery Destination (Butwal)
                </p>
                <div className="flex items-start space-x-1.5 text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 mt-0.5 shrink-0" />
                  <span className="truncate">{order.deliveryAddress}</span>
                </div>
                <div className="pt-1 flex justify-between items-baseline">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-bold text-orange-600 text-sm">
                    {formatNPR(order.totalAmount + order.deliveryCharge)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
