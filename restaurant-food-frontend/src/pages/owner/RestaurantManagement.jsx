import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getAllRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    uploadRestaurantImage
} from "../../services/restaurantService";
import { getImageUrl } from "../../utils/constants";
import ImageUpload from "../../components/ImageUpload";
import Loader from "../../components/Loader";

const RestaurantManagement = () => {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        address: "",
        phone: ""
    });
    const [selectedImage, setSelectedImage] = useState(null);

    const loadRestaurant = async () => {
        try {
            setLoading(true);
            const res = await getAllRestaurants();
            if (res.success && Array.isArray(res.data)) {
                const myRest = res.data.find((r) => r.owner_id === user?.id);
                if (myRest) {
                    setRestaurant(myRest);
                    setFormData({
                        name: myRest.name,
                        description: myRest.description || "",
                        address: myRest.address,
                        phone: myRest.phone || ""
                    });
                } else {
                    setRestaurant(null);
                }
            }
        } catch (err) {
            setError("Failed to fetch restaurant profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRestaurant();
    }, [user?.id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.address.trim()) {
            setError("Restaurant name and address are required");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const data = new FormData();
            data.append("name", formData.name.trim());
            data.append("description", formData.description.trim());
            data.append("address", formData.address.trim());
            data.append("phone", formData.phone.trim());
            if (selectedImage) {
                data.append("image", selectedImage);
            }

            const res = await createRestaurant(data);
            if (res.success) {
                setSuccessMsg("Restaurant created successfully!");
                setSelectedImage(null);
                await loadRestaurant();
            } else {
                setError(res.message || "Failed to create restaurant");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create restaurant");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRestaurant = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.address.trim()) {
            setError("Restaurant name and address are required");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const res = await updateRestaurant(restaurant.id, {
                name: formData.name.trim(),
                description: formData.description.trim(),
                address: formData.address.trim(),
                phone: formData.phone.trim()
            });

            if (res.success) {
                // If a new image was chosen, upload it
                if (selectedImage) {
                    const imgData = new FormData();
                    imgData.append("image", selectedImage);
                    await uploadRestaurantImage(restaurant.id, imgData);
                    setSelectedImage(null);
                }

                setSuccessMsg("Restaurant details updated successfully!");
                setIsEditing(false);
                await loadRestaurant();
            } else {
                setError(res.message || "Failed to update restaurant");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update restaurant");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRestaurant = async () => {
        if (!window.confirm("Are you sure you want to delete this restaurant? This will remove all its food items and categories permanently.")) {
            return;
        }

        setSubmitting(true);
        try {
            const res = await deleteRestaurant(restaurant.id);
            if (res.success) {
                setRestaurant(null);
                setFormData({ name: "", description: "", address: "", phone: "" });
                setSuccessMsg("Restaurant deleted successfully.");
            } else {
                setError(res.message || "Failed to delete restaurant");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete restaurant");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loader message="Loading restaurant profile..." />;
    }

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Restaurant Profile Management</h2>
                    <p className="text-muted">Set up and manage your restaurant's presence on FoodExpress</p>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            {!restaurant ? (
                /* Create Restaurant Form */
                <div className="form-card">
                    <h3 className="section-subtitle">Create Your Restaurant</h3>
                    <form onSubmit={handleCreateRestaurant}>
                        <div className="form-group">
                            <label className="form-label">Restaurant Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="e.g. Spice Symphony"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-control"
                                rows="3"
                                placeholder="Short description of your cuisine and specialties..."
                                value={formData.description}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-control"
                                    placeholder="Full street address and city"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Contact Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    placeholder="e.g. 9876543210"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <ImageUpload
                                label="Restaurant Cover Image"
                                onFileSelect={(file) => setSelectedImage(file)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg mt-3" disabled={submitting}>
                            {submitting ? "Creating Restaurant..." : "Create Restaurant"}
                        </button>
                    </form>
                </div>
            ) : isEditing ? (
                /* Edit Restaurant Form */
                <div className="form-card">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="section-subtitle">Edit Restaurant Information</h3>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditing(false)}>
                            Cancel Editing
                        </button>
                    </div>

                    <form onSubmit={handleUpdateRestaurant}>
                        <div className="form-group">
                            <label className="form-label">Restaurant Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
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
                                <label className="form-label">Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-control"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Contact Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <ImageUpload
                                label="Change Restaurant Image (Optional)"
                                initialPreview={getImageUrl("restaurants", restaurant.image)}
                                onFileSelect={(file) => setSelectedImage(file)}
                            />
                        </div>

                        <div className="form-actions-row mt-4">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? "Saving Changes..." : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary ml-2"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* View Restaurant Profile Card */
                <div className="restaurant-profile-view">
                    <div className="profile-banner-box">
                        <img
                            src={getImageUrl("restaurants", restaurant.image)}
                            alt={restaurant.name}
                            className="profile-banner-img"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=60";
                            }}
                        />
                    </div>
                    <div className="profile-info-content">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h1 className="profile-title">{restaurant.name}</h1>
                                <p className="profile-desc">{restaurant.description || "No description added yet."}</p>
                            </div>
                            <span className="badge badge-success">Active</span>
                        </div>

                        <div className="profile-details-list">
                            <p><strong>📍 Address:</strong> {restaurant.address}</p>
                            <p><strong>📞 Phone:</strong> {restaurant.phone || "Not provided"}</p>
                            <p><strong>🕒 Registered:</strong> {new Date(restaurant.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="profile-actions-bar mt-4">
                            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                ✏️ Edit Details
                            </button>
                            <button
                                className="btn btn-outline-danger ml-3"
                                onClick={handleDeleteRestaurant}
                                disabled={submitting}
                            >
                                🗑️ Delete Restaurant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantManagement;
