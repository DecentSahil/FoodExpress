import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, ChefHat, UserPlus, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:8085';

// ─── Shared input class ────────────────────────────────────────────────────────
const inputClass =
    'w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all font-medium text-sm text-gray-200 placeholder:text-gray-600';

// ─── Reusable field wrapper ────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, error, children }) => (
    <div className="flex flex-col gap-2 text-left w-full">
        <label className="text-xs font-semibold text-gray-400 pl-1 uppercase tracking-wider">
            {label}
        </label>
        <div className="relative flex items-center w-full">
            {Icon && <Icon className="absolute left-4 text-gray-500 pointer-events-none z-10" size={18} />}
            {children}
        </div>
        {error && <p className="text-xs text-red-400 pl-1 font-medium">{error}</p>}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN FORM
// ═══════════════════════════════════════════════════════════════════════════════
const LoginForm = ({ onSwitch }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `Login failed (${response.status})`);
            }

            const result = await response.json();

            // Store token — backend returns accessToken
            const token = result.accessToken || result.token;
            if (token) {
                localStorage.setItem('accessToken', token);
            }
            // Store restaurantId if the gateway returns it
            if (result.restaurantId) {
                localStorage.setItem('restaurantId', result.restaurantId);
            }

            login({
                email: data.email,
                name: result.name || data.email,
                role: result.role || 'USER',
                token,
            });

            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <Field label="Email Address" icon={Mail} error={errors.email?.message}>
                <input
                    {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass}
                />
            </Field>

            <Field label="Password" icon={Lock} error={errors.password?.message}>
                <input
                    {...register('password', { required: 'Password is required' })}
                    type="password"
                    placeholder="••••••••"
                    className={`${inputClass} tracking-widest`}
                />
            </Field>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-bold tracking-wide text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                    <><LogIn size={16} /> Login to Dashboard</>
                )}
            </button>

            <p className="text-center text-xs text-gray-500 pt-1">
                New here?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                    Create an account
                </button>
            </p>
        </form>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTER FORM (user account — not restaurant)
// ═══════════════════════════════════════════════════════════════════════════════
const RegisterForm = ({ onSwitch }) => {
    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `Registration failed (${response.status})`);
            }

            toast.success('Account created! Please log in.');
            reset();
            onSwitch(); // switch back to login tab
        } catch (error) {
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <Field label="Full Name" icon={User} error={errors.name?.message}>
                <input
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                    type="text"
                    placeholder="John Doe"
                    className={inputClass}
                />
            </Field>

            <Field label="Email Address" icon={Mail} error={errors.email?.message}>
                <input
                    {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass}
                />
            </Field>

            <Field label="Password" icon={Lock} error={errors.password?.message}>
                <input
                    {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    type="password"
                    placeholder="••••••••"
                    className={`${inputClass} tracking-widest`}
                />
            </Field>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-bold tracking-wide text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                    <><UserPlus size={16} /> Create Account</>
                )}
            </button>

            <p className="text-center text-xs text-gray-500 pt-1">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                    Sign in
                </button>
            </p>
        </form>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Login = () => {
    const [tab, setTab] = useState('login'); // 'login' | 'register'

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_60%)] relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md glass-card p-10 relative overflow-hidden"
            >
                {/* Corner glow accents */}
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-amber-500/10 ring-1 ring-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <ChefHat size={32} className="text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-display font-semibold tracking-tight mb-1 text-white">
                        {tab === 'login' ? 'Partner Login' : 'Create Account'}
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                        {tab === 'login'
                            ? 'Sign in to manage your restaurant'
                            : 'Register for a new user account'}
                    </p>
                </div>

                {/* Tab switcher */}
                <div className="relative z-10 flex bg-white/[0.03] border border-white/10 rounded-xl p-1 mb-6">
                    {['login', 'register'].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg capitalize tracking-wide transition-all ${tab === t
                                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {t === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Tab content with slide animation */}
                <div className="relative z-10 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: tab === 'login' ? 20 : -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {tab === 'login' ? (
                                <LoginForm onSwitch={() => setTab('register')} />
                            ) : (
                                <RegisterForm onSwitch={() => setTab('login')} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Restaurant register link */}
                <div className="mt-7 pt-5 border-t border-white/[0.06] text-center relative z-10">
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400/70 hover:text-amber-400 transition-colors"
                    >
                        <UserPlus size={13} />
                        Register a new restaurant instead
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
