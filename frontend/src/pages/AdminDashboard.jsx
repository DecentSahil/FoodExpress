import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE from '../api';
import './AdminDashboard.css';

const STATUS_COLORS = {
    PENDING: { bg: '#fff8e1', color: '#f57f17', label: 'Pending' },
    APPROVED: { bg: '#e8f5e9', color: '#2e7d32', label: 'Approved' },
    REJECTED: { bg: '#fce4ec', color: '#c62828', label: 'Rejected' },
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [approving, setApproving] = useState(null); // id of restaurant being approved
    const [deleting, setDeleting] = useState(null); // id of restaurant being deleted
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [toast, setToast] = useState(null);

    const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;

    // Guard: only admins can see this
    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.role?.toUpperCase().includes('ADMIN')) { navigate('/'); return; }
    }, [user]);

    const fetchRestaurants = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/restaurant/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Failed to fetch restaurants (${res.status})`);
            const data = await res.json();
            setRestaurants(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (token) fetchRestaurants(); }, [token]);

    const handleApprove = async (restaurant) => {
        setApproving(restaurant.id);
        try {
            const res = await fetch(`${API_BASE}/restaurant/admin/${restaurant.id}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setRestaurants(prev =>
                    prev.map(r => r.id === restaurant.id ? { ...r, status: 'APPROVED', isActive: true } : r)
                );
                showToast(`✅ "${restaurant.name}" approved successfully!`, 'success');
            } else {
                const msg = await res.text();
                showToast(`❌ Failed to approve: ${msg || res.status}`, 'error');
            }
        } catch (err) {
            showToast(`❌ Error: ${err.message}`, 'error');
        } finally {
            setApproving(null);
        }
    };

    const handleDelete = async (restaurant) => {
        if (!window.confirm(`Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`)) {
            return;
        }
        
        setDeleting(restaurant.id);
        try {
            const res = await fetch(`${API_BASE}/restaurant/admin/${restaurant.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setRestaurants(prev => prev.filter(r => r.id !== restaurant.id));
                showToast(`🗑️ "${restaurant.name}" deleted successfully!`, 'success');
            } else {
                const msg = await res.text();
                showToast(`❌ Failed to delete: ${msg || res.status}`, 'error');
            }
        } catch (err) {
            showToast(`❌ Error: ${err.message}`, 'error');
        } finally {
            setDeleting(null);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const filtered = restaurants.filter(r => {
        const matchesSearch =
            r.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.email?.toLowerCase().includes(search.toLowerCase()) ||
            r.cuisineType?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: restaurants.length,
        pending: restaurants.filter(r => r.status === 'PENDING').length,
        approved: restaurants.filter(r => r.status === 'APPROVED').length,
    };

    return (
        <div className="admin-page">
            {/* ── Admin Navbar ── */}
            <header className="admin-navbar">
                <Link to="/" className="admin-navbar-brand">🍽️ FoodExpress</Link>
                <div className="admin-navbar-right">
                    <span className="admin-navbar-role">⚙️ Admin</span>
                    <span className="admin-navbar-email">{user?.email}</span>
                    <button className="admin-navbar-logout" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* Toast */}
            {toast && (
                <div className={`admin-toast admin-toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="admin-hero">
                <div className="admin-hero-bg" />
                <div className="admin-hero-content">
                    <div>
                        <h1 className="admin-hero-title">Admin Dashboard</h1>
                        <p className="admin-hero-sub">Manage and approve restaurant registrations</p>
                    </div>
                    <button className="admin-refresh-btn" onClick={fetchRestaurants} disabled={loading}>
                        {loading ? '⏳ Refreshing…' : '🔄 Refresh'}
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <span className="admin-stat-icon">🏪</span>
                    <div>
                        <p className="admin-stat-num">{stats.total}</p>
                        <p className="admin-stat-label">Total Restaurants</p>
                    </div>
                </div>
                <div className="admin-stat-card admin-stat-pending">
                    <span className="admin-stat-icon">⏳</span>
                    <div>
                        <p className="admin-stat-num">{stats.pending}</p>
                        <p className="admin-stat-label">Pending Approval</p>
                    </div>
                </div>
                <div className="admin-stat-card admin-stat-approved">
                    <span className="admin-stat-icon">✅</span>
                    <div>
                        <p className="admin-stat-num">{stats.approved}</p>
                        <p className="admin-stat-label">Approved</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="admin-controls">
                <div className="admin-search-wrap">
                    <span className="admin-search-icon">🔍</span>
                    <input
                        className="admin-search"
                        type="text"
                        placeholder="Search by name, email or cuisine…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="admin-filter-tabs">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                        <button
                            key={s}
                            className={`admin-filter-tab ${filterStatus === s ? 'active' : ''}`}
                            onClick={() => setFilterStatus(s)}
                        >
                            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="admin-content">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-spinner" />
                        <span>Loading restaurants…</span>
                    </div>
                ) : error ? (
                    <div className="admin-error">
                        <p>⚠️ {error}</p>
                        <button className="admin-retry-btn" onClick={fetchRestaurants}>Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="admin-empty">
                        <div className="admin-empty-icon">🍽️</div>
                        <h3>No restaurants found</h3>
                        <p>{search || filterStatus !== 'ALL' ? 'Try a different filter' : 'No registrations yet'}</p>
                    </div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Restaurant</th>
                                    <th>Email</th>
                                    <th>Cuisine</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Active</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => {
                                    const statusInfo = STATUS_COLORS[r.status] || { bg: '#f5f5f5', color: '#666', label: r.status };
                                    const isApproving = approving === r.id;
                                    const alreadyApproved = r.status === 'APPROVED';
                                    return (
                                        <tr key={r.id}>
                                            <td className="admin-td-name">
                                                <div className="admin-rest-avatar">
                                                    {r.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{r.name}</span>
                                            </td>
                                            <td className="admin-td-muted">{r.email}</td>
                                            <td>
                                                <span className="admin-cuisine-tag">{r.cuisineType || '—'}</span>
                                            </td>
                                            <td className="admin-td-muted admin-td-addr">{r.address || '—'}</td>
                                            <td>
                                                <span
                                                    className="admin-status-badge"
                                                    style={{ background: statusInfo.bg, color: statusInfo.color }}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`admin-active-dot ${r.isActive ? 'on' : 'off'}`}>
                                                    {r.isActive ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="admin-approve-btn"
                                                        onClick={() => handleApprove(r)}
                                                        disabled={isApproving || alreadyApproved}
                                                        title={alreadyApproved ? 'Already approved' : 'Approve restaurant'}
                                                    >
                                                        {isApproving ? '⏳ Approving…' : alreadyApproved ? '✓ Approved' : '✅ Approve'}
                                                    </button>
                                                    <button
                                                        className="admin-delete-btn"
                                                        onClick={() => handleDelete(r)}
                                                        disabled={deleting === r.id}
                                                        title="Delete restaurant"
                                                        style={{
                                                            backgroundColor: deleting === r.id ? '#fca5a5' : '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '6px',
                                                            cursor: deleting === r.id ? 'not-allowed' : 'pointer',
                                                            fontWeight: '500',
                                                            fontSize: '0.85rem',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                    >
                                                        {deleting === r.id ? '⏳...' : '🗑️ Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
