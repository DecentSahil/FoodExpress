import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import './Register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(100);
    const timerRef = useRef(null);

    const { sendOtp, verifyOtpAndRegister, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setError(''); setSuccessMessage('');
        const normalizedEmail = email.trim().toLowerCase();
        try {
            const msg = await sendOtp({ name, email: normalizedEmail, password });
            setSuccessMessage(msg || 'OTP sent to your email.');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        }
    };

    const handleResendOtp = async () => {
        setError(''); setSuccessMessage('');
        const normalizedEmail = email.trim().toLowerCase();
        try {
            const msg = await sendOtp({ name, email: normalizedEmail, password });
            setSuccessMessage(msg || 'OTP resent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        const otpString = otp.join('');
        if (otpString.length < 6) { setError('Please enter all 6 digits.'); return; }
        const normalizedEmail = email.trim().toLowerCase();
        try {
            await verifyOtpAndRegister({ name, email: normalizedEmail, password }, otpString);
            setStep(3);
            let timeLeft = 5000;
            const interval = 50;
            timerRef.current = setInterval(() => {
                timeLeft -= interval;
                setProgress((timeLeft / 5000) * 100);
                if (timeLeft <= 0) { clearInterval(timerRef.current); navigate('/login'); }
            }, interval);
        } catch (err) {
            setError(err.message || 'OTP verification failed');
            setOtp(['', '', '', '', '', '']);
            if (otpRefs.current[0]) otpRefs.current[0].focus();
        }
    };

    const handleOtpChange = (value, index) => {
        if (value && !/^\d$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0)
            otpRefs.current[index - 1]?.focus();
    };

    return (
        <div className="login-page-wrapper">
            {/* Loading overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loader-content">
                        <div className="dot-spinner">
                            {[...Array(8)].map((_, i) => <div key={i} className="dot" style={{ '--r': `${i * 45}deg` }} />)}
                        </div>
                        <h3>Sending email…</h3>
                        <p>Please wait</p>
                    </div>
                </div>
            )}

            {/* ── Left Branding Panel ──────────────── */}
            <div className="login-panel-left">
                <div className="login-panel-emoji">🚀</div>
                <div className="login-brand-logo">FoodExpress</div>
                <p className="login-brand-tagline">Join thousands of happy foodies</p>
                <ul className="login-panel-features">
                    <li><span className="login-feature-icon">🆓</span> Free delivery on first order</li>
                    <li><span className="login-feature-icon">🎁</span> Exclusive member offers</li>
                    <li><span className="login-feature-icon">🔔</span> Real-time order updates</li>
                    <li><span className="login-feature-icon">⭐</span> Rate & review restaurants</li>
                </ul>
            </div>

            {/* ── Right Form Panel ─────────────────── */}
            <div className="login-panel-right">
                <div className="login-form-card">
                    {/* Step indicator */}
                    <div className="auth-steps">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`auth-step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`} />
                        ))}
                    </div>

                    {step === 1 && (
                        <>
                            <h2>Create account</h2>
                            <p className="login-form-subtitle">It's free and only takes a minute</p>

                            {error && <div className="auth-error">⚠️ {error}</div>}
                            {successMessage && <div className="auth-success">✅ {successMessage}</div>}

                            <form onSubmit={handleSendOtp}>
                                <div className="auth-field">
                                    <label htmlFor="name">Full name</label>
                                    <input className="auth-input" type="text" id="name" placeholder="John Doe"
                                        value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                <div className="auth-field">
                                    <label htmlFor="email">Email address</label>
                                    <input className="auth-input" type="email" id="email" placeholder="you@example.com"
                                        value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="auth-field">
                                    <label htmlFor="password">Password</label>
                                    <div className="auth-input-wrapper">
                                        <input className="auth-input" type={showPassword ? 'text' : 'password'}
                                            id="password" placeholder="Min. 8 characters" value={password}
                                            onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
                                        <button type="button" className="auth-eye-btn"
                                            onClick={() => setShowPassword(s => !s)}>
                                            {showPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="auth-submit-btn" disabled={loading}>
                                    {loading ? 'Sending OTP…' : 'Send OTP →'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2>Verify OTP 📬</h2>
                            <p className="login-form-subtitle">Enter the 6-digit code sent to your email</p>

                            {error && <div className="auth-error">⚠️ {error}</div>}
                            {successMessage && <div className="auth-success">✅ {successMessage}</div>}

                            <form onSubmit={handleVerifyOtp}>
                                <p className="otp-email-hint">Code sent to <strong>{email}</strong></p>
                                <div className="otp-boxes-container">
                                    {otp.map((digit, i) => (
                                        <input key={i} ref={el => (otpRefs.current[i] = el)}
                                            className="otp-box" type="text" maxLength="1" value={digit}
                                            onChange={e => handleOtpChange(e.target.value, i)}
                                            onKeyDown={e => handleOtpKeyDown(e, i)} />
                                    ))}
                                </div>
                                <button type="submit" className="auth-submit-btn" disabled={loading}>
                                    {loading ? 'Verifying…' : 'Verify & Register →'}
                                </button>
                                <button type="button" className="auth-secondary-btn" onClick={handleResendOtp} disabled={loading}>
                                    {loading ? 'Sending…' : '🔄 Resend OTP'}
                                </button>
                                <button type="button" className="auth-back-btn"
                                    onClick={() => { setStep(1); setError(''); setSuccessMessage(''); setOtp(['','','','','','']); }}>
                                    ← Back
                                </button>
                            </form>
                        </>
                    )}

                    {step === 3 && (
                        <div className="success-step">
                            <div className="success-big-icon">🎉</div>
                            <p className="success-title">You're all set!</p>
                            <p className="success-subtitle">Redirecting you to login…</p>
                            <div className="redirect-progress-container">
                                <div className="redirect-progress-bar" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    <div className="auth-footer-link">
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
