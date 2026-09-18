import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurantById } from "../../services/restaurantService";
import { getCategoriesByRestaurant } from "../../services/categoryService";
import { getFoodsByRestaurant } from "../../services/foodService";
import { useCart } from "../../context/CartContext";
import { getImageUrl } from "../../utils/constants";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const RestaurantDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [categories, setCategories] = useState([]);
    const [foods, setFoods] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Conflict modal state
    const [conflictModal, setConflictModal] = useState({
        isOpen: false,
        currentRestaurant: "",
        newRestaurant: "",
        onConfirm: null
    });

    const [addedFeedback, setAddedFeedback] = useState("");

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const [restRes, catRes, foodRes] = await Promise.all([
                    getRestaurantById(id),
                    getCategoriesByRestaurant(id),
                    getFoodsByRestaurant(id)
                ]);

                if (restRes.success) {
                    setRestaurant(restRes.data);
                } else {
                    setError(restRes.message || "Failed to load restaurant");
                }

                if (catRes.success) {
                    setCategories(catRes.data || []);
                }

                if (foodRes.success) {
                    setFoods(foodRes.data || []);
                }
            } catch (err) {
                setError("Unable to load restaurant menu.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleAddToCart = (food) => {
        const result = addToCart(food, restaurant);
        if (result.conflict) {
            setConflictModal({
                isOpen: true,
                currentRestaurant: result.currentRestaurant,
                newRestaurant: result.newRestaurant,
                onConfirm: () => {
                    result.resolve();
                    setConflictModal({ isOpen: false, currentRestaurant: "", newRestaurant: "", onConfirm: null });
                    showFeedback(`Added ${food.name} to cart!`);
                }
            });
        } else {
            showFeedback(`Added ${food.name} to cart!`);
        }
    };

    const showFeedback = (msg) => {
        setAddedFeedback(msg);
        setTimeout(() => setAddedFeedback(""), 2000);
    };

    const filteredFoods =
        selectedCategory === "ALL"
            ? foods
            : foods.filter((f) => String(f.category_id) === String(selectedCategory));

    if (loading) {
        return <Loader message="Loading restaurant menu..." />;
    }

    if (error || !restaurant) {
        return (
            <div className="container page-content">
                <div className="alert alert-danger">{error || "Restaurant not found"}</div>
                <Link to="/customer/restaurants" className="btn btn-primary">
                    ← Back to Restaurants
                </Link>
            </div>
        );
    }

    return (
        <div className="container page-content">
            {/* Added Toast */}
            {addedFeedback && <div className="toast-notification">{addedFeedback}</div>}

            {/* Restaurant Info Header */}
            <div className="restaurant-header-card">
                <div className="header-banner">
                    <img
                        src={getImageUrl("restaurants", restaurant.image)}
                        alt={restaurant.name}
                        className="header-banner-img"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=60";
                        }}
                    />
                </div>
                <div className="header-details">
                    <div className="header-meta">
                        <h1 className="header-title">{restaurant.name}</h1>
                        <p className="header-desc">{restaurant.description || "Authentic culinary delights prepared fresh."}</p>
                        <div className="header-badges">
                            <span className="badge badge-info">📍 {restaurant.address}</span>
                            {restaurant.phone && <span className="badge badge-secondary">📞 {restaurant.phone}</span>}
                            <span className="badge badge-success">✓ Open & Delivering</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Category Filter */}
            <div className="category-filter-section">
                <div className="category-pills">
                    <button
                        className={`category-pill ${selectedCategory === "ALL" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("ALL")}
                    >
                        All Dishes ({foods.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-pill ${String(selectedCategory) === String(cat.id) ? "active" : ""}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Food Menu Grid */}
            <div className="food-menu-section">
                <h3 className="section-subtitle">
                    {selectedCategory === "ALL"
                        ? "Full Menu"
                        : categories.find((c) => String(c.id) === String(selectedCategory))?.name || "Menu Items"}
                </h3>

                {filteredFoods.length === 0 ? (
                    <EmptyState
                        title="No Dishes in this Category"
                        description="Please select another category or check back soon."
                    />
                ) : (
                    <div className="food-grid">
                        {filteredFoods.map((food) => {
                            const isAvailable = Boolean(food.is_available);
                            return (
                                <div key={food.id} className={`food-card ${!isAvailable ? "unavailable" : ""}`}>
                                    <div className="food-img-wrapper">
                                        <img
                                            src={getImageUrl("foods", food.image)}
                                            alt={food.name}
                                            className="food-img"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60";
                                            }}
                                        />
                                        {!isAvailable && <span className="out-of-stock-badge">Out of Stock</span>}
                                    </div>
                                    <div className="food-card-body">
                                        <div className="food-header-row">
                                            <h4 className="food-title">{food.name}</h4>
                                            <span className="food-category-label">{food.category_name}</span>
                                        </div>
                                        <p className="food-desc">{food.description || "Prepared with fresh ingredients."}</p>
                                        <div className="food-footer-row">
                                            <span className="food-price">₹{parseFloat(food.price).toFixed(2)}</span>
                                            <button
                                                className={`btn btn-sm ${isAvailable ? "btn-primary" : "btn-disabled"}`}
                                                disabled={!isAvailable}
                                                onClick={() => handleAddToCart(food)}
                                            >
                                                {isAvailable ? "+ Add to Cart" : "Unavailable"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Conflict Modal */}
            {conflictModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-header">
                            <h4>Replace Cart Items?</h4>
                        </div>
                        <div className="modal-body">
                            <p>
                                Your cart already contains items from <strong>{conflictModal.currentRestaurant}</strong>.
                            </p>
                            <p>
                                Would you like to clear your current cart and start a new order from{" "}
                                <strong>{conflictModal.newRestaurant}</strong>?
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    setConflictModal({
                                        isOpen: false,
                                        currentRestaurant: "",
                                        newRestaurant: "",
                                        onConfirm: null
                                    })
                                }
                            >
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={conflictModal.onConfirm}>
                                Clear Cart & Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDetails;
