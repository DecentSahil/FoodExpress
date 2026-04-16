import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Filter, Calendar, ChevronLeft, ChevronRight, CheckCircle, Clock, Package, MoveRight, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../utils/cn';

const Orders = () => {
    const [orders, setOrders] = useState([
        { id: '#8891', customer: 'Alexander Reed', amount: '$124.50', status: 'DELIVERED', items: ['Saffron Salmon x2', 'Vintage Cabernet'], time: '12:15 PM', type: 'Dine-In' },
        { id: '#8892', customer: 'Elena Gilbert', amount: '$86.20', status: 'PREPARING', items: ['Truffle Kebab x1', 'Rose Sorbet x2'], time: '12:30 PM', type: 'Takeaway' },
        { id: '#8893', customer: 'Damon Salvatore', amount: '$210.00', status: 'PENDING', items: ['Imperial Lobster x1', 'Wine Bottle x1'], time: '12:45 PM', type: 'Dine-In' },
    ]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const statusColors = {
        PENDING: 'bg-amber-500/10 text-amber-500',
        PREPARING: 'bg-blue-500/10 text-blue-500',
        READY: 'bg-emerald-500/10 text-emerald-500',
        DELIVERED: 'bg-gray-500/10 text-gray-500',
    };

    const updateStatus = (id, newStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        toast.info(`Order ${id} is now ${newStatus}`);
    };

    const filteredOrders = orders.filter(o =>
        (statusFilter === 'ALL' || o.status === statusFilter) &&
        (o.customer.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm))
    );

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h4 className="text-amber-500 uppercase tracking-widest text-xs mb-2">Operations</h4>
                    <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight">Active Command</h2>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-sm">
                    <Calendar size={18} className="text-amber-500" />
                    <span className="font-medium font-display">Live Tracking</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
                <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-[32px] border border-white/5 max-w-xl w-full">
                    <Search size={22} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search Order ID or Client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-base w-full font-light px-2"
                    />
                </div>

                <div className="flex gap-2 p-1 bg-black border border-white/5 rounded-2xl overflow-x-auto scrollbar-hide">
                    {['ALL', 'PENDING', 'PREPARING', 'READY', 'DELIVERED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all",
                                statusFilter === s ? "bg-white text-black font-extrabold" : "text-gray-500 hover:text-white"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                    {filteredOrders.map((order, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={order.id}
                            className={cn(
                                "bg-black border p-8 rounded-[40px] flex flex-col gap-6 relative group overflow-hidden transition-all duration-500",
                                order.status === 'PENDING' ? 'border-amber-500/30 ring-1 ring-amber-500/20' : 'border-white/5'
                            )}
                        >
                            {order.status === 'PENDING' && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 animate-pulse"></div>
                            )}

                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.3em] mb-1 block">Transaction</span>
                                    <h3 className="text-xl font-display font-medium text-amber-500">{order.id}</h3>
                                </div>
                                <div className={cn("text-[8px] uppercase font-black px-3 py-1 rounded-full tracking-[0.1em] border border-current", statusColors[order.status])}>
                                    {order.status}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                        <MapPin size={14} />
                                    </div>
                                    <span className="text-sm font-medium uppercase tracking-wide">{order.customer}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                        <Clock size={14} />
                                    </div>
                                    <span className="text-xs text-gray-500 uppercase tracking-widest">{order.time} • {order.type}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl flex flex-col gap-3">
                                <p className="text-[9px] uppercase font-bold text-gray-700 tracking-[0.2em] flex items-center gap-2">
                                    <Package size={10} /> Manifest Details
                                </p>
                                <ul className="space-y-2">
                                    {order.items.map((item, i) => (
                                        <li key={i} className="text-xs text-white/70 font-light flex justify-between">
                                            <span>{item}</span>
                                            <CheckCircle size={12} className="text-white/20" />
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="font-display font-bold text-lg">{order.amount}</div>
                                <div className="relative inline-block">
                                    <select
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        value={order.status}
                                        className="bg-white/5 border border-white/10 text-[10px] rounded-lg px-4 py-2 font-bold uppercase tracking-widest outline-none hover:bg-white/10 cursor-pointer transition-all"
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="PREPARING">PREPARING</option>
                                        <option value="READY">READY</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination Mock */}
            <div className="flex justify-center items-center gap-6 pt-12">
                <button className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/5 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {[1, 2, 3].map(p => (
                        <button key={p} className={cn("w-12 h-12 rounded-2xl font-bold transition-all", p === 1 ? "bg-white text-black" : "text-gray-500 hover:text-white")}>
                            {p}
                        </button>
                    ))}
                </div>
                <button className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/5 transition-all">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Orders;
