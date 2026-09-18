import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const registerCustomer = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (name, email, password)"
            });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if email already registered
        const [existing] = await db.query("CALL sp_LoginUser(?)", [email]);
        if (existing[0] && existing[0].length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Role 2 = CUSTOMER
        const [result] = await db.query(
            "CALL sp_RegisterUser(?,?,?,?)",
            [2, name.trim(), email.trim().toLowerCase(), hashedPassword]
        );

        const user = result[0][0];

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error("Register Customer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const registerOwner = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (name, email, password)"
            });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if email already registered
        const [existing] = await db.query("CALL sp_LoginUser(?)", [email]);
        if (existing[0] && existing[0].length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Role 1 = RESTAURANT_OWNER
        const [result] = await db.query(
            "CALL sp_RegisterUser(?,?,?,?)",
            [1, name.trim(), email.trim().toLowerCase(), hashedPassword]
        );

        const user = result[0][0];

        return res.status(201).json({
            success: true,
            message: "Restaurant owner registered successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error("Register Owner Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        const [result] = await db.query("CALL sp_LoginUser(?)", [email.trim().toLowerCase()]);
        const user = result[0]?.[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role_name
            },
            process.env.JWT_SECRET || "default_jwt_secret_key",
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role_name
                }
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
