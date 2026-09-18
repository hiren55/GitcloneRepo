import api from "./api";

export const getAllRestaurants = async () => {
    const response = await api.get("/restaurants");
    return response.data;
};

export const getRestaurantById = async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
};

export const createRestaurant = async (formData) => {
    const response = await api.post("/restaurants", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

export const updateRestaurant = async (id, data) => {
    const response = await api.put(`/restaurants/${id}`, data);
    return response.data;
};

export const deleteRestaurant = async (id) => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
};

export const uploadRestaurantImage = async (id, formData) => {
    const response = await api.post(`/restaurants/${id}/image`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};
