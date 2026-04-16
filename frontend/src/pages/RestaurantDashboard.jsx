import React, { useState } from 'react';
import CategoryManager from '../components/CategoryManager';
import MenuManager from '../components/MenuManager';
import OrderStatus from './OrderStatus';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Navigate } from 'react-router-dom';
import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('menu');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Protect route
    if (!user || !user.role || (user.role.toLowerCase() !== 'restaurant' && !user.role.toLowerCase().includes('restaurant'))) {
        return <Navigate to="/" />;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (window.innerWidth <= 992) {
            setIsSidebarOpen(false);
        }
    };

    const titleMap = {
        'menu': 'Menu Management',
        'category': 'Category Management',
        'orders': 'Order Management'
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`} id="sidebar">
                <div className="sidebar-header">
                    <h2><span className="sidebar-icon">🍴</span> RestroAdmin</h2>
                    <button className="close-btn" onClick={toggleSidebar}>✖</button>
                </div>
                <ul className="sidebar-menu">
                    <li className={activeTab === 'menu' ? 'active' : ''}>
                        <button onClick={() => handleTabChange('menu')}>
                            <span className="sidebar-icon">🍔</span> Menu Items
                        </button>
                    </li>
                    <li className={activeTab === 'category' ? 'active' : ''}>
                        <button onClick={() => handleTabChange('category')}>
                            <span className="sidebar-icon">📁</span> Categories
                        </button>
                    </li>
                    <li className={activeTab === 'orders' ? 'active' : ''}>
                        <button onClick={() => handleTabChange('orders')}>
                            <span className="sidebar-icon">🧾</span> Orders
                        </button>
                    </li>
                    <li className="sidebar-logout-item">
                        <button onClick={handleLogout} className="sidebar-logout-btn">
                            <span className="sidebar-icon">🚪</span> Logout
                        </button>
                    </li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="top-header">
                    <div className="header-left">
                        <button className="menu-toggle" onClick={toggleSidebar}>☰</button>
                        <h1>{titleMap[activeTab]}</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={toggleTheme}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.3rem',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '8px',
                                lineHeight: 1
                            }}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <div className="user-profile">
                            <img src={`https://ui-avatars.com/api/?name=${user.name || 'Owner'}&background=E23744&color=fff`} alt="Profile" />
                            <span>{user.name || 'Owner'}</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="content-area">
                    {activeTab === 'category' && <CategoryManager />}
                    {activeTab === 'menu' && <MenuManager />}
                    {activeTab === 'orders' && <OrderStatus embedded />}
                </div>
            </main>
        </div>
    );
};

export default RestaurantDashboard;
