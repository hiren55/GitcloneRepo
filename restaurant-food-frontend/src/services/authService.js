import api from "./api";

export const registerCustomer = async (data) => {
    const response = await api.post("/auth/register/customer", data);
    return response.data;
};

export const registerOwner = async (data) => {
    const response = await api.post("/auth/register/owner", data);
    return response.data;
};

export const login = async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
};
