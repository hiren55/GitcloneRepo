import db from "../config/db.js";

const validOrderStatuses = new Set([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
]);

export const createOrder = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { restaurant_id, delivery_address, items } = req.body;

        if (!restaurant_id || isNaN(restaurant_id)) {
            return res.status(400).json({
                success: false,
                message: "Valid restaurant ID is required"
            });
        }

        if (!delivery_address || typeof delivery_address !== "string" || !delivery_address.trim()) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items array must contain at least one food item"
            });
        }

        // Verify restaurant exists and is active
        const [restaurantResult] = await db.query("CALL sp_GetRestaurantById(?)", [restaurant_id]);
        const restaurant = restaurantResult[0]?.[0];
        if (!restaurant || !restaurant.is_active) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found or is currently inactive"
            });
        }

        // Validate each food item, check availability, read current price snapshot
        const verifiedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const { food_id, quantity } = item;

            if (!food_id || isNaN(food_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Each item must have a valid food_id"
                });
            }

            const qty = parseInt(quantity, 10);
            if (isNaN(qty) || qty <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Quantity for food ID ${food_id} must be a positive integer`
                });
            }

            const [foodResult] = await db.query(
                "CALL sp_GetFoodForOrderValidation(?,?)",
                [food_id, restaurant_id]
            );

            const food = foodResult[0]?.[0];

            if (!food) {
                return res.status(400).json({
                    success: false,
                    message: `Food item ID ${food_id} does not exist or does not belong to the selected restaurant`
                });
            }

            if (!food.is_active) {
                return res.status(400).json({
                    success: false,
                    message: `Food item '${food.name}' is currently not active`
                });
            }

            if (!food.is_available) {
                return res.status(400).json({
                    success: false,
                    message: `Food item '${food.name}' is currently out of stock / unavailable`
                });
            }

            const price = parseFloat(food.price);
            const subtotal = Math.round(price * qty * 100) / 100;
            totalAmount += subtotal;

            verifiedItems.push({
                food_id: food.id,
                food_name: food.name,
                quantity: qty,
                price,
                subtotal
            });
        }

        totalAmount = Math.round(totalAmount * 100) / 100;

        // Create the order
        const [orderResult] = await db.query(
            "CALL sp_CreateOrder(?,?,?,?)",
            [
                customerId,
                restaurant_id,
                delivery_address.trim(),
                totalAmount
            ]
        );

        const order = orderResult[0]?.[0];

        // Insert order items
        const createdItems = [];
        for (const vItem of verifiedItems) {
            const [itemResult] = await db.query(
                "CALL sp_CreateOrderItem(?,?,?,?,?)",
                [
                    order.id,
                    vItem.food_id,
                    vItem.quantity,
                    vItem.price,
                    vItem.subtotal
                ]
            );
            createdItems.push({
                ...itemResult[0]?.[0],
                food_name: vItem.food_name
            });
        }

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: {
                ...order,
                items: createdItems
            }
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.user.id;

        const [result] = await db.query("CALL sp_GetCustomerOrders(?)", [customerId]);

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: result[0] || []
        });
    } catch (error) {
        console.error("Get Customer Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid order ID is required"
            });
        }

        const [orderResult] = await db.query(
            "CALL sp_GetOrderById(?,?,?)",
            [id, userId, role]
        );

        const order = orderResult[0]?.[0];

        if (!order || !order.id) {
            return res.status(404).json({
                success: false,
                message: "Order not found or you are not authorized to view it"
            });
        }

        const [itemsResult] = await db.query("CALL sp_GetOrderItems(?)", [id]);
        const items = itemsResult[0] || [];

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: {
                ...order,
                items
            }
        });
    } catch (error) {
        console.error("Get Order By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getRestaurantOrders = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [result] = await db.query("CALL sp_GetRestaurantOrders(?)", [ownerId]);

        return res.status(200).json({
            success: true,
            message: "Restaurant orders fetched successfully",
            data: result[0] || []
        });
    } catch (error) {
        console.error("Get Restaurant Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
        const { status } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid order ID is required"
            });
        }

        if (!status || !validOrderStatuses.has(status.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed statuses: ${Array.from(validOrderStatuses).join(", ")}`
            });
        }

        const formattedStatus = status.toUpperCase();

        const [result] = await db.query(
            "CALL sp_UpdateOrderStatus(?,?,?)",
            [id, ownerId, formattedStatus]
        );

        const updated = result[0]?.[0];

        if (!updated || !updated.id) {
            return res.status(404).json({
                success: false,
                message: "Order not found or you are not authorized to update this order"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updated
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
