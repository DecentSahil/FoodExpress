
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API_BASE from '../api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [itemsCount, setItemsCount] = useState(0);
    const { user } = useAuth();

    // Build consistent auth headers for all cart requests
    const authHeaders = (extra = {}) => ({
        'Content-Type': 'application/json',
        ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        ...(user?.id ? { 'X-User-Id': String(user.id) } : {}),
        ...extra
    });

    // Recalculate totals whenever items change
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setTotalAmount(total);
        setItemsCount(count);
    }, [cartItems]);

    // ─── Fetch cart from backend ───────────────────────────────────────────────
    const fetchCart = async () => {
        if (!user?.token) return;
        try {
            const response = await fetch(`${API_BASE}/cart`, {
                headers: authHeaders({ 'Content-Type': undefined })
            });

            if (response.ok) {
                const cartData = await response.json();
                if (cartData.items && cartData.items.length > 0) {
                    const mapped = cartData.items.map(cartItem => ({
                        id: cartItem.menuItemId,
                        cartItemId: cartItem.cartItemId,
                        name: cartItem.name || 'Unknown Item',
                        price: cartItem.price || 0,
                        quantity: cartItem.quantity,
                        restaurantId: cartData.restaurantId,
                        restaurantName: cartData.restaurantName || 'Restaurant',
                        productImage: cartItem.productImage || null,
                    }));
                    setCartItems(mapped);
                } else {
                    setCartItems([]);
                }
            } else if (response.status === 404) {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    // Load cart on login / user change — skip for restaurant/admin roles (no cart on backend)
    useEffect(() => {
        const role = user?.role?.toUpperCase() || '';
        const isRestaurantOrAdmin = role.includes('RESTAURANT') || role.includes('ADMIN');
        if (user && !isRestaurantOrAdmin) fetchCart();
        else setCartItems([]);
    }, [user]);

    // ─── Add to cart ───────────────────────────────────────────────────────────
    const addToCart = async (product, quantity = 1) => {
        if (!user) {
            alert('Please login to add items to cart');
            return;
        }

        // Validate restaurantId presence
        if (!product.restaurantId) {
            alert('Error: Restaurant ID is missing. Please try again.');
            console.error('Product missing restaurantId:', product);
            return;
        }

        // Optimistic update
        setCartItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                );
            }
            return [...prev, {
                id: product.id,
                cartItemId: null,           // will be set after fetchCart
                name: product.name,
                price: product.price,
                quantity,
                restaurantId: product.restaurantId,
                restaurantName: product.restaurantName || 'Restaurant',
                productImage: product.productImage || null,
            }];
        });

        try {
            const response = await fetch(`${API_BASE}/cart/add`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    restaurantId: product.restaurantId,
                    menuItemId: product.id,
                    quantity,
                })
            });

            if (!response.ok) {
                let msg = 'Failed to add to cart';
                try {
                    const err = await response.json();
                    msg = err.message || msg;
                } catch (_) { }
                throw new Error(msg);
            }

            // Refresh to get real cartItemIds from backend
            await fetchCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.message);
            await fetchCart(); // revert optimistic update
        }
    };

    // ─── Remove one item ───────────────────────────────────────────────────────
    const removeFromCart = async (cartItemId) => {
        setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId && i.id !== cartItemId));

        if (!user || !cartItemId) return;
        try {
            await fetch(`${API_BASE}/cart/remove/${cartItemId}`, {
                method: 'DELETE',
                headers: authHeaders({ 'Content-Type': undefined })
            });
        } catch (error) {
            console.error('Failed to remove item:', error);
            await fetchCart(); // revert
        }
    };

    // ─── Update quantity (syncs both + and - to backend) ────────────────────────
    const updateQuantity = async (productId, delta) => {
        const item = cartItems.find(i => i.id === productId);
        if (!item) return;

        const newQty = item.quantity + delta;

        if (newQty <= 0) {
            // Remove the item entirely
            await removeFromCart(item.cartItemId);
            return;
        }

        // Optimistic update
        setCartItems(prev => prev.map(i =>
            i.id === productId ? { ...i, quantity: newQty } : i
        ));

        if (!user) return;

        if (delta > 0) {
            // Increment: call add with quantity 1
            try {
                const response = await fetch(`${API_BASE}/cart/add`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        restaurantId: item.restaurantId,
                        menuItemId: item.id,
                        quantity: 1,
                    })
                });
                if (!response.ok) throw new Error('Failed to increment quantity');
                await fetchCart();
            } catch (error) {
                console.error('Failed to increment quantity:', error);
                await fetchCart(); // revert
            }
        } else {
            // Decrement: remove the item entirely, then re-add with the new quantity.
            // We MUST verify the DELETE succeeded before adding — otherwise /cart/add
            // accumulates on top of the existing backend quantity and the count inflates.
            if (!item.cartItemId) {
                // cartItemId not yet assigned (optimistic item) — re-sync from server
                await fetchCart();
                return;
            }
            try {
                const deleteResponse = await fetch(`${API_BASE}/cart/remove/${item.cartItemId}`, {
                    method: 'DELETE',
                    headers: authHeaders({ 'Content-Type': undefined })
                });
                if (!deleteResponse.ok) throw new Error('Failed to remove item before decrement');

                // Item is confirmed gone from backend — now add back with the reduced qty
                const addResponse = await fetch(`${API_BASE}/cart/add`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        restaurantId: item.restaurantId,
                        menuItemId: item.id,
                        quantity: newQty,
                    })
                });
                if (!addResponse.ok) throw new Error('Failed to re-add item after decrement');
                await fetchCart();
            } catch (error) {
                console.error('Failed to decrement quantity:', error);
                await fetchCart(); // revert optimistic update
            }
        }
    };

    // ─── Clear cart ────────────────────────────────────────────────────────────
    const clearCart = async () => {
        setCartItems([]);
        if (!user) return;
        try {
            await fetch(`${API_BASE}/cart/clear`, {
                method: 'DELETE',
                headers: authHeaders({ 'Content-Type': undefined })
            });
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    // ─── Checkout ──────────────────────────────────────────────────────────────
    const checkout = async () => {
        if (!user) throw new Error('Not logged in');
        const response = await fetch(`${API_BASE}/cart/checkout`, {
            method: 'POST',
            headers: authHeaders()
        });
        if (!response.ok) {
            let msg = 'Checkout failed';
            try { const err = await response.json(); msg = err.message || msg; } catch (_) { }
            throw new Error(msg);
        }
        setCartItems([]);
        return await response.json().catch(() => null);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            checkout,
            totalAmount,
            itemsCount,
            fetchCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};
