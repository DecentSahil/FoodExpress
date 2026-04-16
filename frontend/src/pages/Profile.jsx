import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Profile.css';
import API_BASE from '../api';

const statusColors = {
    Delivered: { bg: '#e8f5e9', color: '#2e7d32' },
    Cancelled: { bg: '#fce4ec', color: '#c62828' },
    Pending: { bg: '#fff8e1', color: '#f57f17' },
};

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // API State
    const [profile, setProfile] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({ name: '', number: '', line1: '', city: '', state: '', pincode: '' });

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', number: '' });
    const [profileSubmitting, setProfileSubmitting] = useState(false);

    // File upload state & ref
    const fileInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const isRestaurant = user?.role && user.role.toUpperCase().includes('RESTAURANT');
    const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Profile
                const profileRes = await fetch(`${API_BASE}/user/profile`, { headers });
                if (profileRes.ok) setProfile(await profileRes.json());

                // Fetch Addresses
                const addressRes = await fetch(`${API_BASE}/user/address`, { headers });
                if (addressRes.ok) setAddresses(await addressRes.json());

                // Fetch Orders
                const orderEndpoint = isRestaurant ? `${API_BASE}/orders/restaurant` : `${API_BASE}/orders/users`;
                const orderRes = await fetch(orderEndpoint, { headers });
                if (orderRes.ok) setOrders(await orderRes.json());

            } catch (err) {
                console.error("Failed to fetch profile data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, token, isRestaurant]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // ── Profile Handlers ──
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/user/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm)
            });
            if (res.ok) {
                await res.text(); // consume the "Updated successfully" string from the backend

                // Optimistically update the profile state visually
                setProfile(prev => ({
                    ...prev,
                    name: profileForm.name,
                    number: profileForm.number
                }));

                setIsEditingProfile(false);
            } else {
                alert('Failed to update profile.');
            }
        } catch (err) {
            console.error("Profile update failed:", err);
            alert('An error occurred. Please try again.');
        } finally {
            setProfileSubmitting(false);
        }
    };

    // ── Address Handlers ──
    const handleAddAddressClick = () => {
        setEditingAddress(null);
        setAddressForm({ name: '', number: '', line1: '', city: '', state: '', pincode: '' });
        setShowAddressForm(true);
    };

    const handleEditAddressClick = (addr) => {
        setEditingAddress(addr.id);
        setAddressForm({ name: addr.name || '', number: addr.number || '', line1: addr.line1, city: addr.city, state: addr.state, pincode: addr.pincode });
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingAddress ? 'PUT' : 'POST';
            const payload = { ...addressForm, id: editingAddress };
            const res = await fetch(`${API_BASE}/user/address`, {
                method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowAddressForm(false);
                // Refresh addresses
                const refreshRes = await fetch(`${API_BASE}/user/address`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (refreshRes.ok) setAddresses(await refreshRes.json());
            } else {
                let err = await res.text();
                try { const parsed = JSON.parse(err); if (Array.isArray(parsed.fieldErrors)) { err = parsed.fieldErrors.map(e=>e.defaultMessage).join(', '); } else if (parsed.errors && typeof parsed.errors === 'object') { err = Object.values(parsed.errors).join(', '); } else { err = parsed.message || parsed.error || err; } } catch(e) {}
                alert(`Failed to save address: ${err}`);
            }
        } catch (err) {
            console.error("Address save failed:", err);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            const res = await fetch(`${API_BASE}/user/address/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAddresses(addresses.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSetDefaultAddress = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/user/address/${id}/default`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Optimistically update
                setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ── Profile Avatar Handlers ──
    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/user/profile-pic`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // Note: No Content-Type header so browser boundary logic kicks in
                body: formData
            });

            if (res.ok) {
                // Image uploaded successfully, fetch the updated profile to get the new filename
                const profileRes = await fetch(`${API_BASE}/user/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    setProfile(await profileRes.json());
                    window.dispatchEvent(new Event('profilePicUpdated'));
                }
            } else {
                alert("Failed to upload profile picture. Please try again.");
            }
        } catch (err) {
            console.error("Avatar upload error:", err);
            alert("An error occurred while uploading. Please try again.");
        } finally {
            setUploadingAvatar(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = null;
        }
    };

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-not-logged-in">
                    <div className="profile-lock-icon">🔐</div>
                    <h2>Login Required</h2>
                    <p>Please login to view your profile.</p>
                    <Link to="/login" className="profile-cta-btn">Go to Login</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="profile-page" style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #e23744', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p>Loading your profile...</p>
            </div>
        );
    }

    const displayName = profile?.name || user.name || user.email?.split('@')[0] || 'User';
    const emailToDisplay = profile?.email || user.email;
    const phoneToDisplay = profile?.number || 'Not provided';
    const initials = displayName.charAt(0).toUpperCase();
    const avatarUrl = profile?.profilePic ? `${API_BASE}/uploads/userPhoto/${profile.profilePic}` : null;

    const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);

    return (
        <div className="profile-page">
            {/* ── Hidden File Input for Avatar Upload ── */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* ── Hero / Header Card ── */}
            <div className="profile-hero">
                <div className="profile-hero-bg" />
                <div className="profile-hero-content">
                    <div className="profile-big-avatar" onClick={handleAvatarClick}>
                        {uploadingAvatar ? (
                            <div style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        ) : avatarUrl ? (
                            <img src={avatarUrl} alt="Profile Avatar" className="profile-avatar-img" />
                        ) : (
                            initials
                        )}
                        <div className="profile-avatar-overlay">📷</div>
                    </div>
                    <div className="profile-hero-info">
                        <h1 className="profile-display-name">{displayName}</h1>
                        <p className="profile-hero-email">{emailToDisplay}</p>
                        <div className="profile-hero-meta">
                            <span className="profile-role-badge">
                                {isRestaurant ? '🍽️ Restaurant Owner' : '🛍️ Customer'}
                            </span>
                        </div>
                    </div>
                    <button className="profile-logout-btn" onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="profile-stats-row">
                <div className="profile-stat-card">
                    <span className="profile-stat-number">{orders.length}</span>
                    <span className="profile-stat-label">Total Orders</span>
                </div>
                <div className="profile-stat-card">
                    <span className="profile-stat-number">₹{totalSpent}</span>
                    <span className="profile-stat-label">Amount Spent</span>
                </div>
                <div className="profile-stat-card">
                    <span className="profile-stat-number">{addresses.length}</span>
                    <span className="profile-stat-label">Saved Addresses</span>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="profile-tabs">
                {['overview', 'orders', 'addresses'].map(tab => (
                    <button
                        key={tab}
                        className={`profile-tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => { setActiveTab(tab); setShowAddressForm(false); }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === 'overview' && (
                <div className="profile-section-grid">
                    <div className="profile-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 className="profile-card-title" style={{ margin: 0 }}>Personal Info</h3>
                            {!isEditingProfile && (
                                <button
                                    className="profile-addr-btn edit"
                                    onClick={() => {
                                        setProfileForm({ name: displayName, number: profile?.number || '' });
                                        setIsEditingProfile(true);
                                    }}
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {isEditingProfile ? (
                            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Full Name</label>
                                    <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Email (Unchangeable)</label>
                                    <input value={emailToDisplay} disabled style={{ padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#f9f9f9', color: '#999' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Phone Number</label>
                                    <input value={profileForm.number} onChange={e => setProfileForm({ ...profileForm, number: e.target.value })} placeholder="e.g. +91 9876543210" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                    <button type="submit" disabled={profileSubmitting} style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        {profileSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => setIsEditingProfile(false)} style={{ padding: '10px 20px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Full Name</span>
                                    <span className="profile-info-value">{displayName}</span>
                                </div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Email</span>
                                    <span className="profile-info-value">{emailToDisplay}</span>
                                </div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Phone</span>
                                    <span className="profile-info-value" style={!profile?.phone ? { color: '#999', fontStyle: 'italic' } : {}}>{phoneToDisplay}</span>
                                </div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Role</span>
                                    <span className="profile-info-value">{user.role || 'Customer'}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="profile-card">
                        <h3 className="profile-card-title">Default Address</h3>
                        {addresses.filter(a => a.isDefault).length > 0 ? (
                            addresses.filter(a => a.isDefault).map(addr => (
                                <div key={addr.id}>
                                    <p className="profile-addr-label-badge">{addr.name || 'Default'}</p>
                                    <p className="profile-addr-line">{addr.line1}</p>
                                    {addr.number && <p className="profile-addr-line">{addr.number}</p>}
                                    <p className="profile-addr-line">{addr.city}, {addr.state}</p>
                                    <p className="profile-addr-line">PIN: {addr.pincode}</p>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#888' }}>No default address set.</p>
                        )}
                        <button className="profile-text-btn" onClick={() => setActiveTab('addresses')}>
                            Manage Addresses →
                        </button>
                    </div>

                    <div className="profile-card">
                        <h3 className="profile-card-title">Recent Orders</h3>
                        {orders.length === 0 ? (
                            <p style={{ color: '#888' }}>No orders found.</p>
                        ) : (
                            orders.slice(0, 2).map((order) => (
                                <div key={order.orderId} className="profile-mini-order">
                                    <div>
                                        <p className="profile-mini-order-rest">Order #{order.orderId?.substring(0, 8)}</p>
                                        <p className="profile-mini-order-date">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} items</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="profile-mini-order-amt">₹{order.totalPrice || order.totalAmount}</p>
                                        <span className="profile-order-status" style={statusColors[order.status] || statusColors.Pending}>
                                            {order.status || 'CREATED'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        <button className="profile-text-btn" onClick={() => setActiveTab('orders')}>
                            View All Orders →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Tab: Orders ── */}
            {activeTab === 'orders' && (
                <div className="profile-card profile-card-full">
                    <h3 className="profile-card-title">Order History</h3>
                    {orders.length === 0 ? (
                        <p style={{ color: '#888' }}>You haven't placed any orders yet.</p>
                    ) : (
                        orders.map(order => (
                            <div key={order.orderId} className="profile-order-row">
                                <div className="profile-order-icon">🍱</div>
                                <div className="profile-order-details">
                                    <p className="profile-order-id">Order #{order.orderId?.substring(0, 8)}</p>
                                    <p className="profile-order-rest">{isRestaurant ? `Customer: ${order.userId}` : `Restaurant: ${order.restaurantName || 'N/A'}`}</p>
                                    <p className="profile-order-meta">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} items</p>
                                </div>
                                <div className="profile-order-right">
                                    <p className="profile-order-total">₹{order.totalPrice || order.totalAmount}</p>
                                    <span className="profile-order-status" style={statusColors[order.status] || statusColors.Pending}>
                                        {order.status || 'CREATED'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── Tab: Addresses ── */}
            {activeTab === 'addresses' && (
                <>
                    {showAddressForm ? (
                        <div className="profile-card profile-card-full">
                            <h3 className="profile-card-title">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                            <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <input value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} placeholder="Full Name" required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <input value={addressForm.number} onChange={e => setAddressForm({ ...addressForm, number: e.target.value })} placeholder="Phone Number" required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                                <input value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} placeholder="Street Address" required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <input value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <input value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State" required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                                <input value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="Pincode" required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Address</button>
                                    <button type="button" onClick={() => setShowAddressForm(false)} style={{ padding: '10px 20px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="profile-addresses-grid">
                            {addresses.map(addr => (
                                <div key={addr.id} className={`profile-address-card ${addr.isDefault ? 'default' : ''}`}>
                                    <div className="profile-address-header">
                                        <span className="profile-addr-label-badge">{addr.name || 'Address'}</span>
                                        {addr.isDefault && <span className="profile-default-badge">Default</span>}
                                    </div>
                                    {addr.number && <p className="profile-addr-line" style={{ fontWeight: '500', color: '#333' }}>{addr.number}</p>}
                                    <p className="profile-addr-line">{addr.line1}</p>
                                    <p className="profile-addr-line">{addr.city}, {addr.state}</p>
                                    <p className="profile-addr-line">PIN: {addr.pincode}</p>

                                    <div className="profile-addr-actions">
                                        <button className="profile-addr-btn edit" onClick={() => handleEditAddressClick(addr)}>Edit</button>
                                        {!addr.isDefault && <button className="profile-addr-btn set-default" style={{ background: '#f0f0f0', color: '#333' }} onClick={() => handleSetDefaultAddress(addr.id)}>Set Default</button>}
                                        <button className="profile-addr-btn" style={{ marginLeft: 'auto', background: '#ffebee', color: '#d32f2f' }} onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                            <div className="profile-add-address-card" onClick={handleAddAddressClick}>
                                <div className="profile-add-address-icon">＋</div>
                                <p>Add New Address</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Profile;
