import { useState, useEffect } from 'react';
import { courseService } from '../../../services/courseService';
import { motion } from 'framer-motion';
import { Sparkles, Map, ChevronLeft, BookOpen, Clock, Award } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { Card } from '../../../components/shared/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { Link } from 'react-router-dom';

export const LearningPathsPage = () => {
    const [paths, setPaths] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPaths = async () => {
            try {
                // Fetch learning paths with their courses
                const { data, error } = await courseService.getLearningPaths();

                if (error) throw new Error(error);
                setPaths(data || []);
            } catch (error) {
                console.error('Error fetching learning paths:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaths();
    }, []);

    if (isLoading) {
        return <LoadingSpinner message="جاري تحميل مسارات التعلم..." />;
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section */}
            <div className="relative rounded-[3rem] overflow-hidden bg-brand-bg p-12 text-white">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-brand-primary blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-primary blur-3xl rounded-full translate-x-1/3 translate-y-1/3" />
                </div>
                
                <div className="relative z-10 max-w-3xl space-y-6">
                    <Badge variant="primary" className="bg-white/10 text-brand-primary-light border-white/20">
                        <Sparkles className="w-3 h-3 ml-2" />
                        خارطة طريق لنجاحك
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight">
                        مسارات التعلم المخصصة
                    </h1>
                    <p className="text-xl text-slate-200 font-bold leading-relaxed opacity-90">
                        مجموعات مختارة بعناية من الدورات التدريبية المصممة لتأهيلك لتخصص معين في المجال المهني والتقني من الصفر وحتى الاحتراف.
                    </p>
                </div>
            </div>

            {/* Paths Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {paths.length > 0 ? (
                    paths.map((path) => (
                        <Card key={path.id} className="p-0 overflow-hidden group hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 border-border-default hover:border-brand-primary/20">
                            <div className="flex flex-col h-full">
                                {/* Path Banner */}
                                <div className="h-48 bg-slate-100 relative overflow-hidden">
                                    {path.thumbnail_url ? (
                                        <img src={path.thumbnail_url} alt={path.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <Map className="w-20 h-20 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-6 right-6">
                                        <Badge variant="primary" className="bg-white/90 backdrop-blur-md text-brand-primary border-none shadow-lg">
                                            {path.learning_path_courses?.length || 0} دورات تدريبية
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6 flex-1 flex flex-col">
                                    <div>
                                        <h3 className="text-2xl font-black text-text-primary mb-3 group-hover:text-brand-primary transition-colors">
                                            {path.title}
                                        </h3>
                                        <p className="text-text-secondary font-bold leading-relaxed line-clamp-3">
                                            {path.description}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-6 text-xs font-black text-text-muted uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-slate-50 rounded-lg"><Clock className="w-4 h-4 text-brand-primary" /></div>
                                                <span>+20 ساعة</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-slate-50 rounded-lg"><Award className="w-4 h-4 text-brand-primary" /></div>
                                                <span>شهادة معتمدة</span>
                                            </div>
                                        </div>

                                        <Button 
                                            variant="secondary" 
                                            size="sm"
                                            className="rounded-xl border-slate-200 hover:border-brand-primary hover:text-brand-primary"
                                            icon={ChevronLeft}
                                            iconPosition="right"
                                        >
                                            تفاصيل المسار
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-border-default">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Map className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-text-primary">لا توجد مسارات تعلم حالياً</h3>
                            <p className="text-text-secondary font-bold">انتظرنا قريباً، نحن نقوم بتجهيز مسارات تعليمية مميزة لك.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
