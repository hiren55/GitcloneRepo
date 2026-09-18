import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successOrder, setSuccessOrder] = useState(null);

    const total = getCartTotal();

    if (cart.items.length === 0 && !successOrder) {
        return (
            <div className="container page-content text-center">
                <h2>No items to checkout</h2>
                <p>Your cart is empty.</p>
                <Link to="/customer/restaurants" className="btn btn-primary mt-3">
                    Browse Restaurants
                </Link>
            </div>
        );
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!deliveryAddress.trim()) {
            setError("Please enter your delivery address");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const orderPayload = {
                restaurant_id: cart.restaurantId,
                delivery_address: deliveryAddress.trim(),
                items: cart.items.map((item) => ({
                    food_id: item.food_id,
                    quantity: item.quantity
                }))
            };

            const res = await createOrder(orderPayload);
            if (res.success) {
                setSuccessOrder(res.data);
                clearCart();
                setTimeout(() => {
                    navigate("/customer/orders");
                }, 2000);
            } else {
                setError(res.message || "Failed to place order");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Checkout</h2>
                    <p className="text-muted">Review your order and enter delivery details</p>
                </div>
            </div>

            {successOrder ? (
                <div className="alert alert-success text-center py-4">
                    <h3>🎉 Order Placed Successfully!</h3>
                    <p>Order ID: #{successOrder.id}</p>
                    <p>Total Amount: ₹{parseFloat(successOrder.total_amount).toFixed(2)}</p>
                    <p className="text-muted mt-2">Redirecting to My Orders...</p>
                </div>
            ) : (
                <div className="checkout-layout">
                    {/* Delivery Form */}
                    <div className="checkout-form-card">
                        <h3 className="section-subtitle">Delivery Information</h3>
                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handlePlaceOrder}>
                            <div className="form-group">
                                <label className="form-label">Delivery Address *</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter your complete delivery address (Building, Street, Area, City, Landmark)..."
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Payment Method</label>
                                <div className="payment-options">
                                    <label className="payment-option selected">
                                        <input type="radio" name="payment" defaultChecked readOnly />
                                        <span>💵 Cash on Delivery (COD)</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success btn-block btn-lg mt-4"
                                disabled={loading}
                            >
                                {loading ? "Placing Order..." : `Confirm & Place Order (₹${total.toFixed(2)})`}
                            </button>
                        </form>
                    </div>

                    {/* Order Review Summary */}
                    <div className="checkout-summary-card">
                        <h3 className="summary-title">Order from: {cart.restaurantName}</h3>
                        <div className="checkout-items-list">
                            {cart.items.map((item) => (
                                <div key={item.food_id} className="checkout-item-row">
                                    <div>
                                        <strong>{item.quantity}x</strong> {item.name}
                                    </div>
                                    <div>₹{(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                        <hr className="summary-divider" />
                        <div className="summary-row total-row">
                            <span>Total Payable</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
