import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../../services/orderService";
import { getImageUrl } from "../../utils/constants";
import Loader from "../../components/Loader";

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

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await getOrderById(id);
                if (res.success) {
                    setOrder(res.data);
                } else {
                    setError(res.message || "Order not found");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Unable to fetch order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return <Loader message="Loading order details..." />;
    }

    if (error || !order) {
        return (
            <div className="container page-content">
                <div className="alert alert-danger">{error || "Order not found"}</div>
                <Link to="/customer/orders" className="btn btn-primary">
                    ← Back to My Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Order #{order.id}</h2>
                    <p className="text-muted">
                        Placed on: {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <Link to="/customer/orders" className="btn btn-outline-secondary btn-sm">
                    ← Back to Orders
                </Link>
            </div>

            <div className="order-details-grid">
                {/* Order Information Card */}
                <div className="order-info-card">
                    <div className="order-info-header">
                        <h3>Restaurant & Status</h3>
                        <span className={`badge ${getStatusBadgeClass(order.status)} font-size-lg`}>
                            {order.status}
                        </span>
                    </div>
                    <div className="info-grid">
                        <div>
                            <span className="info-label">Restaurant</span>
                            <p className="info-value">{order.restaurant_name}</p>
                        </div>
                        {order.restaurant_phone && (
                            <div>
                                <span className="info-label">Restaurant Phone</span>
                                <p className="info-value">{order.restaurant_phone}</p>
                            </div>
                        )}
                        <div>
                            <span className="info-label">Delivery Address</span>
                            <p className="info-value">{order.delivery_address}</p>
                        </div>
                        <div>
                            <span className="info-label">Payment Method</span>
                            <p className="info-value">Cash on Delivery (COD)</p>
                        </div>
                    </div>
                </div>

                {/* Items Breakdown Card */}
                <div className="order-items-card">
                    <h3 className="section-subtitle">Items Ordered</h3>
                    <table className="order-items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th className="text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item) => (
                                <tr key={item.id}>
                                    <td className="item-name-cell">
                                        <img
                                            src={getImageUrl("foods", item.food_image)}
                                            alt={item.food_name}
                                            className="order-item-thumb"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60";
                                            }}
                                        />
                                        <span>{item.food_name}</span>
                                    </td>
                                    <td>₹{parseFloat(item.price).toFixed(2)}</td>
                                    <td>{item.quantity}</td>
                                    <td className="text-right font-weight-bold">
                                        ₹{parseFloat(item.subtotal).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="text-right font-weight-bold">
                                    Grand Total:
                                </td>
                                <td className="text-right grand-total-amount font-weight-bold">
                                    ₹{parseFloat(order.total_amount).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
