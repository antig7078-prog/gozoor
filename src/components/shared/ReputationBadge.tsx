import React from 'react';
import { Shield, ShieldAlert, Award, Star, Zap } from 'lucide-react';

interface ReputationBadgeProps {
  level: 'beginner' | 'active' | 'professional' | 'trusted' | 'expert';
  points?: number;
  showPoints?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  level,
  points = 0,
  showPoints = false,
  size = 'md',
  className = '',
}) => {
  const getBadgeDetails = () => {
    switch (level) {
      case 'expert':
        return {
          label: 'خبير جذور',
          icon: Zap,
          colors: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800/40',
          shadow: 'shadow-purple-500/5',
        };
      case 'trusted':
        return {
          label: 'شريك موثوق',
          icon: Shield,
          colors: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800/40',
          shadow: 'shadow-emerald-500/5',
        };
      case 'professional':
        return {
          label: 'محترف',
          icon: Award,
          colors: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800/40',
          shadow: 'shadow-blue-500/5',
        };
      case 'active':
        return {
          label: 'عضو نشط',
          icon: Star,
          colors: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800/40',
          shadow: 'shadow-amber-500/5',
        };
      default:
        return {
          label: 'مبتدئ',
          icon: ShieldAlert,
          colors: 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800/40',
          shadow: 'shadow-slate-500/5',
        };
    }
  };

  const { label, icon: Icon, colors, shadow } = getBadgeDetails();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-lg border',
    md: 'px-3 py-1 text-xs gap-1.5 rounded-xl border font-bold',
    lg: 'px-4 py-2 text-sm gap-2 rounded-2xl border font-black',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  return (
    <div
      className={`inline-flex items-center select-none shadow-sm transition-all duration-200 hover:scale-102 ${sizeClasses[size]} ${colors} ${shadow} ${className}`}
      dir="rtl"
    >
      <Icon size={iconSizes[size]} className="shrink-0 animate-pulse" />
      <span>{label}</span>
      {showPoints && points > 0 && (
        <span className="opacity-75 text-[0.8em] font-normal border-r border-current pr-1.5 mr-1.5">
          {points} نقطة
        </span>
      )}
    </div>
  );
};
