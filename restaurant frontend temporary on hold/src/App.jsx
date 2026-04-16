import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import MenuManagement from './pages/MenuManagement';
import Orders from './pages/Orders';

// Mocked views for Categories, Menu, Orders
const Placeholder = ({ title }) => (
    <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] text-gray-700 font-display text-4xl uppercase tracking-widest">
        {title} Coming Soon
    </div>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontFamily: 'Outfit, sans-serif'
                        }
                    }}
                />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Dashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/categories" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Categories />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/menu" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <MenuManagement />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Orders />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
