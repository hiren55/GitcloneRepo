import fs from "fs";
import path from "path";
import multer from "multer";

const restaurantUploadDir = path.resolve("uploads/restaurants");
const foodUploadDir = path.resolve("uploads/foods");

fs.mkdirSync(restaurantUploadDir, { recursive: true });
fs.mkdirSync(foodUploadDir, { recursive: true });

export const isAllowedImage = (file = {}) => {
    const allowedMimeTypes = new Set([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ]);

    const allowedExtensions = new Set([
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]);

    const originalName = String(file.originalname || "");
    const mimetype = String(file.mimetype || "").toLowerCase();
    const extension = path.extname(originalName).toLowerCase();

    return allowedExtensions.has(extension) && allowedMimeTypes.has(mimetype);
};

const createStorage = (destinationDir) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destinationDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            cb(null, safeName);
        }
    });
};

const fileFilter = (req, file, cb) => {
    if (isAllowedImage(file)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
    }
};

const limits = {
    fileSize: 5 * 1024 * 1024 // 5 MB
};

const restaurantUpload = multer({
    storage: createStorage(restaurantUploadDir),
    fileFilter,
    limits
});

const foodUpload = multer({
    storage: createStorage(foodUploadDir),
    fileFilter,
    limits
});

export const uploadRestaurantImage = (req, res, next) => {
    restaurantUpload.single("image")(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File size exceeds 5MB limit"
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || "Image upload failed"
            });
        }
        next();
    });
};

export const uploadFoodImage = (req, res, next) => {
    foodUpload.single("image")(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File size exceeds 5MB limit"
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || "Image upload failed"
            });
        }
        next();
    });
};
