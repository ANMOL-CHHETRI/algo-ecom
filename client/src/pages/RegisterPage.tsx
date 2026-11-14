import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  phone: z
    .string()
    .regex(/^(\+977-?)?9[78]\d{8}$/, 'Must be a valid Nepalese phone number (+977-98XXXXXXXX or 97XXXXXXXX)'),
  address: z.string().min(4, 'Address in Butwal / Rupandehi is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '+977-98',
      address: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await registerUser(data);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-orange-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
            ब
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Create Customer Account
          </h2>
          <p className="text-xs text-gray-500">
            Join the localized Algorithm-Driven E-Commerce network in Butwal.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Ramesh Shrestha"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="ramesh@gmail.com"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Nepalese Mobile (+977)
            </label>
            <input
              type="text"
              {...register('phone')}
              placeholder="+977-98XXXXXXXX"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.phone && (
              <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Address in Butwal / Rupandehi
            </label>
            <input
              type="text"
              {...register('address')}
              placeholder="e.g. Golpark, Ward-3, Butwal"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.address && (
              <p className="text-red-500 text-[10px] mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="Minimum 8 characters"
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
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
