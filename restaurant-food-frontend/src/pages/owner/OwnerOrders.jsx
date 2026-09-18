import React, { useState, useEffect } from "react";
import { getRestaurantOrders, updateOrderStatus } from "../../services/orderService";
import { ORDER_STATUSES } from "../../utils/constants";
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

const OwnerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await getRestaurantOrders();
            if (res.success) {
                setOrders(res.data || []);
            } else {
                setError(res.message || "Failed to load orders");
            }
        } catch (err) {
            setError("Unable to load orders from server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        setError("");
        setSuccessMsg("");

        try {
            const res = await updateOrderStatus(orderId, newStatus);
            if (res.success) {
                setSuccessMsg(`Order #${orderId} status changed to ${newStatus}`);
                setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
                );
                setTimeout(() => setSuccessMsg(""), 3000);
            } else {
                setError(res.message || "Failed to update order status");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update order status");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <Loader message="Loading incoming orders..." />;
    }

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Customer Orders Management</h2>
                    <p className="text-muted">Track order fulfillment and update delivery statuses</p>
                </div>
                <button className="btn btn-outline-primary btn-sm" onClick={fetchOrders}>
                    🔄 Refresh Orders
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            {orders.length === 0 ? (
                <EmptyState
                    title="No Orders Received Yet"
                    description="When customers place orders from your restaurant, they will appear here in real-time."
                />
            ) : (
                <div className="table-responsive-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Delivery Address</th>
                                <th>Amount</th>
                                <th>Placed At</th>
                                <th>Current Status</th>
                                <th>Update Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="font-weight-bold">#{order.id}</td>
                                    <td>
                                        <strong>{order.customer_name}</strong>
                                        <small className="d-block text-muted">{order.customer_email}</small>
                                    </td>
                                    <td className="address-cell">{order.delivery_address}</td>
                                    <td className="font-weight-bold">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                                    <td className="text-muted">
                                        {new Date(order.created_at).toLocaleString([], {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="form-control form-control-sm status-dropdown"
                                            value={order.status}
                                            disabled={updatingId === order.id}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
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

export default OwnerOrders;
