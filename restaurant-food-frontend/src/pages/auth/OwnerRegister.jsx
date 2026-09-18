import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OwnerRegister = () => {
    const { registerOwner, loading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, confirmPassword } = formData;

        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setError("Please provide a valid email address");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const res = await registerOwner({ name, email, password });
        if (res.success) {
            setSuccessMessage("Owner registration successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-icon">👨‍🍳</span>
                    <h2>Restaurant Owner Registration</h2>
                    <p>Grow your food business with FoodExpress</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Owner / Business Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Jane Owner"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Business Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="owner@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="•••••••• (Min 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? "Registering..." : "Create Owner Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login" className="link-primary">
                            Sign In
                        </Link>
                    </p>
                    <p className="mt-2">
                        Are you a customer?{" "}
                        <Link to="/register/customer" className="link-secondary">
                            Register as a customer
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OwnerRegister;
