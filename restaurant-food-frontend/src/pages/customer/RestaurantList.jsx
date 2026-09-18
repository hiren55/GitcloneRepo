import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllRestaurants } from "../../services/restaurantService";
import { getImageUrl } from "../../utils/constants";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const RestaurantList = () => {
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
                setError("Unable to fetch restaurants. Please ensure the backend is running.");
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
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>All Restaurants</h2>
                    <p className="text-muted">Browse available restaurants and order your favorite dishes</p>
                </div>
                <div className="search-bar-wrapper">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search restaurant or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <Loader message="Loading restaurants..." />
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    title="No Restaurants Found"
                    description={
                        searchTerm
                            ? `No results matching "${searchTerm}". Try a different search keyword.`
                            : "There are currently no active restaurants listed."
                    }
                />
            ) : (
                <div className="restaurant-grid">
                    {filtered.map((restaurant) => (
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
                                <p className="restaurant-desc">{restaurant.description || "Authentic quality meals"}</p>
                                <p className="restaurant-location">📍 {restaurant.address}</p>
                                {restaurant.phone && <p className="restaurant-phone">📞 {restaurant.phone}</p>}
                                <div className="card-footer-action">
                                    <Link
                                        to={`/customer/restaurants/${restaurant.id}`}
                                        className="btn btn-primary btn-block"
                                    >
                                        View Menu & Order
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantList;
