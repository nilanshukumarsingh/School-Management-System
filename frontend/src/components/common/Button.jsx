import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-indigo-500 active:scale-[0.99]',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    outline:
      'bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-200 focus:ring-indigo-400',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-300',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
