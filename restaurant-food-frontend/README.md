# Restaurant Food Ordering Frontend

A modern, responsive, and standalone React application for the **Restaurant Food Ordering System**, built with **React, JavaScript, Vite, React Router DOM, Axios, and Vanilla CSS**.

---

## 1. Project Overview

This frontend connects to the Node.js + Express + MySQL backend to provide a complete food ordering experience for **Customers** and food/order management for **Restaurant Owners**.

* **Customer Workflow**: Browse Restaurants $\rightarrow$ View Menu $\rightarrow$ Add Items to Cart (with multi-restaurant conflict prevention) $\rightarrow$ Checkout with Delivery Address $\rightarrow$ Track Orders with Status Badges $\rightarrow$ View Itemized Order Breakdown.
* **Owner Workflow**: Manage Restaurant Profile & Image $\rightarrow$ Organize Food Categories $\rightarrow$ Manage Food Menu (Pricing, Photo, In-stock / Out-of-stock toggle) $\rightarrow$ View Incoming Customer Orders $\rightarrow$ Update Order Delivery Status.

---

## 2. Technology Stack

* **Library**: React 19 (JavaScript only, no TypeScript)
* **Build Tool**: Vite
* **Routing**: React Router DOM v7
* **HTTP Client**: Axios (with centralized JWT interceptor & 401 redirect)
* **State Management**: React Context API (`AuthContext`, `CartContext`)
* **Styling**: Vanilla CSS (`src/index.css`) with CSS custom properties and responsive layouts

---

## 3. Folder Structure

```text
restaurant-food-frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Navbar.jsx                  # Responsive role-aware navigation bar
│   │   ├── ProtectedRoute.jsx          # Auth guard (redirects unauthenticated users)
│   │   ├── RoleRoute.jsx               # Role-based guard (CUSTOMER vs RESTAURANT_OWNER)
│   │   ├── Loader.jsx                  # Spinner loading state
│   │   ├── EmptyState.jsx              # Reusable empty data state
│   │   └── ImageUpload.jsx             # File input with preview & 5MB validation
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx               # Authentication login page
│   │   │   ├── CustomerRegister.jsx    # Customer registration page
│   │   │   └── OwnerRegister.jsx       # Restaurant Owner registration page
│   │   │
│   │   ├── customer/
│   │   │   ├── CustomerHome.jsx        # Landing hero banner & featured restaurants
│   │   │   ├── RestaurantList.jsx      # All restaurants with search filter
│   │   │   ├── RestaurantDetails.jsx   # Restaurant menu with category pills
│   │   │   ├── Cart.jsx                # Shopping cart with quantity controls
│   │   │   ├── Checkout.jsx            # Order placement & address submission
│   │   │   ├── MyOrders.jsx            # Order history list with status badges
│   │   │   └── OrderDetails.jsx        # Single order breakdown & items summary
│   │   │
│   │   └── owner/
│   │       ├── OwnerDashboard.jsx      # Summary metrics & quick action buttons
│   │       ├── RestaurantManagement.jsx# Create, edit, delete & upload cover image
│   │       ├── CategoryManagement.jsx  # Category CRUD operations
│   │       ├── FoodManagement.jsx      # Food menu list with availability toggle
│   │       ├── AddFood.jsx             # Add food item with photo upload
│   │       ├── EditFood.jsx            # Edit food details & update photo
│   │       └── OwnerOrders.jsx         # Incoming orders with status dropdown
│   │
│   ├── services/
│   │   ├── api.js                      # Axios instance with Bearer token & 401 interceptor
│   │   ├── authService.js              # Auth API calls
│   │   ├── restaurantService.js        # Restaurant API calls
│   │   ├── categoryService.js          # Category API calls
│   │   ├── foodService.js              # Food API calls
│   │   └── orderService.js             # Order API calls
│   │
│   ├── context/
│   │   ├── AuthContext.jsx             # User state, JWT token & login/logout methods
│   │   └── CartContext.jsx             # Cart state, single-restaurant conflict handling
│   │
│   ├── utils/
│   │   ├── auth.js                     # LocalStorage token & user helpers
│   │   └── constants.js                # Roles, order statuses & image URL builder
│   │
│   ├── App.jsx                         # Main router configuration
│   ├── main.jsx                        # React root with BrowserRouter & Providers
│   └── index.css                       # Complete application styling
│
├── .env                                # Frontend environment variables
├── .gitignore
├── index.html
├── package.json
└── README.md
```

---

## 4. Environment Variables

The `.env` file in the root directory contains:

```env
VITE_API_URL=http://localhost:5000/api
VITE_IMAGE_URL=http://localhost:5000
```

---

## 5. Installation & Running Instructions

```bash
# 1. Navigate to frontend directory
cd restaurant-food-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build production bundle
npm run build
```

By default, Vite runs the development server on `http://localhost:5173`.

---

## 6. Backend Integration & API Alignment

The frontend communicates with the backend on `http://localhost:5000/api`:

* **Authentication**:
  * `POST /api/auth/register/customer` $\rightarrow$ Register Customer
  * `POST /api/auth/register/owner` $\rightarrow$ Register Restaurant Owner
  * `POST /api/auth/login` $\rightarrow$ Login & JWT receipt
* **Restaurants**:
  * `POST /api/restaurants` (Owner only)
  * `GET /api/restaurants` (Public)
  * `GET /api/restaurants/:id` (Public)
  * `PUT /api/restaurants/:id` (Owner only)
  * `DELETE /api/restaurants/:id` (Owner only)
  * `POST /api/restaurants/:id/image` (Owner only)
* **Categories**:
  * `POST /api/restaurants/:restaurantId/categories` (Owner only)
  * `GET /api/restaurants/:restaurantId/categories` (Public)
  * `PUT /api/categories/:id` (Owner only)
  * `DELETE /api/categories/:id` (Owner only)
* **Foods**:
  * `POST /api/restaurants/:restaurantId/foods` (Owner only)
  * `GET /api/restaurants/:restaurantId/foods` (Public)
  * `GET /api/foods/:id` (Public)
  * `PUT /api/foods/:id` (Owner only)
  * `DELETE /api/foods/:id` (Owner only)
  * `PATCH /api/foods/:id/availability` (Owner only)
  * `POST /api/foods/:id/image` (Owner only)
* **Orders**:
  * `POST /api/orders` (Customer only)
  * `GET /api/orders` (Customer only)
  * `GET /api/orders/:id` (Customer or Restaurant Owner)
  * `GET /api/restaurants/orders` (Owner only)
  * `PATCH /api/orders/:id/status` (Owner only)
