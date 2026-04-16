import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Loader2, Camera, ToggleLeft, ToggleRight, Leaf, Drumstick } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/Skeleton';
import AuthImage from '../components/ui/AuthImage';
import { cn } from '../utils/cn';

const API_BASE = 'http://localhost:8085';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Build full image URL from the filename returned by the backend
const getImageUrl = (filename) => {
    if (!filename) return null;
    return `${API_BASE}/restaurant/menu/image/${filename}`;
};

const MenuManagement = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isVeg, setIsVeg] = useState(true);

    // Form state
    const [formData, setFormData] = useState({ name: '', description: '', price: '', categoryId: '' });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catsRes, itemsRes] = await Promise.all([
                fetch(`${API_BASE}/restaurant/category/my`, { headers: getAuthHeaders() }),
                fetch(`${API_BASE}/restaurant/menu/my`, { headers: getAuthHeaders() }),
            ]);

            if (catsRes.ok) {
                const data = await catsRes.json();
                const cats = Array.isArray(data) ? data : [];
                setCategories(cats);
                if (cats.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
                }
            } else {
                toast.error('Could not load categories');
            }

            if (itemsRes.ok) {
                const data = await itemsRes.json();
                setItems(Array.isArray(data) ? data : []);
            } else {
                toast.error('Could not load menu items');
            }
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0)
            errs.price = 'Valid price is required';
        if (!formData.categoryId) errs.categoryId = 'Please select a category';
        return errs;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '', price: '', categoryId: categories[0]?.id || '' });
        setFormErrors({});
        setPreviewImage(null);
        setImageFile(null);
        setIsVeg(true);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setFormErrors(errs);
            return;
        }
        setFormErrors({});
        setIsSaving(true);

        try {
            const payload = new FormData();
            payload.append('name', formData.name.trim());
            payload.append('description', formData.description.trim());
            payload.append('price', Number(formData.price));
            payload.append('veg', isVeg);
            payload.append('categoryId', formData.categoryId);
            if (imageFile) {
                payload.append('image', imageFile);
            }

            const res = await fetch(`${API_BASE}/restaurant/menu`, {
                method: 'POST',
                headers: getAuthHeaders(),   // Do NOT set Content-Type; browser sets multipart boundary
                body: payload,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Error ${res.status}`);
            }

            const newItem = await res.json();
            setItems(prev => [...prev, newItem]);
            toast.success('Menu item added successfully!');
            handleModalClose();
        } catch (err) {
            toast.error(err.message || 'Failed to add item');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredItems = items.filter(i =>
        (activeTab === 'All') &&
        (i.name?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h4 className="text-amber-500 uppercase tracking-widest text-xs mb-2">Vault</h4>
                    <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">Culinary Menu</h2>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
                <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-[32px] border border-white/5 max-w-xl w-full">
                    <Search size={22} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search our collection..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-base w-full font-light px-2"
                    />
                </div>

                <div className="flex gap-2 p-1 bg-black border border-white/5 rounded-2xl overflow-x-auto scrollbar-hide">
                    {['All', ...categories.map(c => c.categoryName)].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap",
                                activeTab === cat ? "bg-amber-500 text-black shadow-lg" : "text-gray-500 hover:text-white"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 rounded-[32px]" />)
                ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={item.id}
                            className="bg-black border border-white/5 p-5 rounded-[32px] hover:border-amber-500/20 transition-all flex gap-5 group"
                        >
                            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                                <AuthImage
                                    src={getImageUrl(item.productimage)}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    fallback={
                                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-3xl">🍽️</div>
                                    }
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">
                                            {item.categoryName || item.category}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-gray-500 hover:text-white transition-colors"><Edit2 size={14} /></button>
                                            <button className="text-gray-700 hover:text-red-500 transition-colors ml-2"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-display font-medium text-white">{item.name}</h3>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-display font-bold text-white">₹{item.price}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">
                                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                                        </span>
                                        {item.isVeg
                                            ? <Leaf size={14} className="text-emerald-500" />
                                            : <Drumstick size={14} className="text-red-400" />}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center text-gray-800 font-display text-2xl uppercase tracking-[0.2em] border-2 border-dashed border-white/5 rounded-[40px]">
                        No items found in this section
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={handleModalClose}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 lg:p-12 shadow-2xl z-10 my-8"
                        >
                            <button onClick={handleModalClose} className="absolute top-10 right-10 text-gray-500 hover:text-white"><X size={28} /></button>

                            <div className="mb-10 text-center lg:text-left">
                                <p className="text-amber-500 text-[10px] uppercase font-bold tracking-[0.5em] mb-2">Item Definition</p>
                                <h3 className="text-3xl font-display font-bold uppercase text-white">Add Menu Item</h3>
                            </div>

                            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Image Upload */}
                                <div className="space-y-6 md:col-span-1">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600 ml-1">Item Photo</label>
                                        <div className="aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden hover:border-amber-500/30 transition-colors">
                                            {previewImage ? (
                                                <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <>
                                                    <Camera size={32} className="text-gray-700 mb-2 group-hover:text-amber-500 transition-colors" />
                                                    <span className="text-[10px] uppercase font-bold text-gray-700 tracking-widest text-center px-6">Upload Item Photo</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-5 md:col-span-1">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600 ml-1">Item Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. French Fries"
                                            value={formData.name}
                                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-amber-500 text-sm"
                                        />
                                        {formErrors.name && <p className="text-red-400 text-xs pl-1">{formErrors.name}</p>}
                                    </div>

                                    {/* Category — shows name, sends id */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600 ml-1">Category</label>
                                        {categories.length === 0 ? (
                                            <p className="text-gray-600 text-xs pl-1 italic">No categories found. Please add categories first.</p>
                                        ) : (
                                            <select
                                                value={formData.categoryId}
                                                onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))}
                                                className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 outline-none focus:border-amber-500 text-sm font-semibold tracking-wide appearance-none text-white"
                                            >
                                                <option value="" disabled className="bg-black">Select a category</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id} className="bg-black text-white">
                                                        {c.categoryName}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {formErrors.categoryId && <p className="text-red-400 text-xs pl-1">{formErrors.categoryId}</p>}
                                    </div>

                                    {/* Price */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600 ml-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 129"
                                            min="0"
                                            value={formData.price}
                                            onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-amber-500 text-sm"
                                        />
                                        {formErrors.price && <p className="text-red-400 text-xs pl-1">{formErrors.price}</p>}
                                    </div>

                                    {/* Veg / Non-veg toggle */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600 ml-1">Type</label>
                                        <div className="flex rounded-2xl overflow-hidden border border-white/10">
                                            <button
                                                type="button"
                                                onClick={() => setIsVeg(true)}
                                                className={cn(
                                                    "flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                                                    isVeg ? "bg-emerald-600 text-white" : "text-gray-600 hover:text-gray-400"
                                                )}
                                            >
                                                <Leaf size={14} /> Veg
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsVeg(false)}
                                                className={cn(
                                                    "flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                                                    !isVeg ? "bg-red-700 text-white" : "text-gray-600 hover:text-gray-400"
                                                )}
                                            >
                                                <Drumstick size={14} /> Non-Veg
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Description — full width */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600 ml-1">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Crispy golden fried potato sticks served with seasoning…"
                                        value={formData.description}
                                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-amber-500 text-sm resize-none"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-black py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Add to Menu'}
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

export default MenuManagement;
