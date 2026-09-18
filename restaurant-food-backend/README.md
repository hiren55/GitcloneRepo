# Restaurant Food Ordering Backend

A clean, production-ready backend project for a restaurant food ordering system built with **Node.js, Express.js, MySQL (mysql2), and MySQL Stored Procedures**.

---

## 1. Technology Stack

* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MySQL (using `mysql2` connection pool & promise queries)
* **Database Logic**: MySQL Stored Procedures (`CALL sp_...`)
* **Authentication**: JSON Web Tokens (`jsonwebtoken`)
* **Password Hashing**: `bcrypt`
* **File Uploads**: `multer`
* **Environment Configuration**: `dotenv`
* **Cross-Origin Requests**: `cors`

---

## 2. Project Structure

```text
restaurant-food-backend/
│
├── config/
│   └── db.js                      # MySQL connection pool configuration
│
├── controllers/
│   ├── authController.js          # Authentication logic (register, login)
│   ├── restaurantController.js    # Restaurant management logic
│   ├── categoryController.js      # Food categories CRUD
│   ├── foodController.js          # Food items CRUD & availability toggle
│   └── orderController.js         # Order creation, items & status flow
│
├── middlewares/
│   ├── authMiddleware.js          # JWT verification (verifyToken)
│   ├── roleMiddleware.js          # Role authorization (authorizeRoles)
│   └── uploadMiddleware.js        # Reusable Multer configuration
│
├── routes/
│   ├── authRoutes.js              # /api/auth routes
│   ├── restaurantRoutes.js        # /api/restaurants routes
│   ├── categoryRoutes.js          # /api/categories routes
│   ├── foodRoutes.js              # /api/foods routes
│   └── orderRoutes.js             # /api/orders routes
│
├── uploads/
│   ├── restaurants/               # Stored restaurant images
│   └── foods/                     # Stored food item images
│
├── database/
│   └── restaurant.sql             # SQL Schema, tables, seed data & Stored Procedures
│
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
├── README.md                      # Project documentation
└── server.js                      # Server application entry point
```

---

## 3. Database Setup

1. Open your MySQL client (e.g. MySQL Workbench, phpMyAdmin, or MySQL CLI).
2. Execute the complete script located at:
   ```text
   database/restaurant.sql
   ```
   This will automatically create the database `restaurant_db`, all required tables, seed roles (`RESTAURANT_OWNER`, `CUSTOMER`), and all 19 stored procedures.

---

## 4. Environment Variables

Create or update the `.env` file in the root directory:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Password
DB_NAME=restaurant_db
DB_PORT=3306

JWT_SECRET=restaurant_jwt_super_secret_key_2026
```

---

## 5. Setup & Run Project

```bash
# Navigate to project directory
cd restaurant-food-backend

# Install dependencies
npm install

# Start development server (with watch mode)
npm run dev

# Start production server
npm start
```

Server runs on: `http://localhost:5000`

---

## 6. Role Permissions

| Action | CUSTOMER | RESTAURANT_OWNER | Public (Unauthenticated) |
| :--- | :---: | :---: | :---: |
| Register as Customer | ✅ | ❌ | ✅ |
| Register as Restaurant Owner | ❌ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| View Restaurants | ✅ | ✅ | ✅ |
| View Restaurant Categories & Foods | ✅ | ✅ | ✅ |
| Create/Update/Delete Restaurant | ❌ | ✅ (Owned only) | ❌ |
| Upload Restaurant Image | ❌ | ✅ (Owned only) | ❌ |
| Create/Update/Delete Food Category | ❌ | ✅ (Owned only) | ❌ |
| Create/Update/Delete Food Item | ❌ | ✅ (Owned only) | ❌ |
| Toggle Food Availability | ❌ | ✅ (Owned only) | ❌ |
| Upload Food Item Image | ❌ | ✅ (Owned only) | ❌ |
| Place Food Order | ✅ | ❌ | ❌ |
| View Customer Orders | ✅ (Own orders) | ❌ | ❌ |
| View Restaurant Orders | ❌ | ✅ (Owned restaurant) | ❌ |
| Update Order Status | ❌ | ✅ (Owned restaurant) | ❌ |

---

## 7. API Endpoints Reference

### 🔐 Authentication APIs

