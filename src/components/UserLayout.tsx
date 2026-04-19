import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Compass,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    ShoppingBag,
    Briefcase,
    FileText,
    MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../lib/store/cartStore';

export const UserLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const { totalItems } = useCartStore();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
        { name: 'استكشاف الدورات', href: '/courses', icon: Compass },
        { name: 'دوراتي التعليمية', href: '/my-courses', icon: BookOpen },
        { name: 'المتجر', href: '/marketplace', icon: ShoppingBag },
        { name: 'الوظائف', href: '/jobs', icon: Briefcase },
        { name: 'طلبات التوظيف', href: '/my-applications', icon: FileText },
        { name: 'خدمات المستقلين', href: '/services', icon: MonitorPlay },
        { name: 'خدماتي', href: '/user-services', icon: MonitorPlay },
        { name: 'الملف الشخصي', href: '/profile', icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 relative" dir="rtl">

            {/* Floating Menu Button */}
            <button
                onClick={() => setIsMenuOpen(true)}
                className="fixed top-6 right-6 z-40 bg-white text-emerald-900 border border-slate-200 p-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Profile Avatar / Quick Info top-left */}
            <div className="fixed top-6 left-6 z-40 bg-white border border-slate-200 rounded-full py-2 px-3 shadow-lg flex items-center gap-3">
                <div className="hidden sm:block text-left ml-2">
                    <p className="text-xs font-bold text-slate-700">{user?.email?.split('@')[0] || 'المستخدم'}</p>
                </div>
                <Link to="/cart" className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                    {totalItems > 0 && (
                        <span className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {totalItems}
                        </span>
                    )}
                </Link>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm border-2 border-emerald-50">
                    <UserIcon className="w-5 h-5" />
                </div>
            </div>

            {/* Main Content Area - Full Width */}
            <main className="w-full min-h-screen pt-28 pb-12 px-4 md:px-8">
                <Outlet />
            </main>

            {/* Drawer Overlay Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                            className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-[0_0_50px_rgba(0,0,0,0.2)] flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">🌿</div>
                                    <div>
                                        <h1 className="text-xl font-black text-slate-800 leading-tight">جذور</h1>
                                        <p className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                                            طالب مسجل
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-8 px-4 bg-slate-50/50">
                                <nav className="space-y-2">
                                    {navigation.map((item) => {
                                        const isActive = location.pathname === item.href || (location.pathname.startsWith('/courses/') && item.href === '/courses');
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-200 group ${isActive
                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                                    : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-emerald-700'
                                                    }`}
                                            >
                                                <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                                                <span className="text-sm">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center justify-center gap-3 px-4 py-3 w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all group"
                                >
                                    <LogOut className="w-5 h-5" />
                                    تسجيل الخروج
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
