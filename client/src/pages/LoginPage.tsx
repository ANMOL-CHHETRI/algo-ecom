import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Shield, Truck, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'COURIER') {
        navigate('/courier');
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Viva Demo credentials autofill
  const handleDemoFill = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-orange-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
            ब
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Log In to BuTwal E-Com
          </h2>
          <p className="text-xs text-gray-500">
            Access the customer storefront, admin dashboard, or courier portal.
          </p>
        </div>

        {/* Demo Fast-Login Box for Viva Examiners */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>BCA Viva Quick Demo Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@butwalecom.com', 'Admin@123')}
              className="py-1 px-2 rounded bg-white hover:bg-amber-100 border border-amber-300 font-semibold text-amber-950 text-[11px] flex items-center justify-center space-x-1 transition shadow-sm"
            >
              <Shield className="w-3 h-3 text-blue-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('courier@butwalecom.com', 'Courier@123')}
              className="py-1 px-2 rounded bg-white hover:bg-amber-100 border border-amber-300 font-semibold text-amber-950 text-[11px] flex items-center justify-center space-x-1 transition shadow-sm"
            >
              <Truck className="w-3 h-3 text-emerald-600" />
              <span>Courier</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('customer@gmail.com', 'Customer@123')}
              className="py-1 px-2 rounded bg-white hover:bg-amber-100 border border-amber-300 font-semibold text-amber-950 text-[11px] flex items-center justify-center space-x-1 transition shadow-sm"
            >
              <User className="w-3 h-3 text-orange-600" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. admin@butwalecom.com"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-[10px] mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
};
