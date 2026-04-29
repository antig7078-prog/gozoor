import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none rounded-[var(--radius-button)]';

  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20',
    secondary: 'bg-brand-primary-light text-brand-primary hover:bg-brand-primary/10',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white',
    ghost: 'text-slate-500 hover:bg-slate-100',
    premium: 'bg-gradient-to-tr from-brand-primary-hover to-brand-accent text-white shadow-xl shadow-brand-primary/20 hover:scale-[1.02]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </button>
  );
};
