import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../api';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const normalizedEmail = email.trim().toLowerCase();

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: normalizedEmail }),
            });

            if (!response.ok) {
                let errorMsg = 'Failed to send reset link';
                try {
                    const errorData = await response.json();
                    if (Array.isArray(errorData.fieldErrors)) { errorMsg = errorData.fieldErrors.map(e => e.defaultMessage).join(', '); }
                    else if (errorData.errors && typeof errorData.errors === 'object') { errorMsg = Object.values(errorData.errors).join(', '); }
                    else { errorMsg = errorData.message || errorData.error || errorMsg; }
                } catch(e) {
                    const raw = await response.text();
                    errorMsg = raw || errorMsg;
                }
                throw new Error(errorMsg);
            }

            const data = await response.text(); 
            setMessage(data || "Success! Check your email for the reset link.");

        } catch (err) {
            setError(err.message || 'Error connecting to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-wrapper">
            <div className="forgot-password-card">
                <h2>Forgot Password?</h2>
                <p className="forgot-password-subtitle">
                    Enter your registered email and we'll send you a link to reset your password.
                </p>

                {error && <div className="forgot-password-error"><span>⚠️</span> {error}</div>}
                {message && <div className="forgot-password-success"><span>✅</span> {message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="forgot-password-field">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="forgot-password-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <button type="submit" className="forgot-password-submit-btn" disabled={loading}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>

                <Link to="/login" className="forgot-password-back-link">
                    ← Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
