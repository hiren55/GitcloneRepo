import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token not provided"
            });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid token format. Format must be Bearer <token>"
            });
        }

        const token = parts[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token not provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_key");
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
