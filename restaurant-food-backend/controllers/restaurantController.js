import db from "../config/db.js";

export const createRestaurant = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { name, description, address, phone } = req.body;

        if (!name || !address) {
            return res.status(400).json({
                success: false,
                message: "Please provide restaurant name and address"
            });
        }

        const image = req.file?.filename || null;

        const [result] = await db.query(
            "CALL sp_CreateRestaurant(?,?,?,?,?,?)",
            [
                ownerId,
                name.trim(),
                description ? description.trim() : null,
                address.trim(),
                phone ? phone.trim() : null,
                image
            ]
        );

        const restaurant = result[0][0];

        return res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: restaurant
        });
    } catch (error) {
        console.error("Create Restaurant Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getAllRestaurants = async (req, res) => {
    try {
        const [result] = await db.query("CALL sp_GetRestaurants()");

        return res.status(200).json({
            success: true,
            message: "Restaurants fetched successfully",
            data: result[0] || []
        });
    } catch (error) {
        console.error("Get All Restaurants Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        const [result] = await db.query("CALL sp_GetRestaurantById(?)", [id]);
        const restaurant = result[0]?.[0];

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant fetched successfully",
            data: restaurant
        });
    } catch (error) {
        console.error("Get Restaurant By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
        const { name, description, address, phone } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        if (!name || !address) {
            return res.status(400).json({
                success: false,
                message: "Please provide restaurant name and address"
            });
        }

        const [result] = await db.query(
            "CALL sp_UpdateRestaurant(?,?,?,?,?,?)",
            [
                id,
                ownerId,
                name.trim(),
                description ? description.trim() : null,
                address.trim(),
                phone ? phone.trim() : null
            ]
        );

        const updatedRestaurant = result[0]?.[0];

        if (!updatedRestaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found or you are not authorized to update it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            data: updatedRestaurant
        });
    } catch (error) {
        console.error("Update Restaurant Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        const [result] = await db.query("CALL sp_DeleteRestaurant(?,?)", [id, ownerId]);
        const affectedRows = result[0]?.[0]?.affected_rows;

        if (!affectedRows || affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found or you are not authorized to delete it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully"
        });
    } catch (error) {
        console.error("Delete Restaurant Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateRestaurantImage = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image file"
            });
        }

        const [result] = await db.query(
            "CALL sp_UpdateRestaurantImage(?,?,?)",
            [id, ownerId, req.file.filename]
        );

        const updated = result[0]?.[0];

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found or you are not authorized to upload images for it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant image uploaded successfully",
            data: updated
        });
    } catch (error) {
        console.error("Upload Restaurant Image Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
