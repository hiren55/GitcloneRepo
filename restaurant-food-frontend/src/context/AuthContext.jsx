import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUser, setToken, setUser, clearAuthStorage } from "../utils/auth";
import * as authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(() => getUser());
    const [token, setTokenState] = useState(() => getToken());
    const [loading, setLoading] = useState(false);

    const isAuthenticated = Boolean(token && user);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const res = await authService.login(credentials);
            if (res.success && res.data) {
                const { token: jwtToken, user: userData } = res.data;
                setToken(jwtToken);
                setUser(userData);
                setTokenState(jwtToken);
                setUserState(userData);
                return { success: true, user: userData };
            }
            return { success: false, message: res.message || "Login failed" };
        } catch (error) {
            const message = error.response?.data?.message || "Invalid email or password";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const registerCustomer = async (formData) => {
        setLoading(true);
        try {
            const res = await authService.registerCustomer(formData);
            return res;
        } catch (error) {
            const message = error.response?.data?.message || "Registration failed";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const registerOwner = async (formData) => {
        setLoading(true);
        try {
            const res = await authService.registerOwner(formData);
            return res;
        } catch (error) {
            const message = error.response?.data?.message || "Registration failed";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuthStorage();
        setUserState(null);
        setTokenState(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                loading,
                login,
                registerCustomer,
                registerOwner,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
