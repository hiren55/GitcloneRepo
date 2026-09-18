import db from "../config/db.js";

export const createCategory = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const ownerId = req.user.id;
        const { name, description } = req.body;

        if (!restaurantId || isNaN(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const [result] = await db.query(
            "CALL sp_CreateCategory(?,?,?,?)",
            [
                restaurantId,
                ownerId,
                name.trim(),
                description ? description.trim() : null
            ]
        );

        const category = result[0]?.[0];

        if (!category || !category.id) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found or you are not authorized to add categories to it"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        console.error("Create Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getCategoriesByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        if (!restaurantId || isNaN(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        const [result] = await db.query("CALL sp_GetCategoriesByRestaurant(?)", [restaurantId]);

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: result[0] || []
        });
    } catch (error) {
        console.error("Get Categories Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
        const { name, description, is_active } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid category ID is required"
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const activeStatus = typeof is_active === "boolean" ? is_active : true;

        const [result] = await db.query(
            "CALL sp_UpdateCategory(?,?,?,?,?)",
            [
                id,
                ownerId,
                name.trim(),
                description ? description.trim() : null,
                activeStatus
            ]
        );

        const updatedCategory = result[0]?.[0];

        if (!updatedCategory || !updatedCategory.id) {
            return res.status(404).json({
                success: false,
                message: "Category not found or you are not authorized to update it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        console.error("Update Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid category ID is required"
            });
        }

        const [result] = await db.query("CALL sp_DeleteCategory(?,?)", [id, ownerId]);
        const success = result[0]?.[0]?.success;

        if (!success || success === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found or you are not authorized to delete it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error("Delete Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
