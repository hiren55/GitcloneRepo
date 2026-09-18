import api from "./api";

export const getCategoriesByRestaurant = async (restaurantId) => {
    const response = await api.get(`/restaurants/${restaurantId}/categories`);
    return response.data;
};

export const createCategory = async (restaurantId, data) => {
    const response = await api.post(`/restaurants/${restaurantId}/categories`, data);
    return response.data;
};

export const updateCategory = async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};
