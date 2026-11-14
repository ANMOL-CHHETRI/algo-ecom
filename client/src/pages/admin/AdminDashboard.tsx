import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  ShoppingBag,
  AlertTriangle,
  Package,
  Truck,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../../services/api';
import { StatsCard } from '../../components/admin/StatsCard';
import { formatNPR } from '../../types';
import { Spinner } from '../../components/Spinner';

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/products/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500">Loading live business analytics...</p>
      </div>
    );
  }

  const barData = (stats?.recentOrders || []).map((o: any, idx: number) => ({
    name: o.orderNumber ? `#${o.orderNumber.split('-')[2] || idx}` : `Order ${idx + 1}`,
    amount: o.totalAmount,
  }));

  return (
    <div className="space-y-8 text-xs">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Gross Revenue (NPR)"
          value={formatNPR(stats?.totalRevenue || 0)}
          subtitle="All confirmed Butwal orders"
          icon={Banknote}
          color="emerald"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle="Customer transactions"
          icon={ShoppingBag}
          color="blue"
        />
        <StatsCard
          title="Low-Stock Alerts"
          value={stats?.lowStockProducts || 0}
          subtitle="Inventory threshold ≤ 5"
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Active Products"
          value={stats?.totalProducts || 0}
          subtitle="Across 4 categories"
          icon={Package}
          color="orange"
        />
      </div>

      {/* Visual Analytics with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                Recent Order Transaction Volume (NPR)
              </h3>
              <p className="text-gray-400 text-[11px]">Real-time transactional revenue distribution</p>
            </div>
            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
              Recharts Engine
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData.length > 0 ? barData : [{ name: 'Sample', amount: 1200 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(val: any) => [formatNPR(val), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="amount" fill="#ea580c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">Product Category Share</h3>
            <p className="text-gray-400 text-[11px]">Catalog volume by category</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryShare || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {(stats?.categoryShare || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/delivery"
          className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-sm">Delivery Batching & Route Optimization</h4>
            <p className="text-orange-100 text-[11px] mt-0.5">
              Run Dijkstra & Nearest Neighbor on Butwal stops
            </p>
          </div>
          <Truck className="w-8 h-8 text-orange-200 shrink-0" />
        </Link>

        <Link
          to="/admin/products"
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-sm text-gray-900">Manage Products & Inventory</h4>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Stock alerts and vector attribute embeddings
            </p>
          </div>
          <Package className="w-8 h-8 text-orange-600 shrink-0" />
        </Link>

        <Link
          to="/algo-lab"
          className="bg-purple-900 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-sm">Algorithm Demonstration Lab</h4>
            <p className="text-purple-200 text-[11px] mt-0.5">
              Interactive viva demonstration interface for examiners
            </p>
          </div>
          <Cpu className="w-8 h-8 text-purple-300 shrink-0" />
        </Link>
      </div>
    </div>
  );
};
