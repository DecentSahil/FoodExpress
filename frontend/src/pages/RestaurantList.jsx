import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './RestaurantList.css';
import API_BASE from '../api';

const IMAGE_FOLDER = '/uploads/restaurants/';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch(`${API_BASE}/restaurant/public`);
                const data = await response.json();
                const mapped = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    location: item.address,
                    image: item.imageUrl
                        ? `${API_BASE}${IMAGE_FOLDER}${item.imageUrl}`
                        : null,
                }));
                setRestaurants(mapped);
            } catch (e) {
                console.error('Failed to load restaurants', e);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const filtered = restaurants.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.location || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="rlist-page">
            {/* ── Page Header ───────────────────── */}
            <div className="rlist-hero">
                <div className="rlist-hero-bg" />
                <div className="container rlist-hero-inner">
                    <h1 className="rlist-title">Restaurants near you</h1>
                    <p className="rlist-subtitle">Choose from hundreds of restaurants and cuisines</p>
                    <div className="rlist-search-wrap">
                        <span className="rlist-search-icon">🔍</span>
                        <input
                            className="rlist-search"
                            type="text"
                            placeholder="Search restaurants or locations…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container rlist-body">
                {/* Count */}
                {!loading && (
                    <p className="rlist-count">
                        Showing <strong>{filtered.length}</strong> restaurant{filtered.length !== 1 ? 's' : ''}
                        {search && ` for "${search}"`}
                    </p>
                )}

                {/* Loading */}
                {loading && (
                    <div className="rlist-loading">
                        <div className="rlist-spinner" />
                        <span>Loading restaurants…</span>
                    </div>
                )}

                {/* Grid */}
                {!loading && (
                    <div className="rlist-grid">
                        {filtered.length === 0 ? (
                            <div className="rlist-empty">
                                <div className="rlist-empty-icon">🍽️</div>
                                <h3>No restaurants found</h3>
                                <p>Try a different search</p>
                                <button className="rlist-clear-btn" onClick={() => setSearch('')}>Clear search</button>
                            </div>
                        ) : (
                            filtered.map(r => (
                                <Link key={r.id} to={`/restaurant/${r.id}`} className="rlist-card">
                                    <div className="rlist-card-img-wrap">
                                        <img
                                            src={r.image || 'https://placehold.co/400x220?text=Restaurant'}
                                            alt={r.name}
                                            className="rlist-card-img"
                                            onError={e => { e.target.src = 'https://placehold.co/400x220?text=Restaurant'; }}
                                        />
                                        <div className="rlist-card-img-overlay" />
                                    </div>
                                    <div className="rlist-card-body">
                                        <h3 className="rlist-card-name">{r.name}</h3>
                                        <p className="rlist-card-loc">
                                            <span className="rlist-pin">📍</span>
                                            {r.location || 'Location not available'}
                                        </p>
                                        <div className="rlist-card-footer">
                                            <span className="rlist-order-btn">Order Now →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantList;