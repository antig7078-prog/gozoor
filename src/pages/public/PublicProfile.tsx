import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Star, Award, ShieldCheck, Briefcase, Package, MonitorPlay,
  Globe, Calendar, ChevronRight, MapPin, TrendingUp, MessageCircle
} from 'lucide-react';
import { userService } from '../../services/userService';
import { marketplaceService } from '../../services/marketplaceService';
import { jobsService } from '../../services/jobsService';
import { supabase } from '../../lib/supabase';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import type { Product, Service, Job, Post } from '../../types';

interface PublicProfileData {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  specialization?: string;
  portfolio_url?: string;
  role: string;
  reputation_points?: number;
  reputation_level?: string;
  jobs_rating?: number;
  services_rating?: number;
  products_rating?: number;
  overall_rating?: number;
  created_at: string;
}

const levelLabels: Record<string, string> = {
  beginner: 'مبتدئ',
  active: 'نشط',
  professional: 'محترف',
  trusted: 'موثوق',
  expert: 'خبير'
};

const levelColors: Record<string, string> = {
  beginner: 'bg-slate-100 text-slate-600',
  active: 'bg-blue-100 text-blue-600',
  professional: 'bg-emerald-100 text-emerald-600',
  trusted: 'bg-amber-100 text-amber-600',
  expert: 'bg-brand-primary/10 text-brand-primary'
};

type ActiveTab = 'products' | 'services' | 'jobs' | 'posts';

