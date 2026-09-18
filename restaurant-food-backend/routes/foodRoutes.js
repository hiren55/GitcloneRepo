import express from "express";
import {
    getFoodById,
    updateFood,
    deleteFood,
    updateFoodAvailability,
    updateFoodImage
} from "../controllers/foodController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { uploadFoodImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Get food item by ID - Public
router.get(
    "/:id",
    getFoodById
);

// Update food item - RESTAURANT_OWNER only
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    updateFood
);

// Delete food item - RESTAURANT_OWNER only
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    deleteFood
);

// Change food availability toggle - RESTAURANT_OWNER only
router.patch(
    "/:id/availability",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    updateFoodAvailability
);

// Upload food image - RESTAURANT_OWNER only
router.post(
    "/:id/image",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    uploadFoodImage,
    updateFoodImage
);

export default router;
