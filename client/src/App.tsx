import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { CourierLayout } from './layouts/CourierLayout';

// Customer Pages
import { StorePage } from './pages/StorePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AlgoLabPage } from './pages/AlgoLabPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminDeliveryPage } from './pages/admin/AdminDeliveryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';

// Courier Pages
import { CourierDashboard } from './pages/courier/CourierDashboard';
import { BatchDetailPage } from './pages/courier/BatchDetailPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer Storefront Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<StorePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/algo-lab" element={<AlgoLabPage />} />

              {/* Protected Customer Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'COURIER']}>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'COURIER']}>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'COURIER']}>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="delivery" element={<AdminDeliveryPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
            </Route>

            {/* Protected Courier Routes */}
            <Route
              path="/courier"
              element={
                <ProtectedRoute allowedRoles={['COURIER', 'ADMIN']}>
                  <CourierLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CourierDashboard />} />
              <Route path="batch/:id" element={<BatchDetailPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
