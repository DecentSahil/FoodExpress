import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './RestaurantMenu.css';
import API_BASE from '../api';

const RestaurantMenu = () => {
    const { id } = useParams();
    const [menu, setMenu] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [filteredMenu, setFilteredMenu] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [vegType, setVegType] = useState('all');

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch restaurant details
                const restaurantRes = await fetch(`${API_BASE}/restaurant/public/menu/${id}`);
                if (!restaurantRes.ok) throw new Error('Failed to fetch restaurant');
                const restaurantData = await restaurantRes.json();
                setRestaurant(restaurantData);

                // Fetch menu items
                const menuRes = await fetch(`${API_BASE}/restaurant/public/menu/${id}`);
                if (!menuRes.ok) throw new Error('Failed to fetch menu');
                const menuData = await menuRes.json();
                setMenu(menuData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        if (!menu) return;
        let result = [...menu];

        if (searchTerm) {
            result = result.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (selectedCategory !== 'All') {
            result = result.filter(item => item.category === selectedCategory);
        }

        if (vegType === 'veg') {
            result = result.filter(item => item.veg === true || item.isVeg === true || String(item.veg) === 'true' || String(item.isVeg) === 'true');
        } else if (vegType === 'non-veg') {
            result = result.filter(item => !(item.veg === true || item.isVeg === true || String(item.veg) === 'true' || String(item.isVeg) === 'true'));
        }

        setFilteredMenu(result);
    }, [menu, searchTerm, selectedCategory, vegType]);

    if (loading) return <div className="modern-loading">Loading delicious menu...</div>;
    if (error) return <div className="modern-empty-state">Error: {error}</div>;

    if (!restaurant) return <div className="modern-loading">Simmering...</div>;

    return (
        <div className="restaurant-menu-container">
            <div className="back-link-wrapper">
                <Link to="/restaurants" className="back-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Back to Restaurants
                </Link>
            </div>

            <div className="modern-restaurant-header">
                <img src={restaurant.image} alt={restaurant.name} className="restaurant-image-large" onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }} />
                <div className="restaurant-details-main">
                    <h1 className="restaurant-title-large">{restaurant.name}</h1>
                    <div className="restaurant-cuisine-tag">{restaurant.cuisine}</div>
                    <div className="restaurant-stats">
                        <span className="stat-badge rating-high">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            {restaurant.rating || '4.5'}
                        </span>
                        <span className="stat-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                            {restaurant.location || 'Local'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="modern-filters-bar">
                <input
                    type="text"
                    placeholder="Search delicious food..."
                    className="search-input-modern"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="modern-filter-group">
                    <select className="modern-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="All">All Categories</option>
                        {[...new Set(menu.map(item => item.category))].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select className="modern-select" value={vegType} onChange={(e) => setVegType(e.target.value)}>
                        <option value="all">Dietary Disp.</option>
                        <option value="veg">Pure Veg Only</option>
                        <option value="non-veg">Non-Veg Only</option>
                    </select>
                </div>
            </div>

            <div className="modern-menu-grid">
                {filteredMenu.length === 0 ? (
                    <div className="modern-empty-state" style={{ gridColumn: "1 / -1" }}>No items found matching your criteria.</div>
                ) : (
                    filteredMenu.map(item => {
                        const isVeg = item.veg === true || item.isVeg === true || String(item.veg) === 'true' || String(item.isVeg) === 'true';
                        const isUnavailable = item.available === false || item.isAvailable === false || String(item.available) === 'false' || String(item.isAvailable) === 'false';

                        return (
                            <div key={item.id} className="modern-menu-card">
                                <div className="card-image-wrapper">
                                    <span className={`badge-veg-type ${isVeg ? 'veg' : 'non-veg'}`}>
                                        {isVeg ? 'Veg' : 'Non-Veg'}
                                    </span>
                                    <img
                                        src={item.productImage ? `${API_BASE}/uploads/products/${item.productImage}` : "https://placehold.co/600x400?text=No+Image"}
                                        alt={item.name}
                                        className="modern-card-img"
                                        onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                                    />
                                </div>

                                <div className="modern-card-content">
                                    <div className="modern-card-header">
                                        <h3 className="modern-card-title">{item.name}</h3>
                                    </div>
                                    <span className="modern-card-category">{item.category}</span>

                                    <p className="modern-card-desc">{item.description}</p>

                                    {isUnavailable && (
                                        <div className="modern-unavailable-text">
                                            Currently Unavailable
                                        </div>
                                    )}

                                    <div className="modern-card-footer">
                                        <span className="modern-price">{item.price}</span>
                                        <button
                                            className="modern-add-btn"
                                            onClick={() => addToCart({ ...item, restaurantId: id })}
                                            disabled={isUnavailable}
                                        >
                                            ADD +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default RestaurantMenu;
