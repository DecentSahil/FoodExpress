
import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const HIDE_NAVBAR_ROUTES = ['/admin', '/restaurant-dashboard', '/order-status'];

const Layout = ({ children }) => {
    const location = useLocation();
    const hideNavbar = HIDE_NAVBAR_ROUTES.some(route =>
        location.pathname.startsWith(route)
    );

    return (
        <div className="app-layout">
            {!hideNavbar && <Navbar />}
            <main className={hideNavbar ? 'no-main-padding' : ''}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
