import api from "./api";

export const getFoodsByRestaurant = async (restaurantId) => {
    const response = await api.get(`/restaurants/${restaurantId}/foods`);
    return response.data;
};

export const getFoodById = async (id) => {
    const response = await api.get(`/foods/${id}`);
    return response.data;
};

export const createFood = async (restaurantId, formData) => {
    const response = await api.post(`/restaurants/${restaurantId}/foods`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

export const updateFood = async (id, data) => {
    const response = await api.put(`/foods/${id}`, data);
    return response.data;
};

export const deleteFood = async (id) => {
    const response = await api.delete(`/foods/${id}`);
    return response.data;
};

export const updateFoodAvailability = async (id, is_available) => {
    const response = await api.patch(`/foods/${id}/availability`, { is_available });
    return response.data;
};

export const uploadFoodImage = async (id, formData) => {
    const response = await api.post(`/foods/${id}/image`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};
