import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-black text-slate-700 mr-1">
            {label}
          </label>
        )}

        <div className="relative group">
          {Icon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
              <Icon size={20} />
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full 
              ${Icon ? 'pr-12' : 'px-5'} 
              py-3.5 
              bg-slate-50 
              border 
              ${error ? 'border-red-500' : 'border-slate-200'} 
              rounded-[var(--radius-input)] 
              font-bold 
              text-slate-900 
              focus:outline-none 
              focus:ring-4 
              ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-brand-primary/10 focus:border-brand-primary'} 
              transition-all 
              placeholder:text-slate-400
              ${className}
            `}
            {...props}
          />
        </div>

        {error && <p className="text-xs font-bold text-red-500 mr-1">{error}</p>}
        {helperText && !error && <p className="text-xs font-medium text-slate-500 mr-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
