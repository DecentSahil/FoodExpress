
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../api';

const ProductRegister = () => {
    const navigate = useNavigate();
    const [categoriesList, setCategoriesList] = useState([]);
    const [restaurantsList, setRestaurantsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        restaurantId: '',
        isVeg: true,
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if (!token) {
                // Handle no token if needed, usually redirect
                return;
            }

            try {
                const [catRes, restRes] = await Promise.all([
                    fetch(`${API_BASE}/restaurant/category`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE}/restaurant/all`)
                ]);

                if (catRes.ok && restRes.ok) {
                    const cats = await catRes.json();
                    const rests = await restRes.json();
                    setCategoriesList(cats);
                    setRestaurantsList(rests);

                    // Set defaults
                    if (cats.length > 0) setFormData(prev => ({ ...prev, category: cats[0].categoryName || cats[0] })); // Handle variance
                    if (rests.length > 0) setFormData(prev => ({ ...prev, restaurantId: rests[0].id }));
                }
            } catch (error) {
                console.error("Failed to fetch dependencies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/restaurant/product/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price)
                })
            });

            if (response.ok) {
                alert('Product Registered Successfully!');
                navigate('/products');
            } else {
                alert('Failed to register product');
            }
        } catch (error) {
            console.error("Error registering product", error);
            alert('Error registering product');
        }
    };

    return (
        <div className="container">
            <h1>Register New Product</h1>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Restaurant</label>
                        <select
                            name="restaurantId"
                            value={formData.restaurantId}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {restaurantsList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isVeg"
                                checked={formData.isVeg}
                                onChange={handleChange}
                            />
                            Is Vegetarian?
                        </label>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <button type="submit" className="add-btn" style={{ width: '100%' }}>Register Product</button>
                </form>
            </div>
        </div>
    );
};

export default ProductRegister;
