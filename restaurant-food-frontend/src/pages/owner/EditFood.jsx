import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getFoodById, updateFood, uploadFoodImage } from "../../services/foodService";
import { getCategoriesByRestaurant } from "../../services/categoryService";
import { getImageUrl } from "../../utils/constants";
import ImageUpload from "../../components/ImageUpload";
import Loader from "../../components/Loader";

const EditFood = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [food, setFood] = useState(null);
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
        const loadFoodAndCategories = async () => {
            try {
                const foodRes = await getFoodById(id);
                if (foodRes.success && foodRes.data) {
                    const foodData = foodRes.data;
                    setFood(foodData);
                    setFormData({
                        name: foodData.name,
                        category_id: foodData.category_id,
                        description: foodData.description || "",
                        price: foodData.price,
                        is_available: Boolean(foodData.is_available)
                    });

                    // Load categories for this food's restaurant
                    const catRes = await getCategoriesByRestaurant(foodData.restaurant_id);
                    if (catRes.success) {
                        setCategories(catRes.data || []);
                    }
                } else {
                    setError("Food item not found");
                }
            } catch (err) {
                setError("Failed to load food details");
            } finally {
                setLoading(false);
            }
        };

        loadFoodAndCategories();
    }, [id]);

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

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setError("Price must be greater than 0");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const res = await updateFood(id, {
                category_id,
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: numericPrice,
                is_available: formData.is_available
            });

            if (res.success) {
                // If a new image was selected, upload it
                if (selectedImage) {
                    const imgData = new FormData();
                    imgData.append("image", selectedImage);
                    await uploadFoodImage(id, imgData);
                }

                navigate("/owner/foods");
            } else {
                setError(res.message || "Failed to update food item");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update food item");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loader message="Loading food details..." />;
    }

    if (error && !food) {
        return (
            <div className="container page-content">
                <div className="alert alert-danger">{error}</div>
                <Link to="/owner/foods" className="btn btn-primary">
                    ← Back to Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Edit Food Item</h2>
                    <p className="text-muted">Update details for: <strong>{food.name}</strong></p>
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
                            label="Change Food Photo (Optional)"
                            initialPreview={getImageUrl("foods", food.image)}
                            onFileSelect={(file) => setSelectedImage(file)}
                        />
                    </div>

                    <div className="form-actions-row mt-4">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                            {submitting ? "Saving Changes..." : "Save Changes"}
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

export default EditFood;
