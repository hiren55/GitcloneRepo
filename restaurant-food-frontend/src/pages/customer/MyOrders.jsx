import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCustomerOrders } from "../../services/orderService";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const getStatusBadgeClass = (status) => {
    switch (status) {
        case "PENDING":
            return "badge-warning";
        case "CONFIRMED":
        case "PREPARING":
            return "badge-info";
        case "READY":
        case "OUT_FOR_DELIVERY":
            return "badge-primary";
        case "DELIVERED":
            return "badge-success";
        case "CANCELLED":
            return "badge-danger";
        default:
            return "badge-secondary";
    }
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getCustomerOrders();
                if (res.success) {
                    setOrders(res.data || []);
                } else {
                    setError(res.message || "Failed to load orders");
                }
            } catch (err) {
                setError("Unable to connect to order service.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>My Orders</h2>
                    <p className="text-muted">Track and review all your food deliveries</p>
                </div>
            </div>

            {loading ? (
                <Loader message="Loading your order history..." />
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : orders.length === 0 ? (
                <EmptyState
                    title="No Orders Placed Yet"
                    description="You haven't ordered anything yet. Browse our restaurants to place your first order!"
                    actionText="Browse Restaurants"
                    onAction={() => (window.location.href = "/customer/restaurants")}
                />
            ) : (
                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Restaurant</th>
                                <th>Date & Time</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="font-weight-bold">#{order.id}</td>
                                    <td>{order.restaurant_name}</td>
                                    <td className="text-muted">
                                        {new Date(order.created_at).toLocaleString()}
                                    </td>
                                    <td className="font-weight-bold">
                                        ₹{parseFloat(order.total_amount).toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/customer/orders/${order.id}`}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            View Details
                                        </Link>
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

export default MyOrders;
