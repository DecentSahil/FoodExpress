import React, { useState } from 'react';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Layers,
    ClipboardList,
    Bell,
    LogOut,
    Menu as MenuIcon,
    X,
    Search,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }) => (
    <Link
        to={href}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
            active
                ? "bg-amber-500/10 text-amber-500 border-l-2 border-amber-500"
                : "text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
        )}
    >
        <Icon size={20} className={cn("shrink-0", !active && "group-hover:text-amber-500/80 transition-colors")} />
        {!collapsed && (
            <span className="text-sm font-medium tracking-wide">{label}</span>
        )}
    </Link>
);

const DashboardLayout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { label: 'Categories', icon: Layers, href: '/categories' },
        { label: 'Menu Items', icon: UtensilsCrossed, href: '/menu' },
        { label: 'Orders', icon: ClipboardList, href: '/orders' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col bg-black border-r border-white/5 transition-all duration-500 z-50",
                    isSidebarCollapsed ? "w-20" : "w-72"
                )}
            >
                <div className="p-8 flex items-center justify-between">
                    {!isSidebarCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                Spice<span className="text-amber-500">Haven</span>
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-1">Admin Panel</span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-gray-500 hover:text-white transition-colors">
                        {isSidebarCollapsed ? <MenuIcon size={20} /> : <X size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            {...item}
                            active={pathname === item.href}
                            collapsed={isSidebarCollapsed}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all group",
                            isSidebarCollapsed && "justify-center"
                        )}
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        {!isSidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Navbar */}
                <header className="h-20 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 flex items-center justify-between z-40">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)}>
                            <MenuIcon size={24} />
                        </button>
                        <span className="text-lg font-display font-bold text-amber-500">SH</span>
                    </div>

                    <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 w-96">
                        <Search size={18} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search analytics, orders..."
                            className="bg-transparent border-none outline-none text-sm w-full font-light"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer group">
                            <Bell size={20} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] flex items-center justify-center font-bold text-black border-2 border-black">2</span>
                        </div>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{user?.restaurantName || 'Spice Haven'}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Admin</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                                <User size={18} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] lg:hidden"
                    >
                        <div className="flex flex-col h-full p-8">
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-2xl font-display font-bold text-amber-500 tracking-widest uppercase">SPICE HAVEN</span>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={32} />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-6">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "text-3xl font-display uppercase tracking-widest",
                                            pathname === item.href ? "text-amber-500" : "text-gray-500"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;
