import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  className?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  className = ""
}: StatCardProps) => {
  return (
    <div className={`bg-surface-card p-8 rounded-[var(--radius-card)] border border-border-default shadow-sm transition-all duration-300 hover:shadow-premium-hover hover:border-brand-primary/20 hover:-translate-y-1 group ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -inset-2 bg-brand-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-border-subtle group-hover:bg-white transition-colors duration-300">
            <Icon className="w-7 h-7 text-brand-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
        {trend && (
          <span className={`px-3 py-1 rounded-full text-sm font-black ${trend.isUp 
            ? 'bg-brand-primary-light text-brand-primary-hover border border-brand-primary/10' 
            : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
  );
};
