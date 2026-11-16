import React from 'react';
import { CheckCircle, MapPin, Phone, Package, Warehouse, User, Banknote } from 'lucide-react';
import { DeliveryStop, Order, formatNPR } from '../../types';

interface StopCardProps {
  stop: DeliveryStop;
  index: number;
  onComplete: (stopId: string) => void;
  isCompleted: boolean;
  orders?: Order[];
  isDepot?: boolean;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  index,
  onComplete,
  isCompleted,
  orders = [],
  isDepot = false,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border transition ${
        isCompleted
          ? 'bg-emerald-50/50 border-emerald-200'
          : 'bg-white border-gray-200 shadow-sm hover:border-orange-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 text-white'
                : isDepot
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-orange-600 text-white shadow-sm'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-4 h-4" />
            ) : isDepot ? (
              <Warehouse className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-gray-900 text-sm">
                {stop.roadNode?.name || `Stop #${index + 1}`}
              </h4>
              {isDepot && (
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Depot / Start
                </span>
              )}
            </div>

            <p className="text-[11px] text-gray-500 font-mono">
              📍 Coordinates: {stop.roadNode?.latitude?.toFixed(4)}° N, {stop.roadNode?.longitude?.toFixed(4)}° E
            </p>

            {/* If orders exist at this stop */}
            {orders.length > 0 ? (
              <div className="pt-2 space-y-2">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-gray-900 text-[11px]">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentMethod} • {ord.paymentStatus} ({formatNPR(ord.totalAmount)})
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{ord.customer?.name || 'Customer'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <a
                          href={`tel:${ord.deliveryPhone || ord.customer?.phone}`}
                          className="text-emerald-700 hover:underline font-mono"
                        >
                          {ord.deliveryPhone || ord.customer?.phone}
                        </a>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      🏠 {ord.deliveryAddress}
                    </p>

                    {ord.items && ord.items.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {ord.items.map((item, i) => (
                          <span
                            key={i}
                            className="bg-white border border-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-md flex items-center space-x-1"
                          >
                            <Package className="w-2.5 h-2.5 text-orange-600" />
                            <span>
                              {item.quantity}x {item.product?.name || 'Item'}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : isDepot ? (
              <p className="text-[11px] text-gray-500 italic pt-1">
                Warehouse departure hub. Collect all packages and depart along optimal Siddhartha Highway corridor.
              </p>
            ) : null}
          </div>
        </div>

        <div className="pl-3 shrink-0">
          {!isCompleted ? (
            <button
              onClick={() => onComplete(stop.id)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Delivered</span>
            </button>
          ) : (
            <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1 bg-emerald-100 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Delivered</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
