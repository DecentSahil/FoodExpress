
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './Products.css';
import API_BASE from '../api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // unfiltered — used to derive category list

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [vegType, setVegType] = useState('all');
    const [priceSort, setPriceSort] = useState(''); // 'low', 'high'

    const { addToCart } = useCart();

    // Derive unique category names from whatever products are currently loaded
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();

    // Fetch all products when search/veg/price filters change (category is filtered client-side)
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (vegType === 'veg') params.append('veg', 'true');
                if (vegType === 'non-veg') params.append('veg', 'false');

                const response = await fetch(`${API_BASE}/restaurant/public/menu/search?${params.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch products');

                const data = await response.json();
                let content = data.content || data;

                // Filter out unavailable items
                content = content.filter(item => !(
                    item.available === false || item.isAvailable === false ||
                    String(item.available) === 'false' || String(item.isAvailable) === 'false'
                ));

                // Client-side veg/non-veg filter (backend may not honour veg=false)
                if (vegType === 'veg') {
                    content = content.filter(item => item.veg === true || item.isVeg === true || String(item.veg) === 'true' || String(item.isVeg) === 'true');
                } else if (vegType === 'non-veg') {
                    content = content.filter(item => !(item.veg === true || item.isVeg === true || String(item.veg) === 'true' || String(item.isVeg) === 'true'));
                }

                setAllProducts(content); // keep full list to derive categories

                // Client-side category filter
                let filtered = content;
                if (selectedCategory) {
                    filtered = content.filter(item => item.category === selectedCategory);
                }

                // Client-side price sort
                if (priceSort === 'low') {
                    filtered = [...filtered].sort((a, b) => a.price - b.price);
                } else if (priceSort === 'high') {
                    filtered = [...filtered].sort((a, b) => b.price - a.price);
                }

                setProducts(filtered);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchProducts, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategory, vegType, priceSort]);

    if (loading && products.length === 0) return <div className="container">Loading products...</div>;
    if (error) return <div className="container">Error: {error}</div>;

    return (
        <div className="container">
            <h1>All Food Items</h1>

            <div className="filters-bar card">
                <input
                    type="text"
                    placeholder="Search food items..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="filter-group">
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select value={vegType} onChange={(e) => setVegType(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option value="all">Dietary Disp.</option>
                        <option value="veg">Veg Only</option>
                        <option value="non-veg">Non-Veg Only</option>
                    </select>

                    <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)}>
                        <option value="">Sort by Price</option>
                        <option value="low">Low to High</option>
                        <option value="high">High to Low</option>
                    </select>
                </div>
            </div>

            <div className="menu-grid">
                {products.map(item => (
                    <div key={`${item.restaurantId}-${item.id}`} className="card menu-card">
                        <img
                            src={item.productImage ? `${API_BASE}/uploads/products/${item.productImage}` : "https://placehold.co/600x400?text=No+Image"}
                            alt={item.name}
                            className="card-img"
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                        />
                        <div className="card-content">
                            <div className="item-header">
                                <span className={(item.veg === true || item.isVeg === true || String(item.veg) === 'true' || String(item.isVeg) === 'true') ? 'veg-badge' : 'non-veg-badge'}>
                                    {(item.veg === true || item.isVeg === true || String(item.veg) === 'true' || String(item.isVeg) === 'true') ? 'Veg' : 'Non-Veg'}
                                </span>
                                <span className="restaurant-tag">{item.restaurantName}</span>
                            </div>
                            <h3 className="card-title">{item.name}</h3>
                            <p className="card-info">{item.category}</p>
                            <p className="description">{item.description}</p>
                            {(item.available === false || item.isAvailable === false || String(item.available) === 'false' || String(item.isAvailable) === 'false') && (
                                <p className="availability-text" style={{ fontSize: '0.85rem', color: '#dc3545', margin: '5px 0', fontWeight: 'bold' }}>
                                    Currently Unavailable
                                </p>
                            )}
                            <div className="price-row">
                                <span className="price">₹{item.price}</span>
                                <button
                                    className="add-btn-small"
                                    onClick={() => addToCart({ ...item, restaurantId: item.restaurantId || item.restaurant_id })}
                                    disabled={item.available === false || item.isAvailable === false || String(item.available) === 'false' || String(item.isAvailable) === 'false'}
                                    style={{
                                        opacity: (item.available === false || item.isAvailable === false || String(item.available) === 'false' || String(item.isAvailable) === 'false') ? 0.5 : 1,
                                        cursor: (item.available === false || item.isAvailable === false || String(item.available) === 'false' || String(item.isAvailable) === 'false') ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    ADD +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {!loading && products.length === 0 && <p className="empty-state">No items found matching your filters.</p>}
        </div>
    );
};

export default Products;
