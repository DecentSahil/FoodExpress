import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../api';
import './SetPassword.css';

const SetPassword = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/restaurant/set-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to set password');
            }

            // The backend returns ResponseEntity.ok("Password set successfully...")
            const data = await response.text(); 
            setMessage(data || "Password set successfully. You can now login.");
            
            // Redirect to login after successful password creation
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
        <div className="set-password-wrapper">
            <div className="set-password-card">
                <h2>Set Your Password</h2>
                <p className="set-password-subtitle">Create a password for your restaurant account</p>

                {error && <div className="set-password-error"><span>⚠️</span> {error}</div>}
                {message && <div className="set-password-success"><span>✅</span> {message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="set-password-field">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="set-password-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your registered email"
                            required
                        />
                    </div>

                    <div className="set-password-field">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            className="set-password-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="set-password-submit-btn" disabled={loading}>
                        {loading ? 'Setting Password...' : 'Set Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;
