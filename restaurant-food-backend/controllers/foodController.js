import db from "../config/db.js";

export const createFood = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const ownerId = req.user.id;
        const { category_id, name, description, price, is_available } = req.body;

        if (!restaurantId || isNaN(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        if (!name || !price || !category_id) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (name, price, category_id)"
            });
        }

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a number greater than 0"
            });
        }

        const available = is_available === "false" || is_available === false ? false : true;
        const image = req.file?.filename || null;

        const [result] = await db.query(
            "CALL sp_CreateFood(?,?,?,?,?,?,?,?)",
            [
                restaurantId,
                ownerId,
                category_id,
                name.trim(),
                description ? description.trim() : null,
                numericPrice,
                image,
                available
            ]
        );

        const data = result[0]?.[0];

        if (!data || data.error_code === "UNAUTHORIZED") {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found or you are not authorized to add food to it"
            });
        }

        if (data.error_code === "INVALID_CATEGORY") {
            return res.status(400).json({
                success: false,
                message: "Category does not exist or does not belong to this restaurant"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Food item created successfully",
            data
        });
    } catch (error) {
        console.error("Create Food Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getFoodsByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        if (!restaurantId || isNaN(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        const [result] = await db.query("CALL sp_GetFoodsByRestaurant(?)", [restaurantId]);

        return res.status(200).json({
            success: true,
            message: "Foods fetched successfully",
            data: result[0] || []
        });
    } catch (error) {
        console.error("Get Foods Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getFoodById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid food ID is required"
            });
        }

        const [result] = await db.query("CALL sp_GetFoodById(?)", [id]);
        const food = result[0]?.[0];

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Food item fetched successfully",
            data: food
        });
    } catch (error) {
        console.error("Get Food By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
        const { category_id, name, description, price, is_available } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid food ID is required"
            });
        }

        if (!name || !price || !category_id) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (name, price, category_id)"
            });
        }

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a number greater than 0"
            });
        }

        const available = is_available === "false" || is_available === false ? false : true;

        const [result] = await db.query(
            "CALL sp_UpdateFood(?,?,?,?,?,?,?)",
            [
                id,
                ownerId,
                category_id,
                name.trim(),
                description ? description.trim() : null,
                numericPrice,
                available
            ]
        );

        const data = result[0]?.[0];

        if (!data || data.error_code === "UNAUTHORIZED") {
            return res.status(404).json({
                success: false,
                message: "Food item not found or you are not authorized to update it"
            });
        }

        if (data.error_code === "INVALID_CATEGORY") {
            return res.status(400).json({
                success: false,
                message: "Category does not exist or does not belong to this restaurant"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Food item updated successfully",
            data
        });
    } catch (error) {
        console.error("Update Food Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid food ID is required"
            });
        }

        const [result] = await db.query("CALL sp_DeleteFood(?,?)", [id, ownerId]);
        const success = result[0]?.[0]?.success;

        if (!success || success === 0) {
            return res.status(404).json({
                success: false,
                message: "Food item not found or you are not authorized to delete it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Food item deleted successfully"
        });
    } catch (error) {
        console.error("Delete Food Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateFoodAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
        const { is_available } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid food ID is required"
            });
        }

        if (typeof is_available !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_available must be a boolean (true or false)"
            });
        }

        const [result] = await db.query(
            "CALL sp_UpdateFoodAvailability(?,?,?)",
            [id, ownerId, is_available]
        );

        const updated = result[0]?.[0];

        if (!updated || !updated.id) {
            return res.status(404).json({
                success: false,
                message: "Food item not found or you are not authorized to update it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Food availability updated successfully",
            data: updated
        });
    } catch (error) {
        console.error("Update Food Availability Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateFoodImage = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid food ID is required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image file"
            });
        }

        const [result] = await db.query(
            "CALL sp_UpdateFoodImage(?,?,?)",
            [id, ownerId, req.file.filename]
        );

        const updated = result[0]?.[0];

        if (!updated || !updated.id) {
            return res.status(404).json({
                success: false,
                message: "Food item not found or you are not authorized to upload images for it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Food image uploaded successfully",
            data: updated
        });
    } catch (error) {
        console.error("Upload Food Image Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
