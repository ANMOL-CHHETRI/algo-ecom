import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Truck, ArrowLeft, ShieldCheck, Calendar } from 'lucide-react';
import api from '../services/api';
import { Order, formatNPR } from '../types';
import { OrderStatusBar } from '../components/OrderStatusBar';
import { Spinner } from '../components/Spinner';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500">Loading order tracking details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
        <Link to="/orders" className="text-orange-600 text-xs mt-2 inline-block hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <Link
            to="/orders"
            className="text-xs text-gray-500 hover:text-orange-600 flex items-center space-x-1 mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-xs text-gray-500 flex items-center space-x-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Placed on {new Date(order.createdAt).toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wider">
            Payment: {order.paymentMethod} ({order.paymentStatus})
          </span>
        </div>
      </div>

      {/* Real-time Order Progress Status Bar */}
      <OrderStatusBar status={order.orderStatus} />

      {/* Grid: Details & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ordered items */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
            Ordered Items ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-gray-100 text-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                    alt={item.product?.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{item.product?.name}</h4>
                    <p className="text-gray-500">
                      {formatNPR(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">
                  {formatNPR(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatNPR(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge (Butwal Flat)</span>
              <span className="font-semibold">{formatNPR(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
              <span>Total Paid / Payable</span>
              <span className="text-lg font-black text-orange-600">
                {formatNPR(order.totalAmount + order.deliveryCharge)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
              Delivery Information
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-gray-400 block text-[11px] font-semibold uppercase">
                  Recipient
                </span>
                <p className="font-bold text-gray-900 mt-0.5">{order.customer?.name}</p>
                <p className="text-gray-600 flex items-center space-x-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{order.deliveryPhone}</span>
                </p>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px] font-semibold uppercase">
                  Destination Address
                </span>
                <p className="text-gray-800 mt-0.5 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span>{order.deliveryAddress}</span>
                </p>
              </div>

              {order.roadNode && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                    Butwal Road Network Node
                  </span>
                  <p className="font-bold text-orange-950 mt-0.5">{order.roadNode.name}</p>
                  <p className="text-[10px] text-orange-700 font-mono mt-0.5">
                    {order.roadNode.latitude}° N, {order.roadNode.longitude}° E
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Courier dispatch card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-900">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Butwal Logistics Dispatch</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Order is dispatched from <strong>Traffic Chowk Central Depot</strong> and sequenced using Nearest-Neighbor TSP optimization for minimum transit delay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
