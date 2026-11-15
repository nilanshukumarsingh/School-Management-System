import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  icon: Icon,
  color = 'indigo',
}) => {
  const isPositive = trend > 0;
  const isNeutral = trend === undefined || trend === 0;

  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1.5">{value}</h4>
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
              colorStyles[color] || colorStyles.indigo
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={`flex items-center font-bold ${
              isPositive ? 'text-emerald-600' : isNeutral ? 'text-slate-500' : 'text-rose-600'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {!isPositive && !isNeutral && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-slate-400">{trendLabel}</span>
        </div>
      )}
    </Card>
  );
};
