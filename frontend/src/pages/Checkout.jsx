import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import './Checkout.css';
import API_BASE from '../api';

const Checkout = () => {
    const { cartItems, totalAmount, checkout } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Steps: 1 = Address, 2 = Payment
    const [step, setStep] = useState(1);
    
    // Address State
    const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addressLoading, setAddressLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({ name: '', number: '', line1: '', city: '', state: '', pincode: '' });

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('');
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // Fetch Addresses
    useEffect(() => {
        if (!token) return;
        setAddressLoading(true);
        fetch(`${API_BASE}/user/address`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            setAddresses(data);
            const defaultAddr = data.find(a => a.isDefault) || data[0];
            if (defaultAddr) setSelectedAddress(defaultAddr.id);
        })
        .catch(err => console.error("Failed to fetch addresses:", err))
        .finally(() => setAddressLoading(false));
    }, [token]);

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/user/address`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(addressForm)
            });

            if (res.ok) {
                setShowAddressForm(false);
                setAddressForm({ name: '', number: '', line1: '', city: '', state: '', pincode: '' });
                const refreshRes = await fetch(`${API_BASE}/user/address`, { headers: { 'Authorization': `Bearer ${token}` }});
                if (refreshRes.ok) {
                    const updated = await refreshRes.json();
                    setAddresses(updated);
                    const newAddr = updated[updated.length - 1];
                    if (newAddr) setSelectedAddress(newAddr.id);
                }
            } else {
                alert("Failed to add address. Please try again.");
            }
        } catch (err) {
            console.error("Address save failed:", err);
        }
    };

    const handleProceedToPayment = () => {
        if (!selectedAddress) {
            alert("Please select a delivery address.");
            return;
        }
        setStep(2);
    };

    const handlePlaceOrder = async () => {
        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }
        setCheckoutLoading(true);
        try {
            // Because the backend checkout doesn't natively accept the address/payment UI data yet,
            // we will proceed to call the cart service checkout, which integrates with order-service.
            await checkout();
            navigate('/orders');
        } catch (err) {
            alert(err.message || 'Checkout failed. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    const shippingFee = 40;
    const finalTotal = totalAmount + shippingFee;

    return (
        <div className="checkout-page-container">
            <div className="checkout-header">
                <h1>Checkout</h1>
            </div>

            <div className="checkout-stepper">
                <div className={`step-indicator ${step >= 1 ? 'completed' : ''}`}>
                    <div className="step-number">✓</div>
                    <span>Cart</span>
                </div>
                <div className="step-divider" />
                <div className={`step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                    <span>Address</span>
                </div>
                <div className="step-divider" />
                <div className={`step-indicator ${step === 2 ? 'active' : ''}`}>
                    <div className="step-number">2</div>
                    <span>Payment</span>
                </div>
            </div>

            {step === 1 && (
                <div className="checkout-card">
                    <h2>Select Delivery Address</h2>
                    
                    {addressLoading ? (
                        <p>Loading addresses...</p>
                    ) : (
                        <div className="checkout-address-list">
                            {addresses.map(addr => (
                                <div 
                                    key={addr.id} 
                                    className={`checkout-address-card ${selectedAddress === addr.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAddress(addr.id)}
                                >
                                    <div className="checkout-address-name">{addr.name || 'Address'}</div>
                                    {addr.number && <div className="checkout-address-detail" style={{ fontWeight: 'bold' }}>{addr.number}</div>}
                                    <div className="checkout-address-detail">{addr.line1}</div>
                                    <div className="checkout-address-detail">{addr.city}, {addr.state} - {addr.pincode}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showAddressForm ? (
                        <button className="checkout-add-address-btn" onClick={() => setShowAddressForm(true)}>
                            + Add New Address
                        </button>
                    ) : (
                        <form className="checkout-address-form" onSubmit={handleAddressSubmit}>
                            <h3>Add Delivery Address</h3>
                            <div className="checkout-form-row">
                                <input className="checkout-input" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} placeholder="Full Name" required />
                                <input className="checkout-input" value={addressForm.number} onChange={e => setAddressForm({...addressForm, number: e.target.value})} placeholder="Phone Number" required />
                            </div>
                            <input className="checkout-input" value={addressForm.line1} onChange={e => setAddressForm({...addressForm, line1: e.target.value})} placeholder="Street Address" required />
                            <div className="checkout-form-row">
                                <input className="checkout-input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} placeholder="City" required />
                                <input className="checkout-input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} placeholder="State" required />
                            </div>
                            <input className="checkout-input" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} placeholder="PIN Code" required style={{ width: '50%' }} />
                            
                            <div className="checkout-form-actions">
                                <button type="submit" className="checkout-btn-primary" style={{ width: 'auto' }}>Save Address</button>
                                {addresses.length > 0 && (
                                    <button type="button" className="checkout-btn-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>
                                )}
                            </div>
                        </form>
                    )}

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button className="checkout-btn-secondary" onClick={() => navigate('/cart')}>Back to Cart</button>
                        <button 
                            className="checkout-btn-primary" 
                            style={{ width: 'auto', padding: '12px 40px' }}
                            onClick={handleProceedToPayment}
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="checkout-card">
                    <h2>Payment Options</h2>
                    <p style={{ color: '#666', marginBottom: '25px' }}>Total Amount to Pay: <strong>₹{finalTotal.toFixed(2)}</strong></p>

                    <div className="payment-methods">
                        <div 
                            className={`payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <div className="payment-radio"></div>
                            <div className="payment-method-info">
                                <div className="payment-method-title">Credit / Debit Card</div>
                                <div className="payment-method-desc">Pay seamlessly using your Visa or Mastercard</div>
                            </div>
                            <div style={{ fontSize: '1.5rem' }}>💳</div>
                        </div>

                        <div 
                            className={`payment-method-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('upi')}
                        >
                            <div className="payment-radio"></div>
                            <div className="payment-method-info">
                                <div className="payment-method-title">UPI (Google Pay, PhonePe)</div>
                                <div className="payment-method-desc">Instant transfer from your bank account</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1B5e20' }}>UPI</div>
                        </div>

                        <div 
                            className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('cod')}
                        >
                            <div className="payment-radio"></div>
                            <div className="payment-method-info">
                                <div className="payment-method-title">Cash on Delivery</div>
                                <div className="payment-method-desc">Pay when your food arrives</div>
                            </div>
                            <div style={{ fontSize: '1.5rem' }}>💵</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button className="checkout-btn-secondary" onClick={() => setStep(1)} disabled={checkoutLoading}>Back</button>
                        <button 
                            className="checkout-btn-primary" 
                            style={{ width: 'auto', padding: '12px 40px' }}
                            onClick={handlePlaceOrder}
                            disabled={checkoutLoading}
                        >
                            {checkoutLoading ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)} & Place Order`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
