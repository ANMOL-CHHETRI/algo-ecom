import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, Check, Phone, MapPin } from 'lucide-react';
import api from '../../services/api';
import { Order, OrderStatus, formatNPR } from '../../types';
import { Spinner } from '../../components/Spinner';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const statusOptions: OrderStatus[] = [
    'PLACED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Customer Orders & Status Pipeline</h2>
        <p className="text-gray-500">
          Monitor incoming customer orders, payment verification, and delivery state transitions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-gray-200">
            <thead className="bg-gray-50 font-bold text-gray-600">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Destination Node</th>
                <th className="px-4 py-3">Total (NPR)</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status Pipeline</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">
                    #{o.orderNumber}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{o.customer?.name}</p>
                    <p className="text-gray-500 text-[11px]">{o.deliveryPhone}</p>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1 text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="font-medium truncate max-w-[150px]">
                        {o.roadNode?.name || 'Custom Coordinates'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-bold text-gray-900">
                    {formatNPR(o.totalAmount + o.deliveryCharge)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.paymentMethod} ({o.paymentStatus})
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1 rounded-lg border border-gray-300 font-bold text-xs bg-white focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right text-gray-400 font-mono text-[11px]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
