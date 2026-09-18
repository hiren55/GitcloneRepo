import express from "express";
import {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    updateRestaurantImage
} from "../controllers/restaurantController.js";

import {
    createCategory,
    getCategoriesByRestaurant
} from "../controllers/categoryController.js";

import {
    createFood,
    getFoodsByRestaurant
} from "../controllers/foodController.js";

import { getRestaurantOrders } from "../controllers/orderController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
    uploadRestaurantImage,
    uploadFoodImage
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// --------------------------------------------------
// Restaurant Core Endpoints
// --------------------------------------------------

// Create restaurant - RESTAURANT_OWNER only
router.post(
    "/",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    uploadRestaurantImage,
    createRestaurant
);

// Get all active restaurants - Public
router.get(
    "/",
    getAllRestaurants
);

// Get all orders for logged-in restaurant owner
router.get(
    "/orders",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    getRestaurantOrders
);

// Get restaurant by ID - Public
router.get(
    "/:id",
    getRestaurantById
);

// Update restaurant - RESTAURANT_OWNER only
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    updateRestaurant
);

// Delete restaurant - RESTAURANT_OWNER only
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    deleteRestaurant
);

// Upload restaurant image - RESTAURANT_OWNER only
router.post(
    "/:id/image",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    uploadRestaurantImage,
    updateRestaurantImage
);

// --------------------------------------------------
// Nested Category Endpoints for a Restaurant
// --------------------------------------------------

// Create category under a restaurant - RESTAURANT_OWNER only
router.post(
    "/:restaurantId/categories",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    createCategory
);

// Get categories for a restaurant - Public
router.get(
    "/:restaurantId/categories",
    getCategoriesByRestaurant
);

// --------------------------------------------------
// Nested Food Endpoints for a Restaurant
// --------------------------------------------------

// Create food under a restaurant - RESTAURANT_OWNER only
router.post(
    "/:restaurantId/foods",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    uploadFoodImage,
    createFood
);

// Get foods for a restaurant - Public
router.get(
    "/:restaurantId/foods",
    getFoodsByRestaurant
);

export default router;
