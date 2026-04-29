import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, LogIn, LayoutDashboard, ShoppingCart, Menu, X, Home, Compass, ShoppingBag, Briefcase, MonitorPlay } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../lib/store/cartStore';

/**
 * PublicBrowseLayout - A lightweight layout for public browsing pages
 * (courses, marketplace, services, jobs) that does NOT require auth.
 * Shows a top navbar with navigation and login/dashboard CTA.
 */
export const PublicBrowseLayout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { totalItems } = useCartStore();

    const navLinks = [
        { name: 'الرئيسية', href: '/', icon: Home },
        { name: 'الدورات', href: '/courses', icon: Compass },
        { name: 'المتجر', href: '/marketplace', icon: ShoppingBag },
        { name: 'الوظائف', href: '/jobs', icon: Briefcase },
        { name: 'خدمات المستقلين', href: '/services', icon: MonitorPlay },
    ];

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-slate-50" dir="rtl">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-subtle shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-tr from-brand-primary-hover to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform duration-300">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black text-brand-bg hidden sm:block">جذور</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                                        isActive(link.href)
                                            ? 'bg-brand-primary/10 text-brand-primary'
                                            : 'text-text-secondary hover:text-brand-primary hover:bg-surface-primary'
                                    }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Cart (only for logged in users) */}
                            {user && (
                                <Link
                                    to="/cart"
                                    className="relative p-2.5 text-text-secondary hover:text-brand-primary hover:bg-surface-primary rounded-xl transition-all"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-0.5 -left-0.5 bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary-hover transition-all shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden sm:inline">لوحة التحكم</span>
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary-hover transition-all shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>تسجيل الدخول</span>
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2.5 text-text-secondary hover:text-brand-primary hover:bg-surface-primary rounded-xl transition-all"
                                aria-label="القائمة"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden border-t border-border-subtle bg-white overflow-hidden"
                        >
                            <nav className="px-4 py-4 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                            isActive(link.href)
                                                ? 'bg-brand-primary/10 text-brand-primary'
                                                : 'text-text-secondary hover:text-brand-primary hover:bg-surface-primary'
                                        }`}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-10">
                <Outlet />
            </main>
        </div>
    );
};
