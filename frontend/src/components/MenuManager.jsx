import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './MenuManager.css';
import API_BASE from '../api';

const MenuManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);

    const { user } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        veg: true,
        categoryId: '',
        productImage: null   // Actual File object for multipart upload
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchDependencies();
        fetchProducts();
    }, []);

    const getToken = () => {
        return user?.token || JSON.parse(localStorage.getItem('user'))?.token;
    };

    const fetchDependencies = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE}/restaurant/category`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setCategories(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProducts = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/restaurant/menu`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data.content ? data.content : data);
            } else {
                console.error('Failed to fetch menu items', response.status);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    // Client-side filter — category is now a plain string from the backend
    const filteredProducts = products.filter(p => {
        const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category?.toLowerCase() === filterCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const handleAdd = async (e) => {
        e.preventDefault();
        const token = getToken();

        if (!token) {
            alert("You must be logged in to add items.");
            return;
        }

        // Validate required fields
        const missing = [];
        if (!formData.name.trim()) missing.push('Product Name');
        if (!formData.description.trim()) missing.push('Description');
        if (!formData.price) missing.push('Price');
        if (!formData.categoryId) missing.push('Category');
        if (missing.length > 0) {
            alert(`Please fill in the following fields:\n• ${missing.join('\n• ')}`);
            return;
        }

        // Build multipart/form-data — matches @ModelAttribute MenuItemRequest
        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('description', formData.description);
        payload.append('price', formData.price);
        payload.append('veg', formData.veg);
        payload.append('categoryId', formData.categoryId);
        if (formData.productImage) {
            payload.append('productImage', formData.productImage);
        }

        const method = editingProductId ? 'PUT' : 'POST';
        const url = editingProductId
            ? `${API_BASE}/restaurant/menu/${editingProductId}`
            : `${API_BASE}/restaurant/menu`;

        try {
            // Do NOT set Content-Type — browser sets it automatically with the multipart boundary
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: payload
            });
            if (response.ok) {
                closeModal();
                fetchProducts();
            } else {
                let err = await response.text();
                try { const parsed = JSON.parse(err); if (parsed.errors && typeof parsed.errors === 'object') { err = Object.values(parsed.errors).join(', '); } else { err = parsed.message || parsed.error || err; } } catch(e) {}
                alert(`Failed to add product: ${err}`);
            }
        } catch (error) {
            console.error("Failed to add product", error);
        }
    };

    const confirmDelete = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/restaurant/menu/${deletingProduct.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                closeModal();
                fetchProducts();
            } else {
                let err = await response.text();
                try { const parsed = JSON.parse(err); if (parsed.errors && typeof parsed.errors === 'object') { err = Object.values(parsed.errors).join(', '); } else { err = parsed.message || parsed.error || err; } } catch(e) {}
                alert(`Failed to delete: ${err}`);
            }
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    };

    const toggleAvailability = async (product) => {
        const token = getToken();
        if (!token) return;

        try {
            const isCurrentlyAvailable = product.available === true || product.isAvailable === true || String(product.available) === 'true' || String(product.isAvailable) === 'true' || (product.available !== false && product.isAvailable !== false);
            const response = await fetch(
                `${API_BASE}/restaurant/menu/${product.id}/availability?available=${!isCurrentlyAvailable}`,
                {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (response.ok) {
                fetchProducts();
            } else {
                alert('Failed to update availability.');
            }
        } catch (error) {
            console.error('Failed to update availability', error);
        }
    };

    const openAddModal = () => {
        setFormData({ name: '', description: '', price: '', veg: true, categoryId: '', productImage: null });
        setImagePreview(null);
        setEditingProductId(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (product) => {
        const catId = categories.find(c => (c.name || c.categoryName) === product.category)?.id || '';
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            veg: product.veg,
            categoryId: catId,
            productImage: null // Requires user to explicitly select an image if they want to update it
        });
        setImagePreview(product.productImage ? `http://localhost:8084/uploads/products/${product.productImage}` : null);
        setEditingProductId(product.id);
        setIsAddModalOpen(true);
    };

    const openDeleteModal = (product) => {
        setDeletingProduct(product);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsDeleteModalOpen(false);
        setDeletingProduct(null);
        setEditingProductId(null);
    };

    // Helper to find category name for display
    const getCategoryName = (id) => {
        if (id == null) return 'Uncategorized';
        const cat = categories.find(c => c.id != null && (c.id.toString() === id.toString() || c.id === id));
        return cat ? (cat.name || cat.categoryName) : 'Uncategorized';
    };

    return (
        <div className="management-section">
            {/* Action Bar */}
            <div className="action-bar">
                <div className="search-filter">
                    <div className="search-box">
                        <i className="fa-solid fa-magnifying-glass">🔍</i>
                        <input
                            type="text"
                            placeholder="Search products by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-box">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="All">All Categories</option>
                            {categories.map(c =>
                                <option key={c.id || c} value={c.name || c.categoryName}>{c.name || c.categoryName}</option>
                            )}
                        </select>
                    </div>
                </div>
                <button className="primary-btn" onClick={openAddModal}>
                    ➕ Add Product
                </button>
            </div>

            {/* Products Table */}
            <div className="table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Type</th>
                            <th>Availability</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <img
                                            src={p.productImage ? `${API_BASE}/uploads/products/${p.productImage}` : 'https://placehold.co/150x150?text=No+Image'}
                                            alt={p.name}
                                            className="product-img-cell"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=No+Image'; }}
                                        />
                                    </td>
                                    <td className="product-name">
                                        {p.name}
                                        <br />
                                        <small style={{ color: '#6c757d', fontWeight: 400 }}>{p.description?.substring(0, 30)}...</small>
                                    </td>
                                    {/* category is now a plain string from backend */}
                                    <td>{p.category || 'Uncategorized'}</td>
                                    <td>₹{parseFloat(p.price).toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${(p.veg === true || p.isVeg === true || String(p.veg) === 'true' || String(p.isVeg) === 'true' || p.vegetarian === true) ? 'status-available' : 'status-unavailable'}`}>
                                            {(p.veg === true || p.isVeg === true || String(p.veg) === 'true' || String(p.isVeg) === 'true' || p.vegetarian === true) ? 'Veg' : 'Non-Veg'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${(p.available === false || p.isAvailable === false || String(p.available) === 'false' || String(p.isAvailable) === 'false') ? 'status-unavailable' : 'status-available'}`}>
                                            {(p.available === false || p.isAvailable === false || String(p.available) === 'false' || String(p.isAvailable) === 'false') ? 'Out of Stock' : 'Available'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="icon-btn toggle"
                                            title={(p.available === false || p.isAvailable === false || String(p.available) === 'false' || String(p.isAvailable) === 'false') ? 'Mark Available' : 'Mark Unavailable'}
                                            onClick={() => toggleAvailability(p)}
                                        >
                                            {(p.available === false || p.isAvailable === false || String(p.available) === 'false' || String(p.isAvailable) === 'false') ? '✅' : '🚫'}
                                        </button>
                                        <button
                                            className="icon-btn edit"
                                            title="Edit Product"
                                            onClick={() => openEditModal(p)}
                                        >
                                            ✏️
                                        </button>
                                        <button className="icon-btn delete" onClick={() => openDeleteModal(p)} title="Delete">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Product Modal */}
            <div className={`modal-overlay ${isAddModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeModal() }}>
                <div className="modal">
                    <div className="modal-header">
                        <h3>{editingProductId ? 'Edit Item' : 'Add New Item'}</h3>
                        <button className="close-modal" onClick={closeModal}>✖</button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleAdd}>
                            <div className="form-group image-upload-group">
                                <div className="image-preview">
                                    <img
                                        src={imagePreview || 'https://placehold.co/150x150?text=Preview'}
                                        alt="Preview"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=Error'; }}
                                    />
                                </div>
                                <div className="upload-controls">
                                    <label>Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setFormData({ ...formData, productImage: file });
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Chicken Biryani"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    required
                                    placeholder="Delicious Indian spices..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Category</label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        <option value="" disabled>Select category</option>
                                        {categories.map(c =>
                                            <option key={c.id || c} value={c.id}>{c.name || c.categoryName}</option>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group half">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.veg}
                                        onChange={e => setFormData({ ...formData, veg: e.target.checked })}
                                    />
                                    Vegetarian Product
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="secondary-btn" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="primary-btn">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <div className={`modal-overlay ${isDeleteModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeModal() }}>
                <div className="modal confirm-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <div className="modal-header">
                        <h3 style={{ width: '100%' }}>Confirm Deletion</h3>
                        <button className="close-modal" onClick={closeModal} style={{ position: 'absolute', right: '20px' }}>✖</button>
                    </div>
                    <div className="modal-body">
                        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                            Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="modal-footer" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
                            <button type="button" className="secondary-btn" onClick={closeModal}>Cancel</button>
                            <button type="button" className="danger-btn" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MenuManager;
