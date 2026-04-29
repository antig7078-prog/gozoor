import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  className = "",
  hoverable = true,
  padding = 'md'
}: CardProps) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`
      bg-surface-card 
      rounded-[var(--radius-card)] 
      border border-border-default 
      shadow-sm 
      transition-all duration-300 
      ${hoverable ? 'hover:shadow-premium-hover hover:-translate-y-1 hover:border-brand-primary/30' : ''} 
      ${paddingMap[padding]} 
      ${className}
    `}>
      {children}
    </div>
  );
};
