import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChefHat, Mail, Loader2, Building2, MapPin, UtensilsCrossed,
    FileText, ImagePlus, X, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:8085';

const InputField = ({ label, icon: Icon, error, children }) => (
    <div className="flex flex-col gap-2 text-left w-full">
        <label className="text-xs font-semibold text-gray-400 pl-1 uppercase tracking-wider">{label}</label>
        <div className="relative flex items-center w-full">
            {Icon && (
                <Icon
                    className="absolute left-4 text-gray-500 pointer-events-none z-10"
                    size={18}
                />
            )}
            {children}
        </div>
        {error && <p className="text-xs text-red-400 pl-1 font-medium">{error}</p>}
    </div>
);

const Register = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5 MB.');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onSubmit = async (data) => {
        if (!imageFile) {
            toast.error('Please upload a restaurant image.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('description', data.description);
            formData.append('cuisineType', data.cuisineType);
            formData.append('address', data.address);
            formData.append('image', imageFile);

            const response = await fetch(`${API_BASE}/restaurant/register`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Server error: ${response.status}`);
            }

            setSuccess(true);
            toast.success('Restaurant registered successfully!');
            reset();
            removeImage();
        } catch (error) {
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        'w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all font-medium text-sm text-gray-200 placeholder:text-gray-600';

    const textareaClass =
        'w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all font-medium text-sm text-gray-200 placeholder:text-gray-600 resize-none';

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_60%)] relative overflow-hidden">
            {/* Background glow blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="w-full max-w-2xl glass-card p-10 relative overflow-hidden"
            >
                {/* Corner glow */}
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-amber-500/10 ring-1 ring-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ChefHat size={32} className="text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-display font-semibold tracking-tight mb-2 text-white">
                        Register Restaurant
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                        Join our platform and start managing your restaurant
                    </p>
                </div>

                {/* Success State */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative z-10 flex flex-col items-center gap-4 py-6 mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                        >
                            <CheckCircle2 size={40} className="text-emerald-400" />
                            <p className="text-emerald-300 font-semibold text-sm text-center">
                                Your restaurant has been registered!<br />
                                <span className="text-gray-400 font-normal">Await admin approval to access the dashboard.</span>
                            </p>
                            <button
                                onClick={() => { setSuccess(false); navigate('/login'); }}
                                className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                            >
                                Go to Login
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
                    {/* Two-column row: Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField label="Restaurant Name" icon={Building2} error={errors.name?.message}>
                            <input
                                {...register('name', { required: 'Restaurant name is required' })}
                                type="text"
                                placeholder="Spice Haven"
                                className={inputClass}
                            />
                        </InputField>

                        <InputField label="Email Address" icon={Mail} error={errors.email?.message}>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                                })}
                                type="email"
                                placeholder="owner@restaurant.com"
                                className={inputClass}
                            />
                        </InputField>
                    </div>

                    {/* Two-column row: Cuisine + Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField label="Cuisine Type" icon={UtensilsCrossed} error={errors.cuisineType?.message}>
                            <input
                                {...register('cuisineType', { required: 'Cuisine type is required' })}
                                type="text"
                                placeholder="e.g. Indian, Italian, Chinese"
                                className={inputClass}
                            />
                        </InputField>

                        <InputField label="Address" icon={MapPin} error={errors.address?.message}>
                            <input
                                {...register('address', { required: 'Address is required' })}
                                type="text"
                                placeholder="123 Main St, City"
                                className={inputClass}
                            />
                        </InputField>
                    </div>

                    {/* Description */}
                    <InputField label="Description" icon={FileText} error={errors.description?.message}>
                        <textarea
                            {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Description must be at least 10 characters' } })}
                            rows={3}
                            placeholder="Tell us about your restaurant, specialty dishes, ambience..."
                            className={textareaClass}
                        />
                    </InputField>

                    {/* Image Upload */}
                    <div className="flex flex-col gap-2 text-left w-full">
                        <label className="text-xs font-semibold text-gray-400 pl-1 uppercase tracking-wider">
                            Restaurant Image
                        </label>

                        {!imagePreview ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-white/10 rounded-2xl py-8 flex flex-col items-center gap-3 text-gray-500 hover:border-amber-500/40 hover:text-amber-400/70 transition-all group cursor-pointer"
                            >
                                <ImagePlus size={32} className="group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Click to upload image</span>
                                <span className="text-xs text-gray-600">PNG, JPG, WEBP up to 5 MB</span>
                            </button>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                <img
                                    src={imagePreview}
                                    alt="Restaurant preview"
                                    className="w-full h-48 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-red-500/80 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X size={14} className="text-white" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/50 backdrop-blur-sm">
                                    <p className="text-xs text-gray-300 truncate">{imageFile?.name}</p>
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-bold tracking-wide text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Registering Restaurant...
                            </>
                        ) : (
                            'Register Restaurant'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center relative z-10">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-amber-400 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Already registered? Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
