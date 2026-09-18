import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllRestaurants } from "../../services/restaurantService";
import { getCategoriesByRestaurant } from "../../services/categoryService";
import { createFood } from "../../services/foodService";
import ImageUpload from "../../components/ImageUpload";
import Loader from "../../components/Loader";

const AddFood = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        description: "",
        price: "",
        is_available: true
    });
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const restRes = await getAllRestaurants();
                if (restRes.success && Array.isArray(restRes.data)) {
                    const myRest = restRes.data.find((r) => r.owner_id === user?.id);
                    if (myRest) {
                        setRestaurant(myRest);
                        const catRes = await getCategoriesByRestaurant(myRest.id);
                        if (catRes.success) {
                            setCategories(catRes.data || []);
                            if (catRes.data?.length > 0) {
                                setFormData((prev) => ({ ...prev, category_id: catRes.data[0].id }));
                            }
                        }
                    }
                }
            } catch (err) {
                setError("Failed to load restaurant information");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [user?.id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, category_id, price } = formData;

        if (!name.trim()) {
            setError("Food name is required");
            return;
        }

        if (!category_id) {
            setError("Please select a food category");
            return;
        }

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setError("Price must be greater than 0");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const data = new FormData();
            data.append("name", formData.name.trim());
            data.append("category_id", formData.category_id);
            data.append("description", formData.description.trim());
            data.append("price", numericPrice);
            data.append("is_available", formData.is_available);
            if (selectedImage) {
                data.append("image", selectedImage);
            }

            const res = await createFood(restaurant.id, data);
            if (res.success) {
                navigate("/owner/foods");
            } else {
                setError(res.message || "Failed to create food item");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add food item");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loader message="Loading form..." />;
    }

    if (!restaurant) {
        return (
            <div className="container page-content text-center py-5">
                <h3>Please Create Your Restaurant Profile First</h3>
                <Link to="/owner/restaurant" className="btn btn-primary mt-3">
                    Go to Restaurant Profile
                </Link>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="container page-content text-center py-5">
                <h3>You need at least one Category before adding Food</h3>
                <p className="text-muted">Create categories like Appetizers, Main Course, Drinks, etc.</p>
                <Link to="/owner/categories" className="btn btn-primary mt-3">
                    + Add Categories First
                </Link>
            </div>
        );
    }

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Add New Food Item</h2>
                    <p className="text-muted">Add a delicious dish to your restaurant's menu</p>
                </div>
                <Link to="/owner/foods" className="btn btn-outline-secondary btn-sm">
                    ← Back to Menu
                </Link>
            </div>

            <div className="form-card">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label className="form-label">Food Item Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="e.g. Paneer Butter Masala, Chicken Biryani"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group flex-1">
                            <label className="form-label">Category *</label>
                            <select
                                name="category_id"
                                className="form-control"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-control"
                            rows="3"
                            placeholder="Describe the ingredients, flavor, spice level, or portion size..."
                            value={formData.description}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label className="form-label">Price (₹) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                name="price"
                                className="form-control"
                                placeholder="e.g. 250.00"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group flex-1 d-flex align-items-center mt-4">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_available"
                                    checked={formData.is_available}
                                    onChange={handleInputChange}
                                />
                                <span>Item is currently In Stock / Available</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <ImageUpload
                            label="Food Photo"
                            onFileSelect={(file) => setSelectedImage(file)}
                        />
                    </div>

                    <div className="form-actions-row mt-4">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                            {submitting ? "Adding Food..." : "+ Add Food to Menu"}
                        </button>
                        <Link to="/owner/foods" className="btn btn-outline-secondary ml-3">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFood;
