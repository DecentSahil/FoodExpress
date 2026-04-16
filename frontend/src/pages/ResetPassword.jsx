import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE from '../api';
import './ResetPassword.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();

    // Extract token from URL query params
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!token) {
            return setError('Invalid token. Please request a new reset link.');
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMsg = errorData.message || 'Failed to reset password';
                if (Array.isArray(errorData.fieldErrors)) { errorMsg = errorData.fieldErrors.map(e => e.defaultMessage).join(', '); }
                else if (errorData.errors && typeof errorData.errors === 'object') { errorMsg = Object.values(errorData.errors).join(', '); }
                throw new Error(errorMsg);
            }

            const data = await response.text(); 
            setMessage(data || "Password updated successfully!");

            // Redirect to login after successful reset
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.message || 'Error connecting to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-wrapper">
            <div className="reset-password-card">
                <h2>Reset Password</h2>
                <p className="reset-password-subtitle">Create a new secure password for your account</p>

                {error && <div className="reset-password-error"><span>⚠️</span> {error}</div>}
                {message && <div className="reset-password-success"><span>✅</span> {message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="reset-password-field">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            className="reset-password-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="reset-password-field">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="reset-password-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="reset-password-submit-btn" disabled={loading || !token}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
