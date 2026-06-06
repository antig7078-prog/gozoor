import React from 'react';
import { StarRating } from './StarRating';
import { Star, ShieldAlert, Award, ShoppingBag, Briefcase, Settings } from 'lucide-react';
import type { Profile } from '../../types';

interface UserRatingsSummaryProps {
  profile: Partial<Profile>;
}

export const UserRatingsSummary: React.FC<UserRatingsSummaryProps> = ({ profile }) => {
  const overall = profile.overall_rating || 0;
  const jobs = profile.jobs_rating || 0;
  const services = profile.services_rating || 0;
  const products = profile.products_rating || 0;
  const reputationPoints = profile.reputation_points || 0;
  const reputationLevel = profile.reputation_level || 'beginner';

  const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ',
    active: 'نشط',
    professional: 'محترف',
    trusted: 'موثوق',
    expert: 'خبير',
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'trusted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'professional': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'active': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const categories = [
    { name: 'الوظائف والتوظيف', rating: jobs, icon: Briefcase, color: 'text-sky-500' },
    { name: 'الخدمات الحرة', rating: services, icon: Settings, color: 'text-teal-500' },
    { name: 'المنتجات والسوق', rating: products, icon: ShoppingBag, color: 'text-amber-500' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6" dir="rtl">
      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
        <Award className="w-5 h-5 text-brand-primary" />
        <span>تقييمات وسمعة المستخدم</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Overall Score */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-6 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-5xl font-black text-slate-800 leading-none mb-2">{overall.toFixed(1)}</span>
          <StarRating rating={overall} size={22} className="mb-2" />
          <span className="text-xs text-slate-400 font-medium">التقييم العام للمستخدم</span>
          
          <div className={`mt-4 px-4 py-1.5 rounded-full border text-xs font-black flex items-center gap-1.5 ${getLevelColor(reputationLevel)}`}>
            <span>مستوى السمعة: {levelLabels[reputationLevel]}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1.5 font-bold">({reputationPoints} نقطة سمعة)</span>
        </div>

        {/* Categories Ratings */}
        <div className="md:col-span-7 space-y-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-slate-250 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700 leading-tight">{cat.name}</h4>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 block">تقييم القسم الفرعي</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{cat.rating > 0 ? cat.rating.toFixed(1) : '-'}</span>
                <Star className={`w-4 h-4 ${cat.rating > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
