import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API_BASE from '../api';

const Navbar = () => {
    const { itemsCount } = useCart();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const dropdownRef = useRef(null);

    const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
    const isActive = (path) => location.pathname === path ? 'active' : '';
    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    // Get initials from email or name
    const getInitials = () => {
        if (!user) return 'U';
        const name = user.name || user.email || '';
        const parts = name.split(/[@.\s]/);
        return parts[0]?.charAt(0).toUpperCase() || 'U';
    };

    const fetchProfilePic = () => {
        if (!token) return;
        fetch(`${API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data?.profilePic) {
                setProfilePicUrl(`${API_BASE}/uploads/userPhoto/${data.profilePic}`);
            }
        })
        .catch(err => console.error("Failed to fetch navbar profile pic", err));
    };

    useEffect(() => {
        fetchProfilePic();
        window.addEventListener('profilePicUpdated', fetchProfilePic);
        return () => window.removeEventListener('profilePicUpdated', fetchProfilePic);
    }, [user, token]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        closeMenu();
        setIsProfileDropdownOpen(false);
        setProfilePicUrl(null);
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" className="logo" onClick={closeMenu}>FoodExpress</Link>

                <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle navigation">
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>

                <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>Home</Link>

                    {(!user || user.role !== 'ROLE_RESTAURANT') && (
                        <>
                            <Link to="/restaurants" className={`nav-link ${isActive('/restaurants')}`} onClick={closeMenu}>Restaurants</Link>
                            <Link to="/products" className={`nav-link ${isActive('/products')}`} onClick={closeMenu}>Products</Link>
                            <Link to="/orders" className={`nav-link ${isActive('/orders')}`} onClick={closeMenu}>Orders</Link>
                        </>
                    )}

                    {user && user.role === 'ROLE_RESTAURANT' && (
                        <Link to="/restaurant-dashboard" className={`nav-link ${isActive('/restaurant-dashboard')}`} onClick={closeMenu}>Dashboard</Link>
                    )}

                    {user && user.role?.toUpperCase().includes('ADMIN') && (
                        <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={closeMenu} style={{ color: '#e23744', fontWeight: 700 }}>⚙️ Admin</Link>
                    )}

                    {(!user || user.role !== 'ROLE_RESTAURANT') && (
                        <Link to="/cart" className={`nav-link cart-link ${isActive('/cart')}`} onClick={closeMenu}>
                            Cart {itemsCount > 0 && <span className="badge">{itemsCount}</span>}
                        </Link>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="theme-toggle-btn"
                        aria-label="Toggle dark mode"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '5px' }}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>

                    {user ? (
                        /* ── Profile Avatar + Dropdown ── */
                        <div className="profile-avatar-wrapper" ref={dropdownRef}>
                            <button
                                className="profile-avatar-btn"
                                onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                                aria-label="Open profile menu"
                                title={user.email}
                                style={{ padding: profilePicUrl ? 0 : '', overflow: 'hidden' }}
                            >
                                {profilePicUrl ? (
                                    <img src={profilePicUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span className="profile-avatar-initials">{getInitials()}</span>
                                )}
                            </button>

                            {isProfileDropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-dropdown-header">
                                        <div className="profile-dropdown-avatar" style={{ padding: profilePicUrl ? 0 : '', overflow: 'hidden' }}>
                                            {profilePicUrl ? (
                                                <img src={profilePicUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                getInitials()
                                            )}
                                        </div>
                                        <div>
                                            <p className="profile-dropdown-name">{user.name || 'User'}</p>
                                            <p className="profile-dropdown-email">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="profile-dropdown-divider" />
                                    <Link
                                        to="/profile"
                                        className="profile-dropdown-item"
                                        onClick={() => { setIsProfileDropdownOpen(false); closeMenu(); }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        View Profile
                                    </Link>
                                    {user?.role?.toUpperCase().includes('ADMIN') && (
                                        <Link
                                            to="/admin"
                                            className="profile-dropdown-item"
                                            onClick={() => { setIsProfileDropdownOpen(false); closeMenu(); }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        className="profile-dropdown-item profile-dropdown-logout"
                                        onClick={handleLogout}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={closeMenu}>Login</Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
