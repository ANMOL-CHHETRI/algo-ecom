import React from 'react';
import { Check, Clock, Package, Truck, Home, AlertTriangle } from 'lucide-react';
import { OrderStatus } from '../types';

interface OrderStatusBarProps {
  status: OrderStatus;
}

export const OrderStatusBar: React.FC<OrderStatusBarProps> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 text-red-700">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-red-600 mt-0.5">
            This delivery order has been cancelled and is no longer being routed.
          </p>
        </div>
      </div>
    );
  }

  const steps: Array<{
    key: OrderStatus;
    label: string;
    icon: React.ElementType;
    description: string;
  }> = [
    { key: 'PLACED', label: 'Placed', icon: Clock, description: 'Order confirmed' },
    { key: 'PROCESSING', label: 'Processing', icon: Package, description: 'Batch optimized' },
    { key: 'SHIPPED', label: 'Dispatched', icon: Truck, description: 'Depot departure' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, description: 'Courier active' },
    { key: 'DELIVERED', label: 'Delivered', icon: Home, description: 'Completed' },
  ];

  const statusOrder: Record<OrderStatus, number> = {
    PLACED: 0,
    PROCESSING: 1,
    SHIPPED: 2,
    OUT_FOR_DELIVERY: 3,
    DELIVERED: 4,
    CANCELLED: -1,
  };

  const currentIndex = statusOrder[status] ?? 0;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="relative">
        {/* Track Line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-200 -z-0">
          <div
            className="h-full bg-orange-600 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center max-w-[90px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-orange-600 text-white shadow-md'
                      : isCurrent
                      ? 'bg-orange-600 text-white ring-4 ring-orange-100 shadow-md animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
                </div>

                <span
                  className={`mt-2 text-xs font-semibold ${
                    isCurrent ? 'text-orange-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5 hidden sm:inline">
                  {step.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
