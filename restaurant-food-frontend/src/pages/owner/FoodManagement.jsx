import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllRestaurants } from "../../services/restaurantService";
import {
    getFoodsByRestaurant,
    deleteFood,
    updateFoodAvailability
} from "../../services/foodService";
import { getImageUrl } from "../../utils/constants";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const FoodManagement = () => {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [togglingId, setTogglingId] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const restRes = await getAllRestaurants();
            if (restRes.success && Array.isArray(restRes.data)) {
                const myRest = restRes.data.find((r) => r.owner_id === user?.id);
                if (myRest) {
                    setRestaurant(myRest);
                    const foodRes = await getFoodsByRestaurant(myRest.id);
                    if (foodRes.success) {
                        setFoods(foodRes.data || []);
                    }
                }
            }
        } catch (err) {
            setError("Failed to load food menu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const handleToggleAvailability = async (food) => {
        setTogglingId(food.id);
        setError("");
        try {
            const nextStatus = !food.is_available;
            const res = await updateFoodAvailability(food.id, nextStatus);
            if (res.success) {
                setSuccessMsg(`"${food.name}" is now ${nextStatus ? "Available" : "Unavailable"}`);
                setFoods((prev) =>
                    prev.map((f) => (f.id === food.id ? { ...f, is_available: nextStatus } : f))
                );
            } else {
                setError(res.message || "Failed to update food availability");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update availability");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteFood = async (id) => {
        if (!window.confirm("Are you sure you want to delete this food item permanently?")) {
            return;
        }

        try {
            const res = await deleteFood(id);
            if (res.success) {
                setSuccessMsg("Food item deleted successfully!");
                setFoods((prev) => prev.filter((f) => f.id !== id));
            } else {
                setError(res.message || "Failed to delete food item");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete food item");
        }
    };

    if (loading) {
        return <Loader message="Loading food menu..." />;
    }

    if (!restaurant) {
        return (
            <div className="container page-content text-center py-5">
                <h3>Please Create Your Restaurant Profile First</h3>
                <p className="text-muted">You need an active restaurant before managing food items.</p>
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
                    <h2>Food Menu Management</h2>
                    <p className="text-muted">Manage items and pricing for: <strong>{restaurant.name}</strong></p>
                </div>
                <Link to="/owner/foods/add" className="btn btn-primary">
                    + Add New Food Item
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            {foods.length === 0 ? (
                <EmptyState
                    title="No Food Items Added Yet"
                    description="Start filling your menu with delicious dishes, prices, and mouth-watering images."
                    actionText="+ Add Food Item"
                    onAction={() => (window.location.href = "/owner/foods/add")}
                />
            ) : (
                <div className="table-responsive-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Availability Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {foods.map((food) => (
                                <tr key={food.id}>
                                    <td>
                                        <img
                                            src={getImageUrl("foods", food.image)}
                                            alt={food.name}
                                            className="table-thumb"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60";
                                            }}
                                        />
                                    </td>
                                    <td className="font-weight-bold">
                                        {food.name}
                                        {food.description && (
                                            <small className="d-block text-muted">{food.description}</small>
                                        )}
                                    </td>
                                    <td>
                                        <span className="badge badge-info">{food.category_name}</span>
                                    </td>
                                    <td className="font-weight-bold">₹{parseFloat(food.price).toFixed(2)}</td>
                                    <td>
                                        <button
                                            className={`btn btn-sm ${
                                                food.is_available ? "btn-success" : "btn-outline-danger"
                                            }`}
                                            disabled={togglingId === food.id}
                                            onClick={() => handleToggleAvailability(food)}
                                            title="Click to toggle availability"
                                        >
                                            {togglingId === food.id
                                                ? "Updating..."
                                                : food.is_available
                                                ? "✓ In Stock"
                                                : "✕ Out of Stock"}
                                        </button>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/owner/foods/${food.id}/edit`}
                                            className="btn btn-sm btn-outline-primary mr-2"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteFood(food.id)}
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
        </div>
    );
};

export default FoodManagement;
