import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-900/20',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
    outline: 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

export const Input = React.forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 px-4 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-600',
            Icon && 'pl-12',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
});
