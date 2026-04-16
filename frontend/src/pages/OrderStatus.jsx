import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './OrderStatus.css';
import API_BASE from '../api';

const OrderStatus = ({ embedded = false }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                setLoading(true);
                try {
                    const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
                    const response = await fetch(`${API_BASE}/orders/restaurant`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setOrders(data);
                    } else {
                        console.error('Failed to fetch orders, status:', response.status);
                    }
                } catch (error) {
                    console.error("Failed to fetch orders", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleUpdateStatus = (orderId, newStatus) => {
        setOrders(prevOrders => prevOrders.map(order =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const handleStatusChange = async (e, orderId) => {
        const newStatus = e.target.value.toUpperCase();

        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/orders/restaurant/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Optimistically update the UI after successful response
                handleUpdateStatus(orderId, newStatus);
            } else {
                let errorMsg = 'Failed to update order status. Please try again.';
                try {
                    const errorResponse = await response.json();
                    errorMsg = errorResponse.message || errorResponse.error || errorMsg;
                } catch {
                    // fallback to text if it's not JSON
                    const errorText = await response.text();
                    if (errorText) errorMsg = errorText;
                }
                console.error('Failed to update status:', errorMsg);
                alert(`Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert('Error connecting to the server while updating status.');
        }
    };

    const formatItems = (items) => {
        if (!items || items.length === 0) return 'No items details';
        return items.map(item => `${item.quantity}x ${item.productName || 'Item'}`).join(', ');
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Filter by Status Category
            let matchesStatus = true;
            const status = (order.status || 'CREATED').toUpperCase();

            if (currentFilter === 'pending') {
                matchesStatus = ['CREATED', 'PENDING'].includes(status);
            } else if (currentFilter === 'delivered') {
                matchesStatus = status === 'DELIVERED';
            } else if (currentFilter === 'active') {
                matchesStatus = ['CREATED', 'PENDING', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(status);
            }

            // Filter by Search Query
            let matchesSearch = true;
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const oId = order.orderId ? order.orderId.toLowerCase() : '';
                const cName = order.userId ? order.userId.toLowerCase() : '';
                matchesSearch = oId.includes(query) || cName.includes(query);
            }

            return matchesStatus && matchesSearch;
        });
    }, [orders, currentFilter, searchQuery]);

    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter(o => ['CREATED', 'PENDING'].includes((o.status || '').toUpperCase())).length;
    const deliveredOrdersCount = orders.filter(o => (o.status || '').toUpperCase() === 'DELIVERED').length;
    const activeOrdersCount = orders.filter(o => ['CREATED', 'PENDING', 'PREPARING', 'OUT_FOR_DELIVERY'].includes((o.status || '').toUpperCase())).length;

    const statuses = ['CREATED', 'PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: embedded ? '200px' : '100vh', fontSize: '1.5rem' }}>Loading orders...</div>;
    }

    if (!user) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: embedded ? '200px' : '100vh', fontSize: '1.5rem' }}>Please login to view orders.</div>;
    }

    return (
        <div className="order-status-dashboard-container">
            {/* Header — hidden when embedded inside RestaurantDashboard */}
            {!embedded && (
                <header className="os-top-header">
                    <div className="os-logo">
                        <h2>🍴 RestroAdmin</h2>
                    </div>
                    <div className="os-user-profile">
                        <span className="os-role">Owner Dashboard</span>
                        <div className="os-avatar">O</div>
                    </div>
                </header>
            )}

            <main className="os-main-content">
                <div className="os-page-header">
                    <h1>Order Management</h1>
                    <p>Manage and track your restaurant orders seamlessly.</p>
                </div>

                {/* Summary Cards */}
                <section className="os-summary-cards">
                    <div className="os-summary-card">
                        <div className="os-card-icon os-icon-total">📊</div>
                        <div className="os-card-info">
                            <h3>Total Orders</h3>
                            <p>{totalOrdersCount}</p>
                        </div>
                    </div>
                    <div className="os-summary-card">
                        <div className="os-card-icon os-icon-pending">⏳</div>
                        <div className="os-card-info">
                            <h3>Pending Orders</h3>
                            <p>{pendingOrdersCount}</p>
                        </div>
                    </div>
                    <div className="os-summary-card">
                        <div className="os-card-icon os-icon-active">🔥</div>
                        <div className="os-card-info">
                            <h3>Active Orders</h3>
                            <p>{activeOrdersCount}</p>
                        </div>
                    </div>
                    <div className="os-summary-card">
                        <div className="os-card-icon os-icon-delivered">✅</div>
                        <div className="os-card-info">
                            <h3>Delivered Orders</h3>
                            <p>{deliveredOrdersCount}</p>
                        </div>
                    </div>
                </section>

                {/* Controls (Search & Filters) */}
                <section className="os-controls-section">
                    <div className="os-search-container">
                        <span className="os-search-icon">🔍</span>
                        <input
                            type="text"
                            className="os-search-input"
                            placeholder="Search by Order ID or Customer ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="os-filters-container">
                        <button
                            className={`os-filter-btn ${currentFilter === 'all' ? 'os-active' : ''}`}
                            onClick={() => setCurrentFilter('all')}
                        >
                            All Orders
                        </button>
                        <button
                            className={`os-filter-btn ${currentFilter === 'pending' ? 'os-active' : ''}`}
                            onClick={() => setCurrentFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`os-filter-btn ${currentFilter === 'delivered' ? 'os-active' : ''}`}
                            onClick={() => setCurrentFilter('delivered')}
                        >
                            Delivered
                        </button>
                        <button
                            className={`os-filter-btn ${currentFilter === 'active' ? 'os-active' : ''}`}
                            onClick={() => setCurrentFilter('active')}
                        >
                            Active Orders
                        </button>
                    </div>
                </section>

                {/* Orders Table / List */}
                <section className="os-orders-section">
                    <div className="os-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer ID</th>
                                    <th>Ordered Items</th>
                                    <th>Total Amount</th>
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                    <th className="os-text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="os-empty-state">No orders found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => {
                                        const status = order.status ? order.status.toUpperCase() : 'CREATED';
                                        let statusClass = 'os-status-' + status.toLowerCase().replace(/_/g, '-');
                                        return (
                                            <tr key={order.orderId}>
                                                <td className="os-order-id" title={order.orderId}>{order.orderId ? order.orderId.substring(0, 8) + '...' : 'N/A'}</td>
                                                <td className="os-customer-name" title={order.userId}>{order.userId ? order.userId.substring(0, 8) + '...' : 'Guest'}</td>
                                                <td className="os-order-items" title={formatItems(order.items)}>{formatItems(order.items)}</td>
                                                <td className="os-total-amount">₹{order.totalPrice || 0}</td>
                                                <td className="os-order-date">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date not available'}</td>
                                                <td>
                                                    <span className={`os-status-badge ${statusClass}`} style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</span>
                                                </td>
                                                <td className="os-text-right">
                                                    <div className="os-actions-container">
                                                        <select
                                                            className="os-status-select"
                                                            value={status}
                                                            onChange={(e) => handleStatusChange(e, order.orderId)}
                                                            style={{ textTransform: 'capitalize' }}
                                                        >
                                                            {statuses.map(s => (
                                                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OrderStatus;
