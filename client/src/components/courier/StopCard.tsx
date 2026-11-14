import React from 'react';
import { CheckCircle, MapPin, Phone, Package, ArrowRight } from 'lucide-react';
import { DeliveryStop, formatNPR } from '../../types';

interface StopCardProps {
  stop: DeliveryStop;
  index: number;
  onComplete: (stopId: string) => void;
  isCompleted: boolean;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  index,
  onComplete,
  isCompleted,
}) => {
  return (
    <div
      className={`p-4 rounded-xl border transition ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
          : 'bg-white border-gray-200 shadow-sm hover:border-orange-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              isCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-600 text-white shadow-sm'
            }`}
          >
            {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {stop.roadNode?.name || `Stop #${index + 1}`}
            </h4>
            <p className="text-[11px] text-gray-500 font-mono">
              📍 {stop.roadNode?.latitude?.toFixed(4)}° N, {stop.roadNode?.longitude?.toFixed(4)}° E
            </p>
          </div>
        </div>

        <div>
          {!isCompleted ? (
            <button
              onClick={() => onComplete(stop.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Delivered</span>
            </button>
          ) : (
            <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1 bg-emerald-100 px-2.5 py-1 rounded-full">
              <span>Completed</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
