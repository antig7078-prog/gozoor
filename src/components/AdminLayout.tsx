import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldAlert,
    Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'الرئيسية', href: '/admin', icon: LayoutDashboard },
        { name: 'الدورات التعليمية', href: '/admin/courses', icon: BookOpen },
        { name: 'التصنيفات', href: '/admin/categories', icon: Tag },
        { name: 'المستخدمين', href: '/admin/users', icon: Users },
        { name: 'الطلبات', href: '/admin/orders', icon: CreditCard },
        { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50" dir="rtl">

            {/* Floating Menu Button */}
            <button
                onClick={() => setIsMenuOpen(true)}
                className="fixed top-6 right-6 z-40 bg-emerald-900 text-white p-3.5 rounded-full shadow-2xl hover:bg-emerald-800 hover:scale-105 transition-all duration-300"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Main Content Area - Full Width */}
            <main className="w-full min-h-screen p-6 md:p-10 pt-28 md:pt-14">
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
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                            className="fixed top-0 right-0 bottom-0 w-80 bg-emerald-950 z-50 shadow-[0_0_40px_rgba(0,0,0,0.3)] flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-emerald-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">🌿</div>
                                    <div>
                                        <h1 className="text-xl font-black text-white leading-tight">جذور للتعليم</h1>
                                        <p className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                            <ShieldAlert className="w-3 h-3" /> لوحة الإدارة
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-emerald-200 hover:bg-emerald-800 hover:text-white rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-8 px-4">
                                <nav className="space-y-2">
                                    {navigation.map((item) => {
                                        const isActive = location.pathname === item.href || (location.pathname.startsWith('/admin/courses/') && item.href === '/admin/courses');
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-200 group ${isActive
                                                    ? 'bg-emerald-800 text-white shadow-inner'
                                                    : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-emerald-400' : 'text-emerald-400/70 group-hover:text-emerald-400'}`} />
                                                <span className="text-sm">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="p-6 border-t border-emerald-800/50 bg-emerald-950">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center justify-center gap-3 px-4 py-3 w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all group"
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
