import { useState, useEffect } from 'react';
import { workshopService } from '../../../services/workshopService';
import { motion } from 'framer-motion';
import { PlayCircle, Calendar, Users, MapPin, Sparkles, ChevronLeft } from 'lucide-react';
import { Card } from '../../../components/shared/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';

export const WorkshopsPage = () => {
    const [workshops, setWorkshops] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const { data, error } = await workshopService.getWorkshops();

                if (error) throw new Error(error);
                setWorkshops(data || []);
            } catch (error) {
                console.error('Error fetching workshops:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkshops();
    }, []);

    if (isLoading) {
        return <LoadingSpinner message="جاري تحميل التدريبات والورش..." />;
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="relative rounded-[3rem] overflow-hidden bg-brand-primary p-12 text-white">
                <div className="relative z-10 max-w-3xl space-y-6">
                    <Badge className="bg-white/10 text-white border-white/20">
                        <Sparkles className="w-3 h-3 ml-2" />
                        تطوير المهارات العملية
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight">
                        تدريبات وورش عمل تفاعلية
                    </h1>
                    <p className="text-xl text-white/80 font-bold leading-relaxed">
                        شارك في ورش عمل مباشرة ودورات تدريبية عملية يقدمها خبراء في شتى المجالات والمهارات لتعزيز مسارك المهني.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-10">
                {workshops.length > 0 ? (
                    workshops.map((workshop) => (
                        <Card key={workshop.id} className="p-0 overflow-hidden group border-border-default hover:border-brand-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-primary/5">
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-80 h-64 md:h-auto bg-slate-100 relative shrink-0 overflow-hidden">
                                    {workshop.image_url ? (
                                        <img src={workshop.image_url} alt={workshop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <Calendar className="w-16 h-16 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Badge variant="primary" className="bg-brand-primary/90 text-white border-none shadow-lg">مباشر</Badge>
                                        <Badge variant="secondary" className="bg-white/90 text-slate-700 border-none shadow-lg">جديد</Badge>
                                    </div>
                                </div>
                                <div className="p-10 flex flex-col justify-between flex-1">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-2 rtl:space-x-reverse">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 overflow-hidden">
                                                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                                                    </div>
                                                ))}
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-primary text-white flex items-center justify-center text-[10px] font-black">
                                                    +{workshop.attendees_count || 12}
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-text-muted uppercase tracking-widest">مشارك في هذه الورشة</span>
                                        </div>

                                        <h3 className="text-3xl font-black text-text-primary group-hover:text-brand-primary transition-colors">
                                            {workshop.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-8">
                                            <div className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                                                <div className="p-2 bg-slate-50 rounded-xl text-brand-primary"><Calendar className="w-5 h-5" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-text-muted uppercase font-black">التاريخ والوقت</span>
                                                    <span>15 يونيو 2024 - 4:00 مساءً</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                                                <div className="p-2 bg-slate-50 rounded-xl text-brand-primary"><MapPin className="w-5 h-5" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-text-muted uppercase font-black">الموقع</span>
                                                    <span>{workshop.location || 'أونلاين (Zoom)'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-text-muted uppercase tracking-widest">المحاضر:</span>
                                            <span className="text-sm font-black text-text-primary">د. أحمد علي</span>
                                        </div>
                                        <Button variant="primary" size="lg" className="px-10 rounded-2xl shadow-lg shadow-brand-primary/20" icon={ChevronLeft} iconPosition="right">
                                            حجز مقعدك الآن
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-border-default">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Users className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-text-primary">لا توجد ورش عمل متاحة حالياً</h3>
                            <p className="text-text-secondary font-bold">يتم حالياً التنسيق لورش عمل جديدة، تابعنا لتكون أول المسجلين.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
