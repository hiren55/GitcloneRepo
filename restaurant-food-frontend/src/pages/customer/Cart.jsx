import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getImageUrl } from "../../utils/constants";
import EmptyState from "../../components/EmptyState";

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    const total = getCartTotal();

    if (cart.items.length === 0) {
        return (
            <div className="container page-content">
                <EmptyState
                    title="Your Cart is Empty"
                    description="Looks like you haven't added any delicious food to your cart yet."
                    actionText="Browse Restaurants"
                    onAction={() => navigate("/customer/restaurants")}
                />
            </div>
        );
    }

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h2>Shopping Cart</h2>
                    <p className="text-muted">
                        Ordering from: <strong>{cart.restaurantName}</strong>
                    </p>
                </div>
                <button className="btn btn-outline-danger btn-sm" onClick={clearCart}>
                    Clear Cart
                </button>
            </div>

            <div className="cart-layout">
                {/* Cart Items List */}
                <div className="cart-items-card">
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map((item) => (
                                <tr key={item.food_id}>
                                    <td className="cart-item-info">
                                        <img
                                            src={getImageUrl("foods", item.image)}
                                            alt={item.name}
                                            className="cart-item-thumb"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60";
                                            }}
                                        />
                                        <span className="cart-item-name">{item.name}</span>
                                    </td>
                                    <td>₹{item.price.toFixed(2)}</td>
                                    <td>
                                        <div className="qty-control">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.food_id, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.food_id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="font-weight-bold">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </td>
                                    <td>
                                        <button
                                            className="btn-icon text-danger"
                                            title="Remove item"
                                            onClick={() => removeFromCart(item.food_id)}
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cart Summary */}
                <div className="cart-summary-card">
                    <h3 className="summary-title">Order Summary</h3>
                    <div className="summary-row">
                        <span>Items Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Delivery Fee</span>
                        <span className="text-success">FREE</span>
                    </div>
                    <hr className="summary-divider" />
                    <div className="summary-row total-row">
                        <span>Grand Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>

                    <button
                        className="btn btn-primary btn-block btn-lg mt-4"
                        onClick={() => navigate("/customer/checkout")}
                    >
                        Proceed to Checkout →
                    </button>

                    <Link
                        to={`/customer/restaurants/${cart.restaurantId}`}
                        className="btn btn-outline-secondary btn-block mt-2"
                    >
                        + Add More Items
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
