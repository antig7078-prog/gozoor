import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  message,
  action,
  className = ""
}: EmptyStateProps) => {
  return (
    <div className={`bg-white p-12 rounded-[var(--radius-card)] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
      {message && (
        <p className="text-slate-500 font-semibold mb-8 max-w-sm">
          {message}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

