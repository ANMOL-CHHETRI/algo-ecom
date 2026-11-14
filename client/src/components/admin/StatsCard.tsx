import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'orange' | 'blue' | 'emerald' | 'purple' | 'red';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'orange',
}) => {
  const colorMap = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-2xl font-black text-gray-900">{value}</span>
        {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
      </div>

      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
