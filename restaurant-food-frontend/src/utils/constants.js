export const ROLES = {
    CUSTOMER: "CUSTOMER",
    RESTAURANT_OWNER: "RESTAURANT_OWNER"
};

export const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
];

export const getImageUrl = (folder, filename) => {
    if (!filename) {
        return "/placeholder-food.png";
    }
    // If filename starts with http or blob, return as-is
    if (filename.startsWith("http://") || filename.startsWith("https://") || filename.startsWith("blob:")) {
        return filename;
    }
    const baseUrl = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";
    return `${baseUrl}/uploads/${folder}/${filename}`;
};
