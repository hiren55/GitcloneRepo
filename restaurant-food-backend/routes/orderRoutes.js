import express from "express";
import {
    createOrder,
    getCustomerOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/orderController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create order - CUSTOMER only
router.post(
    "/",
    verifyToken,
    authorizeRoles("CUSTOMER"),
    createOrder
);

// Get logged-in customer's orders - CUSTOMER only
router.get(
    "/",
    verifyToken,
    authorizeRoles("CUSTOMER"),
    getCustomerOrders
);

// Get order by ID - Authenticated (Customer who placed order OR Restaurant Owner)
router.get(
    "/:id",
    verifyToken,
    getOrderById
);

// Update order status - RESTAURANT_OWNER only
router.patch(
    "/:id/status",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    updateOrderStatus
);

export default router;
