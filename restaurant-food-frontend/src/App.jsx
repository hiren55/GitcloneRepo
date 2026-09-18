import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { ROLES } from "./utils/constants";

// Auth Pages
import Login from "./pages/auth/Login";
import CustomerRegister from "./pages/auth/CustomerRegister";
import OwnerRegister from "./pages/auth/OwnerRegister";

// Customer Pages
import CustomerHome from "./pages/customer/CustomerHome";
import RestaurantList from "./pages/customer/RestaurantList";
import RestaurantDetails from "./pages/customer/RestaurantDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";
import OrderDetails from "./pages/customer/OrderDetails";

// Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import RestaurantManagement from "./pages/owner/RestaurantManagement";
import CategoryManagement from "./pages/owner/CategoryManagement";
import FoodManagement from "./pages/owner/FoodManagement";
import AddFood from "./pages/owner/AddFood";
import EditFood from "./pages/owner/EditFood";
import OwnerOrders from "./pages/owner/OwnerOrders";

function App() {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-viewport">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<CustomerHome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register/customer" element={<CustomerRegister />} />
                    <Route path="/register/owner" element={<OwnerRegister />} />

                    {/* Customer Protected Routes */}
                    <Route element={<RoleRoute allowedRoles={[ROLES.CUSTOMER]} />}>
                        <Route path="/customer" element={<CustomerHome />} />
                        <Route path="/customer/restaurants" element={<RestaurantList />} />
                        <Route path="/customer/restaurants/:id" element={<RestaurantDetails />} />
                        <Route path="/customer/cart" element={<Cart />} />
                        <Route path="/customer/checkout" element={<Checkout />} />
                        <Route path="/customer/orders" element={<MyOrders />} />
                        <Route path="/customer/orders/:id" element={<OrderDetails />} />
                    </Route>

                    {/* Restaurant Owner Protected Routes */}
                    <Route element={<RoleRoute allowedRoles={[ROLES.RESTAURANT_OWNER]} />}>
                        <Route path="/owner" element={<OwnerDashboard />} />
                        <Route path="/owner/restaurant" element={<RestaurantManagement />} />
                        <Route path="/owner/categories" element={<CategoryManagement />} />
                        <Route path="/owner/foods" element={<FoodManagement />} />
                        <Route path="/owner/foods/add" element={<AddFood />} />
                        <Route path="/owner/foods/:id/edit" element={<EditFood />} />
                        <Route path="/owner/orders" element={<OwnerOrders />} />
                    </Route>

                    {/* 404 Catch All */}
                    <Route
                        path="*"
                        element={
                            <div className="container page-content text-center py-5">
                                <h2>404 - Page Not Found</h2>
                                <p className="text-muted">The requested page does not exist.</p>
                            </div>
                        }
                    />
                </Routes>
            </main>
            <footer className="app-footer">
                <div className="container footer-content">
                    <p>© 2026 FoodExpress. Fast, Fresh & Delicious Food Ordering System.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
