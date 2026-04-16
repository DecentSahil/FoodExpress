
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Orders.css';
import API_BASE from '../api';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const isRestaurant = user?.role && user.role.toUpperCase().includes('RESTAURANT');

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                setLoading(true);
                try {
                    const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
                    const endpoint = isRestaurant
                        ? `${API_BASE}/orders/restaurant`
                        : `${API_BASE}/orders/users`;

                    const response = await fetch(endpoint, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Filter out orders that have items missing (empty product names) or handle them gracefully
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
    }, [user, isRestaurant]);

    if (loading) return (
        <div className="orders-container">
            <div className="loading-state">
                <div className="orders-spinner" />
                <span>Loading your orders…</span>
            </div>
        </div>
    );

    if (!user) return (
        <div className="orders-container">
            <div className="empty-state">
                <div className="empty-state-icon">🔐</div>
                <h3>Login Required</h3>
                <p>Please login to view your orders.</p>
                <a href="/login" className="empty-state-btn">Go to Login</a>
            </div>
        </div>
    );

    return (
        <div className="orders-container">
            <h1 className="orders-title">
                {isRestaurant ? 'Restaurant Orders' : 'My Orders'}
            </h1>

            <div className="orders-list">
                {orders.length === 0 ? (
                    <div className="empty-state">
                        <h3>No orders found</h3>
                        <p>{isRestaurant ? "You haven't received any orders yet." : "Looks like you haven't placed any orders yet."}</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.orderId} className="order-card">
                            <div className="order-header">
                                <div>
                                    <h3 className="order-id">Order #{order.orderId?.substring(0, 8)}</h3>
                                    <p className="order-date">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date not available'}
                                    </p>
                                </div>
                                <div className="order-status-amount">
                                    <span className={`status-badge ${order.status ? order.status.toLowerCase() : 'created'}`}>
                                        {order.status || 'CREATED'}
                                    </span>
                                    <p className="order-amount">₹{order.totalPrice || order.totalAmount}</p>
                                </div>
                            </div>

                            <div className="order-details-section">
                                <div className="order-meta">
                                    {isRestaurant ? (
                                        <p><strong>Customer ID:</strong> {order.userId || 'N/A'}</p>
                                    ) : (
                                        <p><strong>Restaurant ID:</strong> {order.restaurantName || 'N/A'}</p>
                                    )}
                                </div>

                                <div className="items-list">
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <div key={item.menuItemId || index} className="item-row">
                                                <div className="item-info">
                                                    <span className="item-quantity">{item.quantity}x</span>
                                                    <span className="item-name">{item.productName || 'Unknown Item'}</span>
                                                </div>
                                                <span className="item-price">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#888', fontStyle: 'italic' }}>No item details available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;
