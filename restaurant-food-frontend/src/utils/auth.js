const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const getUser = () => {
    try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        return null;
    }
};

export const setUser = (user) => {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
};

export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};

export const clearAuthStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};
