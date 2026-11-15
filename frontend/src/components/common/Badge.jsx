import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.neutral} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