#### 1. Register Customer
* **Method**: `POST`
* **URL**: `/api/auth/register/customer`
* **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "customer@example.com",
    "password": "password123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Customer registered successfully",
    "data": {
      "id": 2,
      "name": "John Doe",
      "email": "customer@example.com",
      "role": "CUSTOMER",
      "created_at": "2026-09-18T10:00:00.000Z"
    }
  }
  ```

#### 2. Register Restaurant Owner
* **Method**: `POST`
* **URL**: `/api/auth/register/owner`
* **Body**:
  ```json
  {
    "name": "Jane Owner",
    "email": "owner@example.com",
    "password": "password123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Restaurant owner registered successfully",
    "data": {
      "id": 1,
      "name": "Jane Owner",
      "email": "owner@example.com",
      "role": "RESTAURANT_OWNER",
      "created_at": "2026-09-18T10:00:00.000Z"
    }
  }
  ```

#### 3. Login
* **Method**: `POST`
* **URL**: `/api/auth/login`
* **Body**:
  ```json
  {
    "email": "owner@example.com",
    "password": "password123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": 1,
        "name": "Jane Owner",
        "email": "owner@example.com",
        "role": "RESTAURANT_OWNER"
      }
    }
  }
  ```

---

### 🏪 Restaurant APIs

*Header for protected routes*: `Authorization: Bearer <token>`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/restaurants` | `RESTAURANT_OWNER` | Create a new restaurant |
| `GET` | `/api/restaurants` | Public | Get all active restaurants |
| `GET` | `/api/restaurants/:id` | Public | Get restaurant details by ID |
| `PUT` | `/api/restaurants/:id` | `RESTAURANT_OWNER` | Update restaurant details |
| `DELETE`| `/api/restaurants/:id` | `RESTAURANT_OWNER` | Delete restaurant |
| `POST` | `/api/restaurants/:id/image` | `RESTAURANT_OWNER` | Upload restaurant image (multipart/form-data) |

#### Example: Create Restaurant
* **Request**: `POST /api/restaurants`
* **Body**:
  ```json
  {
    "name": "Food Palace",
    "description": "Authentic Indian & Asian Cuisine",
    "address": "Ring Road, Surat, Gujarat",
    "phone": "9876543210"
  }
  ```

---

### 📁 Category APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/restaurants/:restaurantId/categories` | `RESTAURANT_OWNER` | Add category to restaurant |
| `GET` | `/api/restaurants/:restaurantId/categories` | Public | Get categories for a restaurant |
| `PUT` | `/api/categories/:id` | `RESTAURANT_OWNER` | Update category |
| `DELETE`| `/api/categories/:id` | `RESTAURANT_OWNER` | Delete category |

#### Example: Create Category
* **Request**: `POST /api/restaurants/1/categories`
* **Body**:
  ```json
  {
    "name": "Main Course",
    "description": "Delicious curry and breads"
  }
  ```

---

### 🍕 Food / Menu APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/restaurants/:restaurantId/foods` | `RESTAURANT_OWNER` | Add food to restaurant |
| `GET` | `/api/restaurants/:restaurantId/foods` | Public | Get food items for a restaurant |
| `GET` | `/api/foods/:id` | Public | Get single food item by ID |
| `PUT` | `/api/foods/:id` | `RESTAURANT_OWNER` | Update food item details |
| `DELETE`| `/api/foods/:id` | `RESTAURANT_OWNER` | Delete food item |
| `PATCH` | `/api/foods/:id/availability` | `RESTAURANT_OWNER` | Toggle food in-stock/out-of-stock |
| `POST` | `/api/foods/:id/image` | `RESTAURANT_OWNER` | Upload food item image |

#### Example: Add Food Item
* **Request**: `POST /api/restaurants/1/foods`
* **Body**:
  ```json
  {
    "category_id": 1,
    "name": "Paneer Butter Masala",
    "description": "Rich cottage cheese in tomato gravy",
    "price": 280.00,
    "is_available": true
  }
  ```

#### Example: Toggle Availability
* **Request**: `PATCH /api/foods/1/availability`
* **Body**:
  ```json
  {
    "is_available": false
  }
  ```

---

### 📦 Order APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | `CUSTOMER` | Place an order |
| `GET` | `/api/orders` | `CUSTOMER` | View customer's orders |
| `GET` | `/api/orders/:id` | `CUSTOMER` / `RESTAURANT_OWNER` | View single order with items |
| `GET` | `/api/restaurants/orders` | `RESTAURANT_OWNER` | View orders for owner's restaurants |
| `PATCH` | `/api/orders/:id/status` | `RESTAURANT_OWNER` | Update order status |

#### Example: Create Order (Customer)
* **Request**: `POST /api/orders`
* **Body**:
  ```json
  {
    "restaurant_id": 1,
    "delivery_address": "Flat 402, Green Avenue, Surat",
    "items": [
      {
        "food_id": 1,
        "quantity": 2
      }
    ]
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "data": {
      "id": 1,
      "customer_id": 2,
      "restaurant_id": 1,
      "restaurant_name": "Food Palace",
      "total_amount": 560.00,
      "status": "PENDING",
      "delivery_address": "Flat 402, Green Avenue, Surat",
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "food_id": 1,
          "food_name": "Paneer Butter Masala",
          "quantity": 2,
          "price": "280.00",
          "subtotal": "560.00"
        }
      ]
    }
  }
  ```

#### Example: Update Order Status (Owner)
* **Request**: `PATCH /api/orders/1/status`
* **Body**:
  ```json
  {
    "status": "CONFIRMED"
  }
  ```
* *Allowed statuses*: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
