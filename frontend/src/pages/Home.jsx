import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';
import API_BASE from '../api';

const CATEGORIES = [
    { icon: '🍕', label: 'Pizza' },
    { icon: '🍔', label: 'Burgers' },
    { icon: '🍜', label: 'Noodles' },
    { icon: '🌮', label: 'Tacos' },
    { icon: '🍣', label: 'Sushi' },
    { icon: '🥗', label: 'Salads' },
    { icon: '🍛', label: 'Curry' },
    { icon: '🍩', label: 'Desserts' },
];

const STATS = [
    { value: '500+', label: 'Restaurants' },
    { value: '50K+', label: 'Happy Customers' },
    { value: '30 min', label: 'Avg. Delivery' },
    { value: '4.8★', label: 'App Rating' },
];

const Home = () => {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch(`${API_BASE}/restaurant/public`);
                if (response.ok) {
                    const data = await response.json();
                    setRestaurants(data.slice(0, 3).map(item => ({
                        id: item.id,
                        name: item.name,
                        location: item.address,
                        image: item.imageUrl
                            ? `${API_BASE}/uploads/restaurants/${item.imageUrl}`
                            : null,
                    })));
                }
            } catch (e) { /* silent */ }
        };
        fetchRestaurants();
    }, []);

    return (
        <div className="home-page">
            {/* ── Hero ────────────────────────────────── */}
            <section className="home-hero">
                <div className="home-hero-bg" />
                <div className="container home-hero-content">
                    <div className="home-hero-text">
                        <div className="home-hero-pill">🔥 Free delivery on first order</div>
                        <h1 className="home-hero-h1">
                            Delicious food,<br />
                            <span className="home-hero-accent">delivered fast</span>
                        </h1>
                        <p className="home-hero-sub">
                            Discover the best restaurants and handpicked dishes in your city. Hot, fresh, at your door.
                        </p>
                        <div className="home-hero-ctas">
                            <Link to="/restaurants" className="home-cta-primary">Browse Restaurants</Link>
                            <Link to="/products" className="home-cta-secondary">Explore Dishes</Link>
                        </div>
                    </div>
                    <div className="home-hero-visual">
                        <div className="home-hero-badge">
                            <span className="home-hero-badge-icon">⚡</span>
                            <div>
                                <p className="home-hero-badge-title">Fast Delivery</p>
                                <p className="home-hero-badge-sub">Avg. 30 min</p>
                            </div>
                        </div>
                        <div className="home-hero-emoji-wrapper">
                            <span className="home-float-emoji e1">🍕</span>
                            <span className="home-float-emoji e2">🍔</span>
                            <span className="home-float-emoji e3">🍜</span>
                            <span className="home-float-emoji e4">🌮</span>
                            <div className="home-emoji-center">🍽️</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Row ──────────────────────────── */}
            <section className="home-stats-section">
                <div className="container home-stats-grid">
                    {STATS.map(s => (
                        <div key={s.label} className="home-stat-item">
                            <span className="home-stat-value">{s.value}</span>
                            <span className="home-stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Categories ─────────────────────────── */}
            <section className="home-section container">
                <div className="home-section-header">
                    <h2 className="home-section-title">What are you craving?</h2>
                    <Link to="/products" className="home-see-all">See all →</Link>
                </div>
                <div className="home-categories-grid">
                    {CATEGORIES.map(cat => (
                        <Link key={cat.label} to="/products" className="home-category-card">
                            <span className="home-category-emoji">{cat.icon}</span>
                            <span className="home-category-label">{cat.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Featured Restaurants ───────────────── */}
            <section className="home-section container">
                <div className="home-section-header">
                    <h2 className="home-section-title">Featured Restaurants</h2>
                    <Link to="/restaurants" className="home-see-all">View all →</Link>
                </div>
                {restaurants.length > 0 ? (
                    <div className="home-restaurants-grid">
                        {restaurants.map(r => (
                            <Link key={r.id} to={`/restaurant/${r.id}`} className="home-restaurant-card">
                                <div className="home-rest-img-wrap">
                                    <img
                                        src={r.image || 'https://placehold.co/400x220?text=Restaurant'}
                                        alt={r.name}
                                        className="home-rest-img"
                                        onError={e => { e.target.src = 'https://placehold.co/400x220?text=Restaurant'; }}
                                    />
                                    <div className="home-rest-overlay" />
                                </div>
                                <div className="home-rest-info">
                                    <h3 className="home-rest-name">{r.name}</h3>
                                    <p className="home-rest-loc">📍 {r.location}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="home-restaurants-grid">
                        {[
                            { name: 'Spice Garden', loc: 'Connaught Place, Delhi', emoji: '🍛' },
                            { name: 'The Burger Co.', loc: 'Koramangala, Bengaluru', emoji: '🍔' },
                            { name: 'Pizza Hub', loc: 'Bandra West, Mumbai', emoji: '🍕' },
                        ].map(r => (
                            <Link key={r.name} to="/restaurants" className="home-restaurant-card">
                                <div className="home-rest-img-wrap home-rest-placeholder">
                                    <span style={{ fontSize: '4rem' }}>{r.emoji}</span>
                                    <div className="home-rest-overlay" />
                                </div>
                                <div className="home-rest-info">
                                    <h3 className="home-rest-name">{r.name}</h3>
                                    <p className="home-rest-loc">📍 {r.loc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ── CTA Banner ─────────────────────────── */}
            {!user && (
                <section className="home-cta-banner container">
                    <div className="home-cta-banner-inner">
                        <div>
                            <h2 className="home-cta-banner-title">Ready to order?</h2>
                            <p className="home-cta-banner-sub">Join FoodExpress and get your first delivery free.</p>
                        </div>
                        <div className="home-cta-banner-btns">
                            <Link to="/register" className="home-cta-primary">Sign up free</Link>
                            <Link to="/login" className="home-cta-ghost">Login</Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
