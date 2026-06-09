import { motion } from 'framer-motion';
import { BookOpen, Map, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';

export const StudentsAlumniTab = () => {
    const categories = [
        {
            title: 'الكورسات',
            description: 'تصفح مكتبة شاملة من الدورات المتخصصة في مختلف المجالات والعلوم.',
            icon: BookOpen,
            href: '/courses/browse',
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/10'
        },
        {
            title: 'مسارات التعلم',
            description: 'مسارات متكاملة تأخذك من الصفر حتى الاحتراف.',
            icon: Map,
            href: '/learning-paths',
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        },
        {
            title: 'تدريبات وورش العمل',
            description: 'حضور ورش عمل وتدريبات عملية لتطوير مهاراتك بشكل احترافي.',
            icon: Users,
            href: '/workshops',
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        }
    ];

    return (
        <PageContainer maxWidth="xl">
            <PageHeader 
                title="التعليم والتدريب"
                description="ابدأ رحلة التعلم الخاصة بك مع أفضل الكورسات والمسارات المهنية المتخصصة."
                icon={BookOpen}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {categories.map((cat, index) => (
                    <Link to={cat.href} key={index}>
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-[32px] border border-border-default shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group"
                        >
                            <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <cat.icon className={`w-7 h-7 ${cat.color}`} />
                            </div>
                            <h3 className="text-xl font-black text-text-primary mb-3 group-hover:text-brand-primary transition-colors">{cat.title}</h3>
                            <p className="text-text-secondary font-bold leading-relaxed mb-8 flex-1">{cat.description}</p>
                            
                            <div className="flex items-center gap-2 text-sm font-black text-brand-primary mt-auto">
                                تصفح الآن
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </PageContainer>
    );
};
