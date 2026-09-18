import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllRestaurants } from "../../services/restaurantService";
import {
    getCategoriesByRestaurant,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/categoryService";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const CategoryManagement = () => {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Modal / Form state for Add / Edit
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const restRes = await getAllRestaurants();
            if (restRes.success && Array.isArray(restRes.data)) {
                const myRest = restRes.data.find((r) => r.owner_id === user?.id);
                if (myRest) {
                    setRestaurant(myRest);
                    const catRes = await getCategoriesByRestaurant(myRest.id);
                    if (catRes.success) {
                        setCategories(catRes.data || []);
                    }
                }
            }
        } catch (err) {
            setError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const handleOpenAddModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", description: "" });
        setError("");
        setShowModal(true);
    };

    const handleOpenEditModal = (cat) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, description: cat.description || "" });
        setError("");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError("Category name is required");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            if (editingCategory) {
                // Update
                const res = await updateCategory(editingCategory.id, {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    is_active: true
                });
                if (res.success) {
                    setSuccessMsg("Category updated successfully!");
                    setShowModal(false);
                    loadData();
                } else {
                    setError(res.message || "Failed to update category");
                }
            } else {
                // Create
                const res = await createCategory(restaurant.id, {
                    name: formData.name.trim(),
                    description: formData.description.trim()
                });
                if (res.success) {
                    setSuccessMsg("Category created successfully!");
                    setShowModal(false);
                    loadData();
                } else {
                    setError(res.message || "Failed to create category");
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category? Any associated food items may also be deleted.")) {
            return;
        }

        try {
            const res = await deleteCategory(id);
            if (res.success) {
                setSuccessMsg("Category deleted successfully!");
                loadData();
            } else {
                setError(res.message || "Failed to delete category");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete category");
        }
    };

    if (loading) {
        return <Loader message="Loading categories..." />;
    }

    if (!restaurant) {
        return (
            <div className="container page-content text-center py-5">
                <h3>Please Create Your Restaurant Profile First</h3>
                <p className="text-muted">You need an active restaurant to manage food categories.</p>
                <Link to="/owner/restaurant" className="btn btn-primary mt-3">
                    Go to Restaurant Profile
                </Link>
            </div>
        );
    }

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Category Management</h2>
                    <p className="text-muted">Organize food items for: <strong>{restaurant.name}</strong></p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAddModal}>
                    + Add New Category
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            {categories.length === 0 ? (
                <EmptyState
                    title="No Categories Yet"
                    description="Create your first food category (e.g. Starters, Main Course, Desserts, Beverages) to start adding dishes."
                    actionText="+ Add Category"
                    onAction={handleOpenAddModal}
                />
            ) : (
                <div className="table-responsive-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Category Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, idx) => (
                                <tr key={cat.id}>
                                    <td>{idx + 1}</td>
                                    <td className="font-weight-bold">{cat.name}</td>
                                    <td>{cat.description || "—"}</td>
                                    <td>
                                        <span className="badge badge-success">Active</span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary mr-2"
                                            onClick={() => handleOpenEditModal(cat)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Add / Edit */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-header">
                            <h4>{editingCategory ? "Edit Category" : "Add Food Category"}</h4>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Category Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Appetizers, Main Course, Shakes"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Short note about items in this category..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
