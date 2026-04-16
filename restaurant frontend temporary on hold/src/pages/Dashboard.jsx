import React from 'react';
import { LayoutDashboard, ShoppingBag, Utensils, Users, ArrowUpRight, ArrowDownRight, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
    <div className="glass-card p-6 hover:border-amber-500/30 transition-all group relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-3 bg-white/[0.03] rounded-2xl group-hover:scale-110 transition-transform ring-1 ring-white/5">
                <Icon className="text-amber-500" size={24} />
            </div>
            <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </div>
        </div>
        <div className="relative z-10">
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-display font-semibold tracking-tight">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const stats = [
        { title: 'Total Revenue', value: '$12,450.00', change: '+12.5%', isPositive: true, icon: LayoutDashboard },
        { title: 'Total Orders', value: '156', change: '+8.2%', isPositive: true, icon: ShoppingBag },
        { title: 'Avg. Order', value: '$79.80', change: '-2.4%', isPositive: false, icon: Utensils },
        { title: 'New Customers', value: '42', change: '+15.3%', isPositive: true, icon: Users },
    ];

    const recentOrders = [
        { id: '#8891', customer: 'Alexander Reed', amount: '$124.50', status: 'Delivered', time: '12 mins ago' },
        { id: '#8892', customer: 'Elena Gilbert', amount: '$86.20', status: 'In Kitchen', time: '18 mins ago' },
        { id: '#8893', customer: 'Damon Salvatore', amount: '$210.00', status: 'Pending', time: '25 mins ago' },
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h4 className="text-amber-500 uppercase tracking-widest text-xs font-semibold mb-2">Overview</h4>
                    <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">Executive Dashboard</h2>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-sm">
                    <Clock size={18} className="text-amber-500" />
                    <span className="font-medium">Feb 23, 2026</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-display font-semibold tracking-tight">Recent Orders</h3>
                        <button className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1">
                            View All <ArrowUpRight size={16} />
                        </button>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-xs text-gray-400 font-medium">
                                    <th className="px-6 py-5 font-medium">Order ID</th>
                                    <th className="px-6 py-5 font-medium">Customer</th>
                                    <th className="px-6 py-5 font-medium">Amount</th>
                                    <th className="px-6 py-5 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-light">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5 text-amber-500 font-medium">{order.id}</td>
                                        <td className="px-6 py-5 relative">
                                            <span className="font-medium text-gray-200">{order.customer}</span>
                                            <span className="absolute bottom-1 left-6 text-[10px] text-gray-500">{order.time}</span>
                                        </td>
                                        <td className="px-6 py-5 font-medium text-gray-200">{order.amount}</td>
                                        <td className="px-6 py-5 text-right">
                                            <span className={cn(
                                                "text-xs px-2.5 py-1 rounded-full font-medium",
                                                order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' :
                                                    order.status === 'In Kitchen' ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20' :
                                                        'bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20'
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-display font-semibold tracking-tight">Top Rated</h3>
                    </div>

                    <div className="glass-card p-6 space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 shrink-0">
                                    <img src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&h=200&fit=crop`} alt="Food" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex flex-col justify-center gap-1">
                                    <h4 className="text-sm font-bold uppercase">Saffron Salmon</h4>
                                    <div className="flex text-amber-500">
                                        <Star size={12} fill="currentColor" />
                                        <Star size={12} fill="currentColor" />
                                        <Star size={12} fill="currentColor" />
                                        <Star size={12} fill="currentColor" />
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">24 Sales today</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
