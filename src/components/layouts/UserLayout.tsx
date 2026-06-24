import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Compass,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    X,
    ShoppingBag,
    Briefcase,
    FileText,
    MonitorPlay,
    ShoppingCart,
    Leaf,
    Users,
    Package,
    Map,
    Calendar,
    Heart,
    MessageSquare,
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../lib/store/cartStore';
import { messagingService } from '../../services/messagingService';
import { notificationService } from '../../services/notificationService';
import logoImg from '../../assets/logo.jpeg';

export const UserLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const { user, signOut } = useAuth();
    const { totalItems } = useCartStore();
    const location = useLocation();
    const navigate = useNavigate();

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const sidebarRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const fetchCounts = async () => {
        if (!user) return;
        try {
            const { count: msgCount } = await messagingService.getUnreadCount();
            setUnreadMessages(msgCount || 0);

            const { data: notifData } = await notificationService.getNotifications();
            if (notifData) {
                const notifCount = notifData.filter(n => !n.is_read).length;
                setUnreadNotifications(notifCount);
            }
        } catch {}
    };

    useEffect(() => {
        fetchCounts();
        const interval = setInterval(fetchCounts, 15000);
        return () => clearInterval(interval);
    }, [user]);

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

    const navigationGroups = [
        {
            title: 'العامة',
            items: [
                { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
                { name: 'الرسائل', href: '/messages', icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : null },
                { name: 'الإشعارات', href: '/notifications', icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications : null },
            ]
        },
        {
            title: 'التعلم والتطوير',
            items: [
                { name: 'مسارات التعلم', href: '/learning-paths', icon: Map },
                { name: 'استكشاف الدورات', href: '/courses', icon: Compass },
                { name: 'دوراتي التعليمية', href: '/my-courses', icon: BookOpen },
                { name: 'ورش العمل والتدريبات', href: '/workshops', icon: Calendar },
                { name: 'المفضلة', href: '/favorites', icon: Heart },
            ]
        },
        {
            title: 'السوق والمتجر',
            items: [
                { name: 'المتجر', href: '/marketplace', icon: ShoppingBag },
                { name: 'السلة', href: '/cart', icon: ShoppingCart, badge: totalItems > 0 ? totalItems : null },
                { name: 'طلباتي', href: '/market-orders', icon: Package },
            ]
        },
        {
            title: 'البيع والخدمات',
            items: [
                { name: 'إدارة منتجاتي', href: '/user-products', icon: Package },
                { name: 'طلبات العملاء', href: '/customer-orders', icon: Users },
                { name: 'إدارة خدماتي', href: '/user-services', icon: MonitorPlay },
                { name: 'طلبات الخدمات', href: '/service-orders', icon: FileText },
            ]
        },
        {
            title: 'الوظائف والتوظيف',
            items: [
                { name: 'الوظائف والعمل الحر', href: '/careers', icon: Briefcase },
                { name: 'وظائفي المعروضة', href: '/my-jobs', icon: Briefcase },
                { name: 'طلبات التوظيف', href: '/my-applications', icon: FileText },
            ]
        },
        {
            title: 'التفاعل والحساب',
            items: [
                { name: 'المجتمع الزراعي', href: '/community', icon: Users },
                { name: 'الملف الشخصي', href: '/profile', icon: Settings },
            ]
        }
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
                aria-label="القائمة الجانبية للمستخدم"
                className={`fixed inset-y-0 right-0 z-50 w-64 sm:w-72 bg-brand-bg shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${isDesktopSidebarOpen ? 'lg:translate-x-0' : 'lg:translate-x-full'}`}
            >
                <div className="p-6 flex items-center justify-between border-b border-brand-primary/10">
                    <div className="flex items-center justify-center w-full">
                        <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-all duration-300 overflow-hidden">
                            <img src={logoImg} alt="جذور" className="w-full h-full object-cover" />
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

                <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar space-y-6">
                    {navigationGroups.map((group) => (
                        <div key={group.title} className="space-y-2">
                            <h2 className="px-4 text-[10px] font-black text-brand-primary-light/40 uppercase tracking-widest">
                                {group.title}
                            </h2>
                            <nav className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.href || (location.pathname.startsWith('/courses/') && item.href === '/courses');
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center justify-between px-4 py-2.5 rounded-button font-bold transition-all duration-200 group ${isActive
                                                ? 'bg-brand-primary/20 text-white shadow-inner'
                                                : 'text-brand-primary-light/60 hover:bg-brand-primary/10 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-brand-primary' : 'text-brand-primary/50 group-hover:text-brand-primary'}`} />
                                                <span className="text-xs">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="bg-brand-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
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
            <main className={`flex-1 w-full min-h-screen transition-all duration-300 ${isDesktopSidebarOpen ? 'lg:pr-72' : 'lg:pr-0'}`}>
                <div className="p-4 sm:p-6 md:p-10 pt-20 lg:pt-10 max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