export const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await userService.getPublicProfile(userId);
      if (!error && data) setProfile(data as PublicProfileData);
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  // Fetch tab data
  useEffect(() => {
    if (!userId) return;
    const fetchTabData = async () => {
      setTabLoading(true);
      try {
        if (activeTab === 'products') {
          const { data } = await marketplaceService.getProducts({ sellerId: userId });
          setProducts((data || []).filter(p => p.moderation_status !== 'rejected'));
        } else if (activeTab === 'services') {
          const { data } = await marketplaceService.getServices({ freelancerId: userId });
          setServices(data || []);
        } else if (activeTab === 'jobs') {
          const { data } = await jobsService.getJobs({ excludeExpired: false });
          setJobs((data || []).filter(j => j.employer_id === userId));
        } else if (activeTab === 'posts') {
          const { data } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);
          setPosts(data || []);
        }
      } catch { /* silent */ }
      setTabLoading(false);
    };
    fetchTabData();
  }, [userId, activeTab]);

  if (loading) {
    return <LoadingSpinner fullPage message="جاري تحميل الملف الشخصي..." />;
  }

  if (!profile) {
    return (
      <PageContainer>
        <div className="text-center py-32 bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-xl max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-text-primary mb-4">المستخدم غير موجود</h2>
          <p className="text-text-secondary mb-8 font-bold">عذراً، لم نتمكن من العثور على الملف الشخصي.</p>
          <Link to="/" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-black shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform">
            <ChevronRight className="w-5 h-5" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </PageContainer>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
  const level = profile.reputation_level || 'beginner';

  const tabs: { key: ActiveTab; label: string; icon: typeof Package; count?: number }[] = [
    { key: 'products', label: 'المنتجات', icon: Package, count: products.length },
    { key: 'services', label: 'الخدمات', icon: MonitorPlay, count: services.length },
    { key: 'jobs', label: 'الوظائف', icon: Briefcase, count: jobs.length },
    { key: 'posts', label: 'المنشورات', icon: MessageCircle, count: posts.length },
  ];

  return (
    <PageContainer maxWidth="lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

        {/* Hero Profile Card */}
        <div className="relative bg-white rounded-[2rem] border border-border-subtle shadow-2xl shadow-slate-200/50 overflow-hidden">
          {/* Banner */}
          <div className="h-36 sm:h-48 bg-brand-primary relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          </div>

          {/* Profile Info */}
          <div className="px-6 sm:px-10 pb-10 -mt-16 sm:-mt-20 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2rem] bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-brand-primary" />
                )}
              </div>

              {/* Name & Meta */}
              <div className="flex-1 text-center sm:text-right pb-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-text-primary">{profile.full_name || 'مستخدم جذور'}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${levelColors[level]}`}>
                    {levelLabels[level]}
                  </span>
                </div>
                {profile.specialization && (
                  <p className="text-brand-primary font-bold text-sm mb-2">{profile.specialization}</p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-text-muted text-xs font-bold">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> انضم في {joinDate}</span>
                  {profile.overall_rating && profile.overall_rating > 0 && (
                    <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {profile.overall_rating.toFixed(1)}</span>
                  )}
                  {profile.reputation_points !== undefined && profile.reputation_points > 0 && (
                    <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-brand-primary" /> {profile.reputation_points} نقطة</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 shrink-0">
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-brand-primary transition-colors shadow-lg">
                    <Globe className="w-4 h-4" /> معرض الأعمال
                  </a>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-8 p-6 bg-surface-primary rounded-2xl border border-border-subtle/50">
                <p className="text-text-secondary font-bold leading-relaxed text-sm whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'تقييم المنتجات', value: profile.products_rating, icon: Package, color: 'text-emerald-500' },
            { label: 'تقييم الخدمات', value: profile.services_rating, icon: MonitorPlay, color: 'text-blue-500' },
            { label: 'تقييم التوظيف', value: profile.jobs_rating, icon: Briefcase, color: 'text-amber-500' },
            { label: 'التقييم العام', value: profile.overall_rating, icon: Star, color: 'text-brand-primary' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="bg-white rounded-2xl border border-border-subtle p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black text-text-primary">
                {stat.value && stat.value > 0 ? `${stat.value.toFixed(1)} / 5` : '—'}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-brand-primary shadow-md shadow-brand-primary/5'
                    : 'text-text-muted hover:text-text-secondary'
                }`}>
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.key && tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-[10px] font-black">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 min-h-[300px]">
            {tabLoading ? (
              <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
            ) : (
              <>
                {/* Products Tab */}
                {activeTab === 'products' && (
                  products.length === 0 ? <EmptyState text="لا توجد منتجات معروضة حالياً" icon={Package} /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map(p => (
                        <Link key={p.id} to={`/marketplace/${p.id}`} className="group bg-surface-primary rounded-2xl border border-border-subtle overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                          <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                            {p.image_url ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <Package className="w-12 h-12 text-slate-200 m-auto mt-12" />}
                          </div>
                          <div className="p-4">
                            <h3 className="font-black text-text-primary text-sm mb-1 line-clamp-1">{p.title}</h3>
                            {p.category && <Badge variant="secondary" size="sm">{p.category}</Badge>}
                            <p className="text-brand-primary font-black text-lg mt-2">{p.price} <span className="text-xs text-text-muted font-bold">ج.م</span></p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                  services.length === 0 ? <EmptyState text="لا توجد خدمات معروضة حالياً" icon={MonitorPlay} /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.map(s => (
                        <Link key={s.id} to={`/services/${s.id}`} className="group bg-surface-primary rounded-2xl border border-border-subtle overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                          <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                            {s.image_url ? <img src={s.image_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <MonitorPlay className="w-12 h-12 text-slate-200 m-auto mt-12" />}
                          </div>
                          <div className="p-4">
                            <h3 className="font-black text-text-primary text-sm mb-1 line-clamp-1">{s.title}</h3>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-brand-primary font-black">{s.price} <span className="text-xs text-text-muted font-bold">ج.م</span></p>
                              <span className="text-[10px] text-text-muted font-bold">{s.delivery_time_days} أيام تسليم</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                  jobs.length === 0 ? <EmptyState text="لا توجد وظائف منشورة حالياً" icon={Briefcase} /> : (
                    <div className="space-y-4">
                      {jobs.map(j => (
                        <Link key={j.id} to={`/jobs/${j.id}`} className="block bg-surface-primary rounded-2xl border border-border-subtle p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                              <Briefcase className="w-6 h-6 text-brand-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-text-primary mb-1 group-hover:text-brand-primary transition-colors">{j.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted font-bold">
                                {j.company_name && <span>{j.company_name}</span>}
                                <Badge variant={j.status === 'Open' ? 'success' : 'secondary'} size="sm">{j.status === 'Open' ? 'متاحة' : 'مغلقة'}</Badge>
                                <Badge variant="info" size="sm">{j.job_type}</Badge>
                                {j.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                )}

                {/* Posts Tab */}
                {activeTab === 'posts' && (
                  posts.length === 0 ? <EmptyState text="لا توجد منشورات حالياً" icon={MessageCircle} /> : (
                    <div className="space-y-4">
                      {posts.map(p => (
                        <div key={p.id} className="bg-surface-primary rounded-2xl border border-border-subtle p-5">
                          <p className="text-text-secondary font-bold text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">{p.content}</p>
                          <div className="flex items-center gap-4 mt-4 text-xs text-text-muted font-bold">
                            <span>{new Date(p.created_at).toLocaleDateString('ar-EG')}</span>
                            <span>❤️ {p.likes_count || 0}</span>
                            <span>💬 {p.comments_count || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>

      </motion.div>
    </PageContainer>
  );
};

const EmptyState = ({ text, icon: Icon }: { text: string; icon: typeof Package }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-slate-300" />
    </div>
    <p className="text-text-muted font-bold">{text}</p>
  </div>
);
