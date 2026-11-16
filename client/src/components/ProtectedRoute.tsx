import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Truck, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { Spinner } from './Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const isCourierRoute = location.pathname.startsWith('/courier');
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            {isCourierRoute ? <Truck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
          </div>

          <h2 className="text-xl font-extrabold text-gray-900">
            {isCourierRoute ? 'Courier Portal Access Required' : 'Admin Access Required'}
          </h2>

          <p className="text-xs text-gray-600 leading-relaxed">
            You are currently logged in as <strong>{user.email}</strong> with role{' '}
            <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-gray-100 text-gray-800 uppercase">
              {user.role}
            </span>
            . This area requires <strong>{allowedRoles.join(' or ')}</strong> permissions.
          </p>

          <div className="bg-amber-50 rounded-xl p-3 text-[11px] text-amber-900 border border-amber-200 text-left space-y-1">
            <p className="font-bold">To test this portal:</p>
            {isCourierRoute ? (
              <p>
                Log in as Courier: <code>courier@butwalecom.com</code> / <code>Courier@123</code>
              </p>
            ) : (
              <p>
                Log in as Admin: <code>admin@butwalecom.com</code> / <code>Admin@123</code>
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={async () => {
                await logout();
                navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Switch / Log In</span>
            </button>
            <Link
              to="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
