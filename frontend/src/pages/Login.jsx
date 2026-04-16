import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const userData = await login({ email: normalizedEmail, password });
            const role = userData.role?.toUpperCase() || '';
            if (role.includes('ADMIN')) {
                navigate('/admin');
            } else if (role.includes('RESTAURANT')) {
                navigate('/restaurant-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        }
    };

    return (
        <div className="login-page-wrapper">
            {/* ── Left Branding Panel ─────────────────── */}
            <div className="login-panel-left">
                <div className="login-panel-emoji">🍽️</div>
                <div className="login-brand-logo">FoodExpress</div>
                <p className="login-brand-tagline">Your favourite meals, at your door</p>
                <ul className="login-panel-features">
                    <li>
                        <span className="login-feature-icon">⚡</span>
                        Lightning-fast delivery
                    </li>
                    <li>
                        <span className="login-feature-icon">🍕</span>
                        100+ restaurants near you
                    </li>
                    <li>
                        <span className="login-feature-icon">💳</span>
                        Secure & easy payments
                    </li>
                    <li>
                        <span className="login-feature-icon">📦</span>
                        Live order tracking
                    </li>
                </ul>
            </div>

            {/* ── Right Form Panel ────────────────────── */}
            <div className="login-panel-right">
                <div className="login-form-card">
                    <h2>Welcome back 👋</h2>
                    <p className="login-form-subtitle">Login to your FoodExpress account</p>

                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="email">Email address</label>
                            <div className="auth-input-wrapper">
                                <input
                                    className="auth-input"
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <div className="auth-input-wrapper">
                                <input
                                    className="auth-input"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? 'Logging in…' : 'Login →'}
                        </button>
                    </form>

                    <div className="auth-footer-link" style={{ marginTop: '1rem' }}>
                        <Link to="/forgot-password" style={{ color: 'var(--primary-color, #ef4444)', fontWeight: '500' }}>Forgot password?</Link>
                    </div>

                    <div className="auth-footer-link">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </div>
                    <div className="auth-footer-link">
                        Want to register your restaurant? <Link to="/register-restaurant">Register Restaurant</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
