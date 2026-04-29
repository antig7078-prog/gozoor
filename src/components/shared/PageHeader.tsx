import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  icon: Icon,
  actions,
  badge,
  className = ""
}: PageHeaderProps) => {
  return (
    <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 mb-8 sm:mb-12 ${className}`}>
      <div className="flex items-center gap-4 sm:gap-5">
        {Icon && (
          <div className="relative group shrink-0">
            <div className="absolute -inset-2 bg-brand-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-white text-brand-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-premium border border-border-default transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        )}
        <div className="min-w-0">
          {badge && (
            <div className="mb-1 sm:mb-2">
              {badge}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-1 sm:mb-2 truncate">
            {title}
          </h1>
          {description && (
            <p className="text-slate-500 font-bold text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
