import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE from '../api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Optional: validate token on mount if needed, but initial state is now covered
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMsg = errorData.message || 'Login failed';
                if (errorData.errors && typeof errorData.errors === 'object') { errorMsg = Object.values(errorData.errors).join(', '); }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            // Structural change: data = { accessToken, refreshToken, expiresIn, user: { id, email, role } }
            const userData = { ...data.user, token: data.accessToken };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMsg = errorData.message || 'Registration failed';
                if (errorData.errors && typeof errorData.errors === 'object') { errorMsg = Object.values(errorData.errors).join(', '); }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async (userData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                // Sometime the error might not be a valid json, we need to handle it.
                let errorMessage = 'Failed to send OTP';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch(e) {}
                throw new Error(errorMessage);
            }
            
            const data = await response.text();
            return data;
        } catch (error) {
            console.error("Send OTP error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndRegister = async (userData, otp) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/verify-otp?otp=${otp}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                let errorMessage = 'OTP verification failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch(e) {}
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Verify OTP error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };


    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        login,
        register,
        sendOtp,
        verifyOtpAndRegister,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
