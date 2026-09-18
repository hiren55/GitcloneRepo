import express from "express";
import {
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Update category by ID - RESTAURANT_OWNER only
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    updateCategory
);

// Delete category by ID - RESTAURANT_OWNER only
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("RESTAURANT_OWNER"),
    deleteCategory
);

export default router;
