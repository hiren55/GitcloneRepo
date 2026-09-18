import axios from "axios";
import { getToken, clearAuthStorage } from "../utils/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            clearAuthStorage();
            // Redirect to login only if not already there
            if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
