import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import './RestaurantRegister.css';
import API_BASE from '../api';

const RestaurantRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        description: '',
        cuisineType: '',
        address: ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const fileInputRef = useRef(null);

    // Countdown & auto-redirect after success
    useEffect(() => {
        if (!showSuccessModal) return;
        if (countdown === 0) { navigate('/login'); return; }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [showSuccessModal, countdown]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!image) {
            setError('Please select an image for the restaurant.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('description', formData.description);
        data.append('cuisineType', formData.cuisineType);
        data.append('address', formData.address);
        data.append('image', image);

        try {
            const res = await fetch(`${API_BASE}/restaurant/register`, {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                setShowSuccessModal(true);
                setCountdown(5);
            } else {
                const errorText = await res.text();
                setError(errorText || 'Failed to register restaurant.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="rr-page">
            {/* ── Success Modal Popup ── */}
            {showSuccessModal && (
                <div className="rr-modal-overlay" onClick={() => navigate('/login')}>
                    <div className="rr-modal" onClick={e => e.stopPropagation()}>
                        {/* Animated dot decorations */}
                        <div className="rr-modal-dots">
                            {[...Array(8)].map((_, i) => (
                                <span key={i} className={`rr-dot rr-dot-${i + 1}`} />
                            ))}
                        </div>

                        {/* Icon */}
                        <div className="rr-modal-icon-wrap">
                            <div className="rr-modal-icon">✓</div>
                        </div>

                        {/* Text */}
                        <h2 className="rr-modal-title">Registration Successful!</h2>
                        <p className="rr-modal-desc">
                            Your restaurant has been submitted and is now
                            <strong> pending admin review</strong>. You'll be
                            notified once it's approved.
                        </p>

                        {/* Waiting pill */}
                        <div className="rr-modal-waiting">
                            <span className="rr-waiting-pulse" />
                            Waiting for admin approval…
                        </div>

                        {/* Countdown */}
                        <p className="rr-modal-countdown">
                            Redirecting to login in <strong>{countdown}s</strong>…
                        </p>

                        {/* Action */}
                        <button
                            className="rr-modal-btn"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login Now →
                        </button>
                    </div>
                </div>
            )}
            <div className="rr-layout">
                {/* Left branding panel */}
                <div className="rr-panel-left">
                    <div className="rr-brand">
                        <span className="login-brand-logo">FoodExpress</span>
                        <p className="login-brand-tagline">Partner with us & grow your business</p>
                    </div>
                    <div className="login-panel-emoji">🍽️</div>
                    <ul className="login-panel-features">
                        <li>
                            <span className="login-feature-icon">📈</span>
                            Reach thousands of hungry customers
                        </li>
                        <li>
                            <span className="login-feature-icon">💳</span>
                            Fast & secure payments
                        </li>
                        <li>
                            <span className="login-feature-icon">📊</span>
                            Real-time order tracking dashboard
                        </li>
                        <li>
                            <span className="login-feature-icon">🛡️</span>
                            Dedicated partner support
                        </li>
                    </ul>
                </div>

                {/* Right form panel */}
                <div className="rr-panel-right">
                    <div className="rr-form-card">
                        <h2>Register Your Restaurant</h2>
                        <p className="login-form-subtitle">Fill in the details below to get started</p>

                        <form onSubmit={handleSubmit}>
                            <div className="auth-field">
                                <label htmlFor="rr-name">Restaurant Name</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        id="rr-name"
                                        type="text"
                                        name="name"
                                        className="auth-input"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. The Grand Kitchen"
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="rr-email">Email Address</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        id="rr-email"
                                        type="email"
                                        name="email"
                                        className="auth-input"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="restaurant@example.com"
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="rr-cuisineType">Cuisine Type</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        id="rr-cuisineType"
                                        type="text"
                                        name="cuisineType"
                                        className="auth-input"
                                        value={formData.cuisineType}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Italian, Chinese, Indian"
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="rr-description">Description</label>
                                <textarea
                                    id="rr-description"
                                    name="description"
                                    className="auth-input rr-textarea"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Tell customers what makes your restaurant special..."
                                    rows="3"
                                />
                            </div>

                            <div className="auth-field">
                                <label htmlFor="rr-address">Address</label>
                                <textarea
                                    id="rr-address"
                                    name="address"
                                    className="auth-input rr-textarea"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your full restaurant address"
                                    rows="2"
                                />
                            </div>

                            <div className="auth-field">
                                <label>Restaurant Image</label>
                                <div
                                    className="rr-upload-zone"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="rr-upload-preview" />
                                    ) : (
                                        <div className="rr-upload-placeholder">
                                            <span className="rr-upload-icon">📷</span>
                                            <span className="rr-upload-text">Click to upload restaurant photo</span>
                                            <span className="rr-upload-hint">JPG, PNG, WEBP up to 10MB</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="rr-image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                {image && (
                                    <p className="rr-file-name">✓ Selected: {image.name}</p>
                                )}
                            </div>

                            {error && (
                                <div className="auth-error">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-submit-btn"
                            >
                                {loading ? 'Registering...' : 'Register Restaurant 🚀'}
                            </button>

                            <div className="auth-footer-link">
                                Already registered?{' '}
                                <a href="/login">Sign in</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantRegister;