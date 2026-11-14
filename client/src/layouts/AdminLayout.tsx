import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingBag,
  ArrowLeft,
  Cpu,
  Layers,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Overview Analytics', path: '/admin', icon: LayoutDashboard },
    { label: 'Products & Inventory', path: '/admin/products', icon: Package },
    { label: 'Route Optimization', path: '/admin/delivery', icon: Truck },
    { label: 'Order Batches', path: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0 border-r border-gray-800">
        {/* Brand */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-lg">
              ब
            </div>
            <div>
              <span className="font-bold text-white text-base">BuTwal Admin</span>
              <span className="block text-[10px] text-gray-400 font-mono">BCA Dispatch Hub</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 space-y-1 text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-2">
            <span className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Academic Lab
            </span>
          </div>

          <Link
            to="/algo-lab"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-gray-800 transition"
          >
            <Cpu className="w-4 h-4" />
            <span>Algorithm Lab (Viva)</span>
          </Link>

          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Customer Storefront</span>
          </Link>
        </nav>

        {/* User bar */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-white truncate max-w-[120px]">{user?.name}</p>
            <span className="text-[10px] text-orange-400 font-mono">ADMINISTRATOR</span>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Butwal Regional E-Commerce Administration
            </h1>
            <p className="text-xs text-gray-500">
              Graph routing, TSP multi-stop sequencing, and inventory management
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Postgres & Dijkstra Online</span>
            </span>
          </div>
        </header>

        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
