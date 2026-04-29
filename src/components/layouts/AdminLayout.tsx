import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Tag,
    Store,
    Briefcase,
    MonitorPlay,
    CheckCircle2,
    Leaf,
    Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const { signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const sidebarRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    // Focus restoration when menu closes
    useEffect(() => {
        if (!isMenuOpen) {
            menuButtonRef.current?.focus();
        }
    }, [isMenuOpen]);

    // Focus trapping for mobile menu
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isMenuOpen) return;

            if (e.key === 'Escape') {
                setIsMenuOpen(false);
                return;
            }

            if (e.key === 'Tab') {
                const focusableElements = sidebarRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    const navigation = [
        { name: 'الرئيسية', href: '/admin', icon: LayoutDashboard },
        { name: 'الدورات التعليمية', href: '/admin/courses', icon: BookOpen },
        { name: 'التصنيفات', href: '/admin/categories', icon: Tag },
        { name: 'المنتجات', href: '/admin/products', icon: Store },
        { name: 'الوظائف', href: '/admin/jobs', icon: Briefcase },
        { name: 'الخدمات', href: '/admin/services', icon: MonitorPlay },
        { name: 'المستخدمين', href: '/admin/users', icon: Users },
        { name: 'طلبات الالتحاق', href: '/admin/enrollments', icon: CheckCircle2 },
        { name: 'طلبات الشهادات', href: '/admin/certificates', icon: Trophy },
        { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex" dir="rtl">
            {/* Menu Toggle Button */}
            <button
                ref={menuButtonRef}
                onClick={() => {
                    setIsMenuOpen(true);
                    setIsDesktopSidebarOpen(true);
                }}
                aria-label="افتح القائمة الجانبية"
                aria-expanded={isMenuOpen}
                className={`fixed top-4 right-4 z-40 bg-brand-primary text-white p-3 rounded-button shadow-lg hover:bg-brand-primary-hover transition-colors ${isDesktopSidebarOpen ? 'lg:hidden' : 'lg:block'}`}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Collapsible on Desktop, Drawer on Mobile) */}
            <aside
                ref={sidebarRef}
                role="dialog"
                aria-modal={isMenuOpen}
                aria-label="القائمة الجانبية للإدارة"
                className={`fixed inset-y-0 right-0 z-50 w-64 sm:w-72 bg-brand-bg shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${isDesktopSidebarOpen ? 'lg:translate-x-0' : 'lg:translate-x-full'}`}
            >
                <div className="p-6 flex items-center justify-between border-b border-brand-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-brand-primary-hover to-brand-accent rounded-2xl shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-all duration-300">
                            <Leaf className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white leading-tight">جذور</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            setIsDesktopSidebarOpen(false);
                        }}
                        aria-label="إغلاق القائمة الجانبية"
                        className="p-2 text-brand-primary-light/70 hover:bg-brand-primary/10 hover:text-white rounded-button transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
                    <nav className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href || (location.pathname.startsWith('/admin/courses/') && item.href === '/admin/courses');
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-4 px-5 py-3.5 rounded-button font-bold transition-all duration-200 group ${isActive
                                        ? 'bg-brand-primary/20 text-white shadow-inner'
                                        : 'text-brand-primary-light/60 hover:bg-brand-primary/10 hover:text-white'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-primary' : 'text-brand-primary/50 group-hover:text-brand-primary'}`} />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 border-t border-brand-primary/10 bg-brand-bg">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-3 px-4 py-3 w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-button font-bold transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 w-full min-h-screen transition-all duration-300 ${isDesktopSidebarOpen ? 'lg:pr-64 sm:lg:pr-72' : 'lg:pr-0'}`}>
                <div className="p-4 sm:p-6 md:p-10 pt-20 lg:pt-10 max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
