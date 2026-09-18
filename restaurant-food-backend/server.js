import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// Import database pool
import "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads directory statically
app.use("/uploads", express.static(path.resolve("uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Restaurant Food Ordering Backend API is running smoothly!"
    });
});

// 404 Not Found Middleware
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.originalUrl}`
    });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
