import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Layers, X, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../utils/cn';

const API_BASE = 'http://localhost:8085';

const getAuthHeaders = (isJson = true) => {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (isJson) headers['Content-Type'] = 'application/json';
    return headers;
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Add modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [nameError, setNameError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Edit inline
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Delete confirmation
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/restaurant/category/my`, {
                headers: getAuthHeaders(false),
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // ── CREATE ──────────────────────────────────────────────────────────────────
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) { setNameError('Category name is required'); return; }
        setNameError('');
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/restaurant/category`, {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ categoryName: categoryName.trim() }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Error ${res.status}`);
            }
            const newCat = await res.json();
            setCategories(prev => [...prev, newCat]);
            toast.success('Category created!');
            handleClose();
        } catch (err) {
            toast.error(err.message || 'Failed to create category');
        } finally {
            setIsSaving(false);
        }
    };

    // ── UPDATE ──────────────────────────────────────────────────────────────────
    const handleUpdate = async (id) => {
        if (!editName.trim()) return;
        setIsUpdating(true);
        try {
            const res = await fetch(`${API_BASE}/restaurant/category/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ categoryName: editName.trim() }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Error ${res.status}`);
            }
            const updated = await res.json();
            setCategories(prev =>
                prev.map(c => c.id === id ? { ...c, categoryName: updated.categoryName || editName.trim() } : c)
            );
            toast.success('Category updated!');
            setEditingId(null);
        } catch (err) {
            toast.error(err.message || 'Failed to update category');
        } finally {
            setIsUpdating(false);
        }
    };

    // ── DELETE ──────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/restaurant/category/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(false),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Error ${res.status}`);
            }
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success('Category deleted!');
            setDeletingId(null);
        } catch (err) {
            toast.error(err.message || 'Failed to delete category');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setCategoryName('');
        setNameError('');
    };

    const filteredCategories = categories.filter(c =>
        (c.categoryName || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h4 className="text-amber-500 uppercase tracking-widest text-xs mb-2">Management</h4>
                    <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight">Food Categories</h2>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-[32px] border border-white/5 max-w-xl">
                <Search size={22} className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-base w-full font-light"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-[40px]" />)
                ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((cat, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={cat.id}
                            className="bg-black border border-white/5 p-8 rounded-[40px] hover:border-amber-500/20 transition-all group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-white/5 rounded-2xl text-amber-500">
                                        <Layers size={24} />
                                    </div>
                                    {/* Action buttons */}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingId(cat.id); setEditName(cat.categoryName); setDeletingId(null); }}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setDeletingId(cat.id); setEditingId(null); }}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-600 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Edit mode */}
                                {editingId === cat.id ? (
                                    <div className="flex gap-2 items-center mb-3">
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                                            className="flex-1 bg-white/5 border border-amber-500/50 rounded-xl px-3 py-2 text-sm outline-none text-white"
                                        />
                                        <button
                                            onClick={() => handleUpdate(cat.id)}
                                            disabled={isUpdating}
                                            className="p-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-black transition-colors"
                                        >
                                            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white/10 rounded-xl text-gray-500">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : deletingId === cat.id ? (
                                    /* Delete confirmation */
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-400 mb-3">Delete <span className="text-white font-semibold">{cat.categoryName}</span>?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                disabled={isDeleting}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                                            >
                                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(null)}
                                                className="flex-1 border border-white/10 text-gray-400 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <h3 className="text-2xl font-display font-medium mb-3">{cat.categoryName}</h3>
                                )}

                                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                                    <span className="text-gray-600">ID</span>
                                    <span className="text-gray-600 font-mono text-[9px] truncate max-w-[160px]">{cat.id}</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-12 -right-12 text-white/[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                                <Layers size={160} />
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-gray-700 font-display text-2xl uppercase tracking-[0.2em] border-2 border-dashed border-white/5 rounded-[40px]">
                        No categories found
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 shadow-2xl"
                        >
                            <button onClick={handleClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <div className="mb-10">
                                <p className="text-amber-500 text-[10px] uppercase font-bold tracking-[0.3em] mb-2">Resource Creation</p>
                                <h3 className="text-3xl font-display font-bold uppercase">New Category</h3>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 ml-1">Category Name</label>
                                    <input
                                        type="text"
                                        value={categoryName}
                                        onChange={e => { setCategoryName(e.target.value); setNameError(''); }}
                                        placeholder="e.g. Snacks"
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 outline-none focus:border-amber-500 transition-all font-light text-sm"
                                    />
                                    {nameError && <p className="text-xs text-red-500 ml-1">{nameError}</p>}
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 border border-white/10 text-gray-400 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Categories;
