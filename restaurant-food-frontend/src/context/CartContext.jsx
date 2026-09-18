import React, { createContext, useContext, useState, useEffect } from "react";

const CART_STORAGE_KEY = "restaurant_cart";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : { restaurantId: null, restaurantName: "", items: [] };
        } catch (e) {
            return { restaurantId: null, restaurantName: "", items: [] };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error("Failed to save cart to localStorage", e);
        }
    }, [cart]);

    const addToCart = (food, restaurant) => {
        // If cart has items from a different restaurant
        if (cart.restaurantId && cart.items.length > 0 && cart.restaurantId !== restaurant.id) {
            return {
                conflict: true,
                currentRestaurant: cart.restaurantName,
                newRestaurant: restaurant.name,
                resolve: () => {
                    // Force clear and add
                    setCart({
                        restaurantId: restaurant.id,
                        restaurantName: restaurant.name,
                        items: [
                            {
                                food_id: food.id,
                                name: food.name,
                                price: parseFloat(food.price),
                                image: food.image,
                                quantity: 1
                            }
                        ]
                    });
                }
            };
        }

        // Add or increment
        setCart((prev) => {
            const existingIndex = prev.items.findIndex((item) => item.food_id === food.id);
            let updatedItems;

            if (existingIndex > -1) {
                updatedItems = [...prev.items];
                updatedItems[existingIndex].quantity += 1;
            } else {
                updatedItems = [
                    ...prev.items,
                    {
                        food_id: food.id,
                        name: food.name,
                        price: parseFloat(food.price),
                        image: food.image,
                        quantity: 1
                    }
                ];
            }

            return {
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                items: updatedItems
            };
        });

        return { conflict: false };
    };

    const removeFromCart = (foodId) => {
        setCart((prev) => {
            const updatedItems = prev.items.filter((item) => item.food_id !== foodId);
            return {
                restaurantId: updatedItems.length === 0 ? null : prev.restaurantId,
                restaurantName: updatedItems.length === 0 ? "" : prev.restaurantName,
                items: updatedItems
            };
        });
    };

    const updateQuantity = (foodId, quantity) => {
        const qty = parseInt(quantity, 10);
        if (qty <= 0) {
            removeFromCart(foodId);
            return;
        }

        setCart((prev) => {
            const updatedItems = prev.items.map((item) => {
                if (item.food_id === foodId) {
                    return { ...item, quantity: qty };
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
    };

    const clearCart = () => {
        setCart({ restaurantId: null, restaurantName: "", items: [] });
    };

    const getCartTotal = () => {
        return cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    };

    const getItemCount = () => {
        return cart.items.reduce((acc, item) => acc + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getItemCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
