import express from "express";
import {
    registerCustomer,
    registerOwner,
    login
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register/customer", registerCustomer);
router.post("/register/owner", registerOwner);
router.post("/login", login);

export default router;
