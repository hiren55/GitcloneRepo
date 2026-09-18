-- =======================================================
-- Restaurant Food Ordering Database Schema & Stored Procedures
-- =======================================================

CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Roles
INSERT IGNORE INTO roles (id, role_name) VALUES
(1, 'RESTAURANT_OWNER'),
(2, 'CUSTOMER');

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(20),
    image VARCHAR(500) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id)
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_cat (restaurant_id)
);

-- 5. Foods Table
CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500) DEFAULT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_restaurant_food (restaurant_id),
    INDEX idx_category_food (category_id)
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED') DEFAULT 'PENDING',
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_restaurant_order (restaurant_id)
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
    INDEX idx_order (order_id)
);

-- =======================================================
-- STORED PROCEDURES
-- =======================================================

-- -------------------------------------------------------
-- AUTH PROCEDURES
-- -------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_RegisterUser;
DELIMITER $$
CREATE PROCEDURE sp_RegisterUser(
    IN p_role_id INT,
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    INSERT INTO users(role_id, name, email, password)
    VALUES(p_role_id, p_name, p_email, p_password);

    SELECT 
        u.id,
        u.role_id,
        r.role_name,
        u.name,
        u.email,
        u.created_at
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE u.id = LAST_INSERT_ID();
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_LoginUser;
DELIMITER $$
CREATE PROCEDURE sp_LoginUser(
    IN p_email VARCHAR(100)
)
BEGIN
    SELECT 
        u.id,
        u.name,
        u.email,
        u.password,
        u.role_id,
        r.role_name
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE u.email = p_email;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetRoles;
DELIMITER $$
CREATE PROCEDURE sp_GetRoles()
BEGIN
    SELECT id, role_name, created_at FROM roles ORDER BY id ASC;
END $$
DELIMITER ;

-- -------------------------------------------------------
-- RESTAURANT PROCEDURES
-- -------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_CreateRestaurant;
DELIMITER $$
CREATE PROCEDURE sp_CreateRestaurant(
    IN p_owner_id INT,
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_address VARCHAR(500),
    IN p_phone VARCHAR(20),
    IN p_image VARCHAR(500)
)
BEGIN
    INSERT INTO restaurants(owner_id, name, description, address, phone, image)
    VALUES(p_owner_id, p_name, p_description, p_address, p_phone, p_image);

    SELECT 
        r.id,
        r.owner_id,
        r.name,
        r.description,
        r.address,
        r.phone,
        r.image,
        r.is_active,
        r.created_at,
        r.updated_at
    FROM restaurants r
    WHERE r.id = LAST_INSERT_ID();
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetRestaurants;
DELIMITER $$
CREATE PROCEDURE sp_GetRestaurants()
BEGIN
    SELECT 
        r.id,
        r.owner_id,
        u.name AS owner_name,
        r.name,
        r.description,
        r.address,
        r.phone,
        r.image,
        r.is_active,
        r.created_at,
        r.updated_at
    FROM restaurants r
    INNER JOIN users u ON r.owner_id = u.id
    WHERE r.is_active = TRUE
    ORDER BY r.id DESC;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetRestaurantById;
DELIMITER $$
CREATE PROCEDURE sp_GetRestaurantById(
    IN p_id INT
)
BEGIN
    SELECT 
        r.id,
        r.owner_id,
        u.name AS owner_name,
        r.name,
        r.description,
        r.address,
        r.phone,
        r.image,
        r.is_active,
        r.created_at,
        r.updated_at
    FROM restaurants r
    INNER JOIN users u ON r.owner_id = u.id
    WHERE r.id = p_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateRestaurant;
DELIMITER $$
CREATE PROCEDURE sp_UpdateRestaurant(
    IN p_id INT,
    IN p_owner_id INT,
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_address VARCHAR(500),
    IN p_phone VARCHAR(20)
)
BEGIN
    UPDATE restaurants
    SET 
        name = p_name,
        description = p_description,
        address = p_address,
        phone = p_phone
    WHERE id = p_id AND owner_id = p_owner_id;

    SELECT 
        r.id,
        r.owner_id,
        r.name,
        r.description,
        r.address,
        r.phone,
        r.image,
        r.is_active,
        r.created_at,
        r.updated_at
    FROM restaurants r
    WHERE r.id = p_id AND r.owner_id = p_owner_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_DeleteRestaurant;
DELIMITER $$
CREATE PROCEDURE sp_DeleteRestaurant(
    IN p_id INT,
    IN p_owner_id INT
)
BEGIN
    DELETE FROM restaurants
    WHERE id = p_id AND owner_id = p_owner_id;

    SELECT ROW_COUNT() AS affected_rows;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateRestaurantImage;
DELIMITER $$
CREATE PROCEDURE sp_UpdateRestaurantImage(
    IN p_id INT,
    IN p_owner_id INT,
    IN p_image VARCHAR(500)
)
BEGIN
    UPDATE restaurants
    SET image = p_image
    WHERE id = p_id AND owner_id = p_owner_id;

    SELECT 
        r.id,
        r.owner_id,
        r.name,
        r.image,
        r.updated_at
    FROM restaurants r
    WHERE r.id = p_id AND r.owner_id = p_owner_id;
END $$
DELIMITER ;

-- -------------------------------------------------------
-- CATEGORY PROCEDURES
-- -------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_CreateCategory;
DELIMITER $$
CREATE PROCEDURE sp_CreateCategory(
    IN p_restaurant_id INT,
    IN p_owner_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT
)
BEGIN
    DECLARE v_owner_exists INT DEFAULT 0;

    -- Verify restaurant ownership
    SELECT COUNT(*) INTO v_owner_exists
    FROM restaurants
    WHERE id = p_restaurant_id AND owner_id = p_owner_id;

    IF v_owner_exists > 0 THEN
        INSERT INTO categories(restaurant_id, name, description)
        VALUES(p_restaurant_id, p_name, p_description);

        SELECT 
            c.id,
            c.restaurant_id,
            c.name,
            c.description,
            c.is_active,
            c.created_at,
            c.updated_at
        FROM categories c
        WHERE c.id = LAST_INSERT_ID();
    ELSE
        SELECT NULL AS id;
    END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetCategoriesByRestaurant;
DELIMITER $$
CREATE PROCEDURE sp_GetCategoriesByRestaurant(
    IN p_restaurant_id INT
)
BEGIN
    SELECT 
        c.id,
        c.restaurant_id,
        c.name,
        c.description,
        c.is_active,
        c.created_at,
        c.updated_at
    FROM categories c
    WHERE c.restaurant_id = p_restaurant_id AND c.is_active = TRUE
    ORDER BY c.id ASC;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateCategory;
DELIMITER $$
CREATE PROCEDURE sp_UpdateCategory(
    IN p_id INT,
    IN p_owner_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_is_active BOOLEAN
)
BEGIN
    DECLARE v_category_restaurant_id INT DEFAULT NULL;

    SELECT c.restaurant_id INTO v_category_restaurant_id
    FROM categories c
    INNER JOIN restaurants r ON c.restaurant_id = r.id
    WHERE c.id = p_id AND r.owner_id = p_owner_id;

    IF v_category_restaurant_id IS NOT NULL THEN
        UPDATE categories
        SET 
            name = p_name,
            description = p_description,
            is_active = p_is_active
        WHERE id = p_id;

        SELECT 
            c.id,
            c.restaurant_id,
            c.name,
            c.description,
            c.is_active,
            c.created_at,
            c.updated_at
        FROM categories c
        WHERE c.id = p_id;
    ELSE
        SELECT NULL AS id;
    END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_DeleteCategory;
DELIMITER $$
CREATE PROCEDURE sp_DeleteCategory(
    IN p_id INT,
    IN p_owner_id INT
)
BEGIN
    DECLARE v_category_restaurant_id INT DEFAULT NULL;

    SELECT c.restaurant_id INTO v_category_restaurant_id
    FROM categories c
    INNER JOIN restaurants r ON c.restaurant_id = r.id
    WHERE c.id = p_id AND r.owner_id = p_owner_id;

    IF v_category_restaurant_id IS NOT NULL THEN
        DELETE FROM categories WHERE id = p_id;
        SELECT 1 AS success;
    ELSE
        SELECT 0 AS success;
    END IF;
END $$
DELIMITER ;

-- -------------------------------------------------------
-- FOOD PROCEDURES
-- -------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_CreateFood;
DELIMITER $$
CREATE PROCEDURE sp_CreateFood(
    IN p_restaurant_id INT,
    IN p_owner_id INT,
    IN p_category_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_price DECIMAL(10,2),
    IN p_image VARCHAR(500),
    IN p_is_available BOOLEAN
)
BEGIN
    DECLARE v_owner_exists INT DEFAULT 0;
    DECLARE v_category_valid INT DEFAULT 0;

    -- Verify restaurant ownership
    SELECT COUNT(*) INTO v_owner_exists
    FROM restaurants
    WHERE id = p_restaurant_id AND owner_id = p_owner_id;

    -- Verify category belongs to the same restaurant
    SELECT COUNT(*) INTO v_category_valid
    FROM categories
    WHERE id = p_category_id AND restaurant_id = p_restaurant_id;

    IF v_owner_exists = 0 THEN
        SELECT 'UNAUTHORIZED' AS error_code;
    ELSEIF v_category_valid = 0 THEN
        SELECT 'INVALID_CATEGORY' AS error_code;
    ELSE
        INSERT INTO foods(
            restaurant_id,
            category_id,
            name,
            description,
            price,
            image,
            is_available
        )
        VALUES(
            p_restaurant_id,
            p_category_id,
            p_name,
            p_description,
            p_price,
            p_image,
            p_is_available
        );

        SELECT 
            f.id,
            f.restaurant_id,
            f.category_id,
            c.name AS category_name,
            f.name,
            f.description,
            f.price,
            f.image,
            f.is_available,
            f.is_active,
            f.created_at,
            f.updated_at,
            'SUCCESS' AS error_code
        FROM foods f
        INNER JOIN categories c ON f.category_id = c.id
        WHERE f.id = LAST_INSERT_ID();
    END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetFoodsByRestaurant;
DELIMITER $$
CREATE PROCEDURE sp_GetFoodsByRestaurant(
    IN p_restaurant_id INT
)
BEGIN
    SELECT 
        f.id,
        f.restaurant_id,
        f.category_id,
        c.name AS category_name,
        f.name,
        f.description,
        f.price,
        f.image,
        f.is_available,
        f.is_active,
        f.created_at,
        f.updated_at
    FROM foods f
    INNER JOIN categories c ON f.category_id = c.id
    WHERE f.restaurant_id = p_restaurant_id AND f.is_active = TRUE
    ORDER BY f.id DESC;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetFoodById;
DELIMITER $$
CREATE PROCEDURE sp_GetFoodById(
    IN p_id INT
)
BEGIN
    SELECT 
        f.id,
        f.restaurant_id,
        r.name AS restaurant_name,
        f.category_id,
        c.name AS category_name,
        f.name,
        f.description,
        f.price,
        f.image,
        f.is_available,
        f.is_active,
        f.created_at,
        f.updated_at
    FROM foods f
    INNER JOIN restaurants r ON f.restaurant_id = r.id
    INNER JOIN categories c ON f.category_id = c.id
    WHERE f.id = p_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateFood;
DELIMITER $$
CREATE PROCEDURE sp_UpdateFood(
    IN p_id INT,
    IN p_owner_id INT,
    IN p_category_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_price DECIMAL(10,2),
    IN p_is_available BOOLEAN
)
BEGIN
    DECLARE v_restaurant_id INT DEFAULT NULL;
    DECLARE v_category_valid INT DEFAULT 0;

    -- Verify ownership of the food's restaurant
    SELECT f.restaurant_id INTO v_restaurant_id
    FROM foods f
    INNER JOIN restaurants r ON f.restaurant_id = r.id
    WHERE f.id = p_id AND r.owner_id = p_owner_id;

    IF v_restaurant_id IS NULL THEN
        SELECT 'UNAUTHORIZED' AS error_code;
    ELSE
        -- Verify category belongs to this restaurant
        SELECT COUNT(*) INTO v_category_valid
        FROM categories
        WHERE id = p_category_id AND restaurant_id = v_restaurant_id;

        IF v_category_valid = 0 THEN
            SELECT 'INVALID_CATEGORY' AS error_code;
        ELSE
            UPDATE foods
            SET 
                category_id = p_category_id,
                name = p_name,
                description = p_description,
                price = p_price,
                is_available = p_is_available
            WHERE id = p_id;

            SELECT 
                f.id,
                f.restaurant_id,
                f.category_id,
                c.name AS category_name,
                f.name,
                f.description,
                f.price,
                f.image,
                f.is_available,
                f.is_active,
                f.created_at,
                f.updated_at,
                'SUCCESS' AS error_code
            FROM foods f
            INNER JOIN categories c ON f.category_id = c.id
            WHERE f.id = p_id;
        END IF;
    END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_DeleteFood;
DELIMITER $$
CREATE PROCEDURE sp_DeleteFood(
    IN p_id INT,
    IN p_owner_id INT
)
BEGIN
    DECLARE v_food_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_food_exists
    FROM foods f
    INNER JOIN restaurants r ON f.restaurant_id = r.id
    WHERE f.id = p_id AND r.owner_id = p_owner_id;

    IF v_food_exists > 0 THEN
        DELETE FROM foods WHERE id = p_id;
        SELECT 1 AS success;
    ELSE
        SELECT 0 AS success;
    END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateFoodAvailability;
DELIMITER $$
CREATE PROCEDURE sp_UpdateFoodAvailability(
    IN p_id INT,
    IN p_owner_id INT,
    IN p_is_available BOOLEAN
)
BEGIN
    DECLARE v_food_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_food_exists
    FROM foods f
    INNER JOIN restaurants r ON f.restaurant_id = r.id
    WHERE f.id = p_id AND r.owner_id = p_owner_id;

    IF v_food_exists > 0 THEN
        UPDATE foods
        SET is_available = p_is_available
        WHERE id = p_id;

        SELECT 
            f.id,
            f.name,
            f.is_available,
            f.updated_at
        FROM foods f
        WHERE f.id = p_id;
    ELSE
        SELECT NULL AS id;
    END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateFoodImage;
DELIMITER $$
CREATE PROCEDURE sp_UpdateFoodImage(
    IN p_id INT,
    IN p_owner_id INT,
    IN p_image VARCHAR(500)
)
BEGIN
    DECLARE v_food_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_food_exists
    FROM foods f
    INNER JOIN restaurants r ON f.restaurant_id = r.id
    WHERE f.id = p_id AND r.owner_id = p_owner_id;

    IF v_food_exists > 0 THEN
        UPDATE foods
        SET image = p_image
        WHERE id = p_id;

        SELECT 
            f.id,
            f.name,
            f.image,
            f.updated_at
        FROM foods f
        WHERE f.id = p_id;
    ELSE
        SELECT NULL AS id;
    END IF;
END $$
DELIMITER ;

-- -------------------------------------------------------
-- ORDER PROCEDURES
-- -------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_GetFoodForOrderValidation;
DELIMITER $$
CREATE PROCEDURE sp_GetFoodForOrderValidation(
    IN p_food_id INT,
    IN p_restaurant_id INT
)
BEGIN
    SELECT 
        id,
        restaurant_id,
        name,
        price,
        is_available,
        is_active
    FROM foods
    WHERE id = p_food_id AND restaurant_id = p_restaurant_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_CreateOrder;
DELIMITER $$
CREATE PROCEDURE sp_CreateOrder(
    IN p_customer_id INT,
    IN p_restaurant_id INT,
    IN p_delivery_address TEXT,
    IN p_total_amount DECIMAL(10,2)
)
BEGIN
    INSERT INTO orders(customer_id, restaurant_id, delivery_address, total_amount, status)
    VALUES(p_customer_id, p_restaurant_id, p_delivery_address, p_total_amount, 'PENDING');

    SELECT 
        o.id,
        o.customer_id,
        o.restaurant_id,
        r.name AS restaurant_name,
        o.total_amount,
        o.status,
        o.delivery_address,
        o.created_at
    FROM orders o
    INNER JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = LAST_INSERT_ID();
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_CreateOrderItem;
DELIMITER $$
CREATE PROCEDURE sp_CreateOrderItem(
    IN p_order_id INT,
    IN p_food_id INT,
    IN p_quantity INT,
    IN p_price DECIMAL(10,2),
    IN p_subtotal DECIMAL(10,2)
)
BEGIN
    INSERT INTO order_items(order_id, food_id, quantity, price, subtotal)
    VALUES(p_order_id, p_food_id, p_quantity, p_price, p_subtotal);

    SELECT 
        oi.id,
        oi.order_id,
        oi.food_id,
        oi.quantity,
        oi.price,
        oi.subtotal
    FROM order_items oi
    WHERE oi.id = LAST_INSERT_ID();
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetCustomerOrders;
DELIMITER $$
CREATE PROCEDURE sp_GetCustomerOrders(
    IN p_customer_id INT
)
BEGIN
    SELECT 
        o.id,
        o.customer_id,
        o.restaurant_id,
        r.name AS restaurant_name,
        o.total_amount,
        o.status,
        o.delivery_address,
        o.created_at,
        o.updated_at
    FROM orders o
    INNER JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.customer_id = p_customer_id
    ORDER BY o.id DESC;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetOrderById;
DELIMITER $$
CREATE PROCEDURE sp_GetOrderById(
    IN p_id INT,
    IN p_user_id INT,
    IN p_role VARCHAR(50)
)
BEGIN
    IF p_role = 'CUSTOMER' THEN
        SELECT 
            o.id,
            o.customer_id,
            u.name AS customer_name,
            u.email AS customer_email,
            o.restaurant_id,
            r.name AS restaurant_name,
            r.phone AS restaurant_phone,
            o.total_amount,
            o.status,
            o.delivery_address,
            o.created_at,
            o.updated_at
        FROM orders o
        INNER JOIN users u ON o.customer_id = u.id
        INNER JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.id = p_id AND o.customer_id = p_user_id;
    ELSEIF p_role = 'RESTAURANT_OWNER' THEN
        SELECT 
            o.id,
            o.customer_id,
            u.name AS customer_name,
            u.email AS customer_email,
            o.restaurant_id,
            r.name AS restaurant_name,
            r.phone AS restaurant_phone,
            o.total_amount,
            o.status,
            o.delivery_address,
            o.created_at,
            o.updated_at
        FROM orders o
        INNER JOIN users u ON o.customer_id = u.id
        INNER JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.id = p_id AND r.owner_id = p_user_id;
    ELSE
        SELECT NULL AS id;
    END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetOrderItems;
DELIMITER $$
CREATE PROCEDURE sp_GetOrderItems(
    IN p_order_id INT
)
BEGIN
    SELECT 
        oi.id,
        oi.order_id,
        oi.food_id,
        f.name AS food_name,
        f.image AS food_image,
        oi.quantity,
        oi.price,
        oi.subtotal
    FROM order_items oi
    INNER JOIN foods f ON oi.food_id = f.id
    WHERE oi.order_id = p_order_id
    ORDER BY oi.id ASC;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetRestaurantOrders;
DELIMITER $$
CREATE PROCEDURE sp_GetRestaurantOrders(
    IN p_owner_id INT
)
BEGIN
    SELECT 
        o.id,
        o.customer_id,
        u.name AS customer_name,
        u.email AS customer_email,
        o.restaurant_id,
        r.name AS restaurant_name,
        o.total_amount,
        o.status,
        o.delivery_address,
        o.created_at,
        o.updated_at
    FROM orders o
    INNER JOIN users u ON o.customer_id = u.id
    INNER JOIN restaurants r ON o.restaurant_id = r.id
    WHERE r.owner_id = p_owner_id
    ORDER BY o.id DESC;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateOrderStatus;
DELIMITER $$
CREATE PROCEDURE sp_UpdateOrderStatus(
    IN p_order_id INT,
    IN p_owner_id INT,
    IN p_status VARCHAR(50)
)
BEGIN
    DECLARE v_is_owner INT DEFAULT 0;

    -- Check if logged in user owns the restaurant of this order
    SELECT COUNT(*) INTO v_is_owner
    FROM orders o
    INNER JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = p_order_id AND r.owner_id = p_owner_id;

    IF v_is_owner > 0 THEN
        UPDATE orders
        SET status = p_status
        WHERE id = p_order_id;

        SELECT 
            o.id,
            o.customer_id,
            o.restaurant_id,
            o.total_amount,
            o.status,
            o.updated_at
        FROM orders o
        WHERE o.id = p_order_id;
    ELSE
        SELECT NULL AS id;
    END IF;
END $$
DELIMITER ;
