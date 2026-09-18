import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllRestaurants } from "../../services/restaurantService";
import { getImageUrl } from "../../utils/constants";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const CustomerHome = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await getAllRestaurants();
                if (res.success) {
                    setRestaurants(res.data || []);
                } else {
                    setError(res.message || "Failed to load restaurants");
                }
            } catch (err) {
                setError("Unable to connect to the backend server");
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const filtered = restaurants.filter(
        (r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="customer-home">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Hungry? Delicious Food Delivered To Your Doorstep!</h1>
                    <p className="hero-subtitle">
                        Explore the finest local restaurants and mouth-watering meals with lightning fast delivery.
                    </p>
                    <div className="hero-search-box">
                        <input
                            type="text"
                            className="hero-search-input"
                            placeholder="Search by restaurant name or area..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Restaurants Section */}
            <section className="main-content-section container">
                <div className="section-header">
                    <h2>Popular Restaurants</h2>
                    <Link to="/customer/restaurants" className="btn btn-outline-primary">
                        View All Restaurants →
                    </Link>
                </div>

                {loading ? (
                    <Loader message="Loading popular restaurants..." />
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title="No Restaurants Available"
                        description={
                            searchTerm
                                ? `No restaurants matching "${searchTerm}"`
                                : "Check back later as new restaurants are joining soon!"
                        }
                    />
                ) : (
                    <div className="restaurant-grid">
                        {filtered.slice(0, 6).map((restaurant) => (
                            <div key={restaurant.id} className="restaurant-card">
                                <div className="card-image-wrapper">
                                    <img
                                        src={getImageUrl("restaurants", restaurant.image)}
                                        alt={restaurant.name}
                                        className="restaurant-img"
                                        onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60";
                                        }}
                                    />
                                </div>
                                <div className="card-body">
                                    <h3 className="restaurant-name">{restaurant.name}</h3>
                                    <p className="restaurant-desc">{restaurant.description || "Fresh & tasty dining"}</p>
                                    <p className="restaurant-location">📍 {restaurant.address}</p>
                                    {restaurant.phone && <p className="restaurant-phone">📞 {restaurant.phone}</p>}
                                    <div className="card-footer-action">
                                        <Link
                                            to={`/customer/restaurants/${restaurant.id}`}
                                            className="btn btn-primary btn-block"
                                        >
                                            View Food Menu
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default CustomerHome;
