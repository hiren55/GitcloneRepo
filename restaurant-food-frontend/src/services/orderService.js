import api from "./api";

export const createOrder = async (data) => {
    const response = await api.post("/orders", data);
    return response.data;
};

export const getCustomerOrders = async () => {
    const response = await api.get("/orders");
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export const getRestaurantOrders = async () => {
    const response = await api.get("/restaurants/orders");
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
};
