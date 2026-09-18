import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ROLES } from "../utils/constants";

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { getItemCount } = useCart();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const cartCount = getItemCount();

    return (
        <header className="navbar-header">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🍕</span>
                    <span className="brand-name">FoodExpress</span>
                </Link>

                <button
                    className="mobile-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
                    {!isAuthenticated ? (
                        <div className="nav-links">
                            <NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                                Home
                            </NavLink>
                            <NavLink to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                                Login
                            </NavLink>
                            <div className="dropdown">
                                <span className="nav-link dropdown-toggle">Register ▾</span>
                                <div className="dropdown-menu">
                                    <Link
                                        to="/register/customer"
                                        className="dropdown-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        As Customer
                                    </Link>
                                    <Link
                                        to="/register/owner"
                                        className="dropdown-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        As Restaurant Owner
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : user?.role === ROLES.CUSTOMER ? (
                        <div className="nav-links">
                            <NavLink to="/customer/restaurants" className="nav-link" onClick={() => setMenuOpen(false)}>
                                Restaurants
                            </NavLink>
                            <NavLink to="/customer/orders" className="nav-link" onClick={() => setMenuOpen(false)}>
                                My Orders
                            </NavLink>
                            <NavLink to="/customer/cart" className="nav-link cart-link" onClick={() => setMenuOpen(false)}>
                                🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </NavLink>
                        </div>
                    ) : (
                        <div className="nav-links">
                            <NavLink to="/owner" end className="nav-link" onClick={() => setMenuOpen(false)}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/owner/restaurant" className="nav-link" onClick={() => setMenuOpen(false)}>
                                My Restaurant
                            </NavLink>
                            <NavLink to="/owner/categories" className="nav-link" onClick={() => setMenuOpen(false)}>
                                Categories
                            </NavLink>
                            <NavLink to="/owner/foods" className="nav-link" onClick={() => setMenuOpen(false)}>
                                Food Menu
                            </NavLink>
                            <NavLink to="/owner/orders" className="nav-link" onClick={() => setMenuOpen(false)}>
                                Orders
                            </NavLink>
                        </div>
                    )}

                    {isAuthenticated && (
                        <div className="nav-user-actions">
                            <span className="user-badge">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-role">({user?.role === ROLES.RESTAURANT_OWNER ? "Owner" : "Customer"})</span>
                            </span>
                            <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
