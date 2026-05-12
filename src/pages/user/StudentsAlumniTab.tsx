import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Map, Users, Sparkles } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

// Import sub-tab components
import { UserCourses } from './UserCourses';
import { LearningPathsPage } from './learning-paths/LearningPathsPage';
import { WorkshopsPage } from './workshops/WorkshopsPage';

export const StudentsAlumniTab = () => {
    const [activeSubTab, setActiveSubTab] = useState('courses');

    const subTabs = [
        { id: 'courses', label: 'الكورسات', icon: BookOpen },
        { id: 'paths', label: 'مسارات التعلم', icon: Map, badge: 'جديد' },
        { id: 'workshops', label: 'تدريبات وورش العمل', icon: Users },
    ];

    const renderSubTabContent = () => {
        switch (activeSubTab) {
            case 'paths':
                return <LearningPathsPage />;
            case 'workshops':
                return <WorkshopsPage />;
            case 'courses':
            default:
                return (
                    <div className="-mt-10">
                        {/* We use UserCourses but might want to hide its header if possible.
                            For now, let's assume it works well. */}
                        <UserCourses />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-12">
            {/* Sub-Tabs Navigation */}
            <div className="flex items-center gap-2 p-1.5 bg-surface-primary border border-border-default rounded-3xl w-fit">
                {subTabs.map((tab) => {
                    const isActive = activeSubTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                                isActive ? 'text-white' : 'text-text-secondary hover:text-brand-primary'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeSubTabPill"
                                    className="absolute inset-0 bg-brand-primary shadow-md shadow-brand-primary/20"
                                    style={{ borderRadius: '1rem' }}
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                            <tab.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="relative z-10">{tab.label}</span>
                            {tab.badge && !isActive && (
                                <span className="absolute -top-1 -left-1 bg-brand-primary text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSubTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderSubTabContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
