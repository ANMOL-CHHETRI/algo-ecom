import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Truck, ArrowLeft, LogOut, CheckCircle, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const CourierLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 font-sans">
      {/* Mobile-optimized Header */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-tight">
                Courier Portal (Butwal)
              </h1>
              <p className="text-[11px] text-emerald-200">
                Logged in as: {user?.name || 'Courier'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Link
              to="/"
              className="text-emerald-100 hover:text-white flex items-center space-x-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Link>
            <button
              onClick={() => logout()}
              className="bg-emerald-800 hover:bg-emerald-900 px-2.5 py-1 rounded text-white font-medium flex items-center space-x-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};
