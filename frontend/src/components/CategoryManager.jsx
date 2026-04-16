import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './MenuManager.css';
import API_BASE from '../api';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form States
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editCategory, setEditCategory] = useState({ id: null, name: '' });
    const [deletingCategory, setDeletingCategory] = useState(null);

    const [search, setSearch] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        fetchCategories();
    }, []);

    const getToken = () => {
        return user?.token || JSON.parse(localStorage.getItem('user'))?.token;
    };

    const fetchCategories = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/restaurant/category`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories");
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) {
            alert("You must be logged in to add a category");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/restaurant/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ categoryName: newCategoryName })
            });
            if (response.ok) {
                setNewCategoryName('');
                setIsAddModalOpen(false);
                fetchCategories();
            }
        } catch (error) {
            console.error("Failed to add category");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/restaurant/category/${editCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ categoryName: editCategory.name })
            });
            if (response.ok) {
                setIsEditModalOpen(false);
                fetchCategories();
            }
        } catch (error) {
            console.error("Failed to update category");
        }
    };

    const confirmDelete = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/restaurant/category/${deletingCategory.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setIsDeleteModalOpen(false);
                fetchCategories();
            }
        } catch (error) {
            console.error("Failed to delete category");
        }
    };

    const openEditModal = (cat) => {
        setEditCategory({ id: cat.id, name: cat.name || cat.categoryName });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (cat) => {
        setDeletingCategory({ id: cat.id, name: cat.name || cat.categoryName });
        setIsDeleteModalOpen(true);
    };

    const filteredCategories = categories.filter(cat =>
        (cat.name || cat.categoryName || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="management-section">
            {/* Action Bar */}
            <div className="action-bar">
                <div className="search-filter">
                    <div className="search-box">
                        <i className="fa-solid fa-magnifying-glass">🔍</i>
                        <input
                            type="text"
                            placeholder="Search categories by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <button className="primary-btn" onClick={() => setIsAddModalOpen(true)}>
                    ➕ Add Category
                </button>
            </div>

            {/* Categories Table */}
            <div className="table-container">
                <table className="products-table" style={{ width: '100%', minWidth: '400px' }}>
                    <thead>
                        <tr>
                            <th>Category ID</th>
                            <th>Name</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map((cat, idx) => (
                                <tr key={cat.id}>
                                    <td style={{ color: '#E23744', fontWeight: 600 }}>#{cat.id || idx + 1}</td>
                                    <td className="product-name">
                                        {cat.name || cat.categoryName}
                                    </td>
                                    <td className="actions-cell" style={{ textAlign: 'right' }}>
                                        <button className="icon-btn edit" onClick={() => openEditModal(cat)} title="Edit Category">
                                            ✏️
                                        </button>
                                        <button className="icon-btn delete" onClick={() => openDeleteModal(cat)} title="Delete Category">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Category Modal */}
            <div className={`modal-overlay ${isAddModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setIsAddModalOpen(false); }}>
                <div className="modal" style={{ maxWidth: '400px' }}>
                    <div className="modal-header">
                        <h3>Add New Category</h3>
                        <button className="close-modal" onClick={() => setIsAddModalOpen(false)}>✖</button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Main Course"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="secondary-btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Edit Category Modal */}
            <div className={`modal-overlay ${isEditModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setIsEditModalOpen(false); }}>
                <div className="modal" style={{ maxWidth: '400px' }}>
                    <div className="modal-header">
                        <h3>Edit Category</h3>
                        <button className="close-modal" onClick={() => setIsEditModalOpen(false)}>✖</button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Appetizers"
                                    value={editCategory.name}
                                    onChange={e => setEditCategory({ ...editCategory, name: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="secondary-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Update Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <div className={`modal-overlay ${isDeleteModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setIsDeleteModalOpen(false); }}>
                <div className="modal confirm-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <div className="modal-header">
                        <h3 style={{ width: '100%' }}>Confirm Deletion</h3>
                        <button className="close-modal" onClick={() => setIsDeleteModalOpen(false)} style={{ position: 'absolute', right: '20px' }}>✖</button>
                    </div>
                    <div className="modal-body">
                        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                            Are you sure you want to delete category <strong>{deletingCategory?.name}</strong>? All items within this category will be affected.
                        </p>
                        <div className="modal-footer" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
                            <button type="button" className="secondary-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button type="button" className="danger-btn" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CategoryManager;
