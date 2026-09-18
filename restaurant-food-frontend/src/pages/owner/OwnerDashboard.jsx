import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllRestaurants } from "../../services/restaurantService";
import { getCategoriesByRestaurant } from "../../services/categoryService";
import { getFoodsByRestaurant } from "../../services/foodService";
import { getRestaurantOrders } from "../../services/orderService";
import Loader from "../../components/Loader";

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [categoriesCount, setCategoriesCount] = useState(0);
    const [foodsCount, setFoodsCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all restaurants and find the one owned by user
                const res = await getAllRestaurants();
                if (res.success && Array.isArray(res.data)) {
                    const myRest = res.data.find((r) => r.owner_id === user?.id);
                    if (myRest) {
                        setRestaurant(myRest);
                        // Fetch counts for this restaurant
                        const [catRes, foodRes, orderRes] = await Promise.all([
                            getCategoriesByRestaurant(myRest.id),
                            getFoodsByRestaurant(myRest.id),
                            getRestaurantOrders()
                        ]);

                        if (catRes.success) setCategoriesCount(catRes.data?.length || 0);
                        if (foodRes.success) setFoodsCount(foodRes.data?.length || 0);
                        if (orderRes.success) setOrdersCount(orderRes.data?.length || 0);
                    }
                }
            } catch (err) {
                setError("Failed to fetch dashboard summary.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.id]);

    if (loading) {
        return <Loader message="Loading dashboard..." />;
    }

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Welcome, {user?.name}! 👨‍🍳</h2>
                    <p className="text-muted">Manage your restaurant, food menu, and customer orders</p>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {!restaurant ? (
                <div className="card p-4 text-center my-4">
                    <h3>🏢 Set Up Your Restaurant</h3>
                    <p className="text-muted">
                        You haven't created your restaurant profile yet. Create it now to start adding food items and taking orders!
                    </p>
                    <div className="mt-3">
                        <Link to="/owner/restaurant" className="btn btn-primary btn-lg">
                            + Create Restaurant Profile
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Dashboard Metric Cards */}
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <div className="card-stat-icon">🏢</div>
                            <div>
                                <h4 className="card-stat-title">My Restaurant</h4>
                                <p className="card-stat-value">{restaurant.name}</p>
                                <span className="badge badge-success">Active & Live</span>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-stat-icon">📁</div>
                            <div>
                                <h4 className="card-stat-title">Categories</h4>
                                <p className="card-stat-value">{categoriesCount}</p>
                                <Link to="/owner/categories" className="link-primary">
                                    Manage Categories →
                                </Link>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-stat-icon">🍕</div>
                            <div>
                                <h4 className="card-stat-title">Food Items</h4>
                                <p className="card-stat-value">{foodsCount}</p>
                                <Link to="/owner/foods" className="link-primary">
                                    Manage Food Menu →
                                </Link>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-stat-icon">📦</div>
                            <div>
                                <h4 className="card-stat-title">Incoming Orders</h4>
                                <p className="card-stat-value">{ordersCount}</p>
                                <Link to="/owner/orders" className="link-primary">
                                    View Orders →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="quick-actions-section mt-5">
                        <h3 className="section-subtitle">Quick Actions</h3>
                        <div className="quick-actions-grid">
                            <Link to="/owner/restaurant" className="quick-action-btn">
                                <span className="qa-icon">✏️</span>
                                <span>Edit Restaurant Details</span>
                            </Link>
                            <Link to="/owner/foods/add" className="quick-action-btn">
                                <span className="qa-icon">➕</span>
                                <span>Add New Food Item</span>
                            </Link>
                            <Link to="/owner/categories" className="quick-action-btn">
                                <span className="qa-icon">📂</span>
                                <span>Add New Category</span>
                            </Link>
                            <Link to="/owner/orders" className="quick-action-btn">
                                <span className="qa-icon">🚚</span>
                                <span>Manage Orders</span>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OwnerDashboard;
