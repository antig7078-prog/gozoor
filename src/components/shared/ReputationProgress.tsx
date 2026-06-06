import React from 'react';
import { ReputationBadge } from './ReputationBadge';
import { Award, ChevronsLeft, Heart } from 'lucide-react';

interface ReputationProgressProps {
  points: number;
  level: 'beginner' | 'active' | 'professional' | 'trusted' | 'expert';
  className?: string;
}

export const ReputationProgress: React.FC<ReputationProgressProps> = ({
  points,
  level,
  className = '',
}) => {
  const getProgressDetails = () => {
    switch (level) {
      case 'expert':
        return {
          currentMin: 5000,
          nextMax: 10000, // Caps at 10,000 for display
          nextLevel: null,
          nextLabel: '',
        };
      case 'trusted':
        return {
          currentMin: 2000,
          nextMax: 5000,
          nextLevel: 'expert' as const,
          nextLabel: 'خبير جذور',
        };
      case 'professional':
        return {
          currentMin: 500,
          nextMax: 2000,
          nextLevel: 'trusted' as const,
          nextLabel: 'شريك موثوق',
        };
      case 'active':
        return {
          currentMin: 100,
          nextMax: 500,
          nextLevel: 'professional' as const,
          nextLabel: 'محترف',
        };
      default:
        return {
          currentMin: 0,
          nextMax: 100,
          nextLevel: 'active' as const,
          nextLabel: 'عضو نشط',
        };
    }
  };

  const { currentMin, nextMax, nextLevel, nextLabel } = getProgressDetails();
  const range = nextMax - currentMin;
  const currentInRange = points - currentMin;
  const percentage = Math.min(100, Math.max(0, (currentInRange / range) * 100));
  const remainingPoints = Math.max(0, nextMax - points);

  return (
    <div className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 ${className}`} dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-primary" />
            <span>مستوى السمعة الحالي</span>
          </h4>
          <p className="text-xs text-slate-400 font-bold mt-1">يتحسن مستواك بنشر المحتوى والمبيعات والتقييمات الإيجابية.</p>
        </div>
        <ReputationBadge level={level} points={points} showPoints size="md" />
      </div>

      {nextLevel ? (
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>تقدمك نحو الرتبة التالية ({nextLabel})</span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>
              متبقي لك <strong className="text-brand-primary">{remainingPoints}</strong> نقطة سمعة للوصول إلى مستوى{' '}
              <strong className="text-brand-primary">{nextLabel}</strong>.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-100 text-purple-700 rounded-2xl p-4 text-xs font-black flex items-center gap-2">
          <Award className="w-5 h-5 shrink-0 text-purple-600" />
          <span>تهانينا! لقد وصلت إلى أعلى رتبة سمعة "خبير جذور" في المنصة. استمر بالتميز!</span>
        </div>
      )}

      {/* Threshold Map */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-400 block mb-2">توزيع مستويات السمعة:</span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-bold text-slate-500">
          <div className={`p-2 rounded-xl border text-center ${level === 'beginner' ? 'bg-slate-50 border-slate-300 font-extrabold text-slate-700' : 'border-slate-100'}`}>
            <span>مبتدئ (0+)</span>
          </div>
          <div className={`p-2 rounded-xl border text-center ${level === 'active' ? 'bg-amber-50/50 border-amber-300 font-extrabold text-amber-700' : 'border-slate-100'}`}>
            <span>نشط (100+)</span>
          </div>
          <div className={`p-2 rounded-xl border text-center ${level === 'professional' ? 'bg-blue-50/50 border-blue-300 font-extrabold text-blue-700' : 'border-slate-100'}`}>
            <span>محترف (500+)</span>
          </div>
          <div className={`p-2 rounded-xl border text-center ${level === 'trusted' ? 'bg-emerald-50/50 border-emerald-300 font-extrabold text-emerald-700' : 'border-slate-100'}`}>
            <span>موثوق (2000+)</span>
          </div>
          <div className={`p-2 rounded-xl border text-center ${level === 'expert' ? 'bg-purple-50/50 border-purple-300 font-extrabold text-purple-700' : 'border-slate-100'}`}>
            <span>خبير (5000+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
