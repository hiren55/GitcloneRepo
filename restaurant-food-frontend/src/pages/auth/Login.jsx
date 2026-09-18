import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

const Login = () => {
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError("Please fill in both email and password");
            return;
        }

        const res = await login(formData);
        if (res.success) {
            if (res.user?.role === ROLES.RESTAURANT_OWNER) {
                navigate("/owner");
            } else {
                navigate("/customer");
            }
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-icon">🔐</span>
                    <h2>Welcome Back</h2>
                    <p>Login to your FoodExpress account</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="name@example.com"
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
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register/customer" className="link-primary">
                            Register as Customer
                        </Link>{" "}
                        or{" "}
                        <Link to="/register/owner" className="link-primary">
                            Restaurant Owner
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
