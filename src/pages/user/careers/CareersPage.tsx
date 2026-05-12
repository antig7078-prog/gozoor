import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MonitorPlay, Package, Sparkles } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';

// Import existing pages as sub-components
import { JobsListingPage } from '../jobs/JobsListingPage';
import { ServicesPage } from '../services/ServicesPage';
import { FreelanceProductsPage } from './FreelanceProductsPage';


type MainTab = 'jobs' | 'freelance';
type FreelanceSubTab = 'services' | 'products';

export const CareersPage = () => {
    const [mainTab, setMainTab] = useState<MainTab>('jobs');
    const [freelanceSubTab, setFreelanceSubTab] = useState<FreelanceSubTab>('services');

    const mainTabs = [
        { id: 'jobs' as MainTab, label: 'الوظائف', icon: Briefcase, desc: 'فرص عمل في كبرى المؤسسات الزراعية' },
        { id: 'freelance' as MainTab, label: 'العمل الحر', icon: MonitorPlay, desc: 'خدمات ومنتجات المستقلين' },
    ];

    const freelanceTabs = [
        { id: 'services' as FreelanceSubTab, label: 'الخدمات', icon: MonitorPlay },
        { id: 'products' as FreelanceSubTab, label: 'منتجاتي', icon: Package },
    ];

    return (
        <div>
            {/* Main Tabs Header */}
            <div className="bg-white border-b border-border-subtle sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-2 sm:gap-4 py-3 sm:py-4 overflow-x-auto hide-scrollbar">
                        {mainTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setMainTab(tab.id)}
                                className={`relative flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-sm sm:text-base transition-all duration-300 whitespace-nowrap ${mainTab === tab.id
                                        ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20'
                                        : 'bg-surface-primary text-text-secondary hover:bg-brand-primary/5 hover:text-brand-primary'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Freelance Sub-Tabs */}
            <AnimatePresence mode="wait">
                {mainTab === 'freelance' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/80 backdrop-blur-md border-b border-border-subtle"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className="flex items-center gap-2 py-3 overflow-x-auto hide-scrollbar">
                                {freelanceTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFreelanceSubTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${freelanceSubTab === tab.id
                                                ? 'bg-brand-bg text-white shadow-lg'
                                                : 'bg-surface-primary text-text-muted hover:text-text-primary hover:bg-slate-100'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={mainTab === 'freelance' ? `freelance-${freelanceSubTab}` : mainTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                >
                    {mainTab === 'jobs' && <JobsContent />}
                    {mainTab === 'freelance' && freelanceSubTab === 'services' && <ServicesContent />}
                    {mainTab === 'freelance' && freelanceSubTab === 'products' && <FreelanceProductsPage />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Wrapper to render jobs content inline (without its own PageContainer wrapper colliding)
const JobsContent = () => <JobsListingPage />;
const ServicesContent = () => <ServicesPage />;
