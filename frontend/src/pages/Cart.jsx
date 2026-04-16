import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE from '../api';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, totalAmount } = useCart();
    const navigate = useNavigate();

    const handleProceedToCheckout = () => {
        if (cartItems.length === 0) return;
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="container empty-state" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h2>Your Cart is Empty</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/restaurants" className="checkout-btn" style={{ padding: '12px 30px', textDecoration: 'none', display: 'inline-block', width: 'auto' }}>Browse Restaurants</Link>
            </div>
        );
    }



    // A simple dash line style for dividers
    const Divider = () => (
        <div style={{ height: '1px', borderBottom: '1px dashed #eaeaea', width: '100%', margin: '10px 0' }}></div>
    );

    return (
        <div className="cart-page-container">
            <div className="cart-grid">
                {/* Left Side: Cart Items */}
                <div className="cart-main">
                    <h2 className="cart-heading">Your Cart ({cartItems.length} Items)</h2>
                    <Divider />
                    <div className="cart-item-list">
                        {cartItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <div className="cart-item-row">
                                    <div className="cart-item-info">
                                        <img 
                                            src={item.productImage ? `${API_BASE}/uploads/products/${item.productImage}` : "https://placehold.co/100x100?text=Food"} 
                                            alt={item.name} 
                                            className="cart-item-img"
                                            onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Food"; }}
                                        />
                                        <div className="cart-item-details">
                                            <h3 className="cart-item-name">{item.name}</h3>
                                            <p className="cart-item-category">{item.categoryName || item.restaurantName || 'Food'}</p>
                                            <p className="cart-item-price">₹{(item.price || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="cart-item-actions">
                                        <div className="qty-pill">
                                            <button className="qty-minus" onClick={() => updateQuantity(item.id, -1)}>&minus;</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button className="qty-plus" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeFromCart(item.cartItemId)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trash-icon">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                {index < cartItems.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <div className="cart-sidebar">
                    <div className="order-summary-card">
                        <h2 className="summary-heading">Order Summary</h2>
                        <br/>
                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">₹{totalAmount.toFixed(2)}</span>
                        </div>
                        <br/>
                        <div className="coupon-section">
                            <input type="text" placeholder="Coupon Code (e.g. ZOMATO50)" className="coupon-input" />
                            <button className="coupon-btn">Apply</button>
                        </div>
                        
                        <div className="summary-row total-row">
                            <span className="total-label">Total Price</span>
                            <span className="total-value">₹{totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <button 
                            className="checkout-btn"
                            onClick={handleProceedToCheckout}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
