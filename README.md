# ShopKart 🛒

A full-stack **MERN** e-commerce application featuring product browsing, wishlist management, cart operations, and Razorpay-integrated payments.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Seeding Products](#-seeding-products)
- [Test Payment Credentials](#-test-payment-credentials)
- [API Reference](#-api-reference)
- [Security](#-security)
- [License](#-license)

---

## ✨ Features

| Area | Description |
|---|---|
| **Authentication** | Register, login, and logout with JWT stored in HttpOnly cookies; change-password support |
| **Product Catalogue** | Browse products with real-time search and category filtering |
| **Wishlist** | Add, remove, and toggle wishlist items with a live count in the navbar |
| **Shopping Cart** | Add, update quantity, and remove items with server-side stock enforcement |
| **Global State** | React Context (`CartContext`) provides a single source of truth across all cart-related views |
| **Checkout** | Multi-step checkout with client-side shipping form validation and order review |
| **Payments** | Razorpay Test Mode — server creates the order, client pays, server verifies the HMAC signature |
| **Orders** | Snapshot-based order history (name, price, and image are frozen at purchase time) |

---

## 🧰 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose
- **Auth:** JSON Web Tokens (jsonwebtoken), bcrypt
- **Payments:** Razorpay Node SDK
- **Utilities:** cookie-parser, dotenv, nodemon

### Frontend
- **Library:** React 19
- **Build Tool:** Vite
- **Routing:** React Router 7
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Styling:** Plain CSS

---

## 📁 Project Structure

```
ShopKart/
├── ShopKart-backend/
│   ├── config/
│   │   └── razorpay.js          # Lazy Razorpay client initialisation
│   ├── controllers/             # Route handlers: customer, product, wishlist, cart, order
│   ├── middlewares/
│   │   ├── isAuth.js            # JWT authentication middleware
│   │   └── errorHandler.js      # Centralised error handler
│   ├── models/                  # Mongoose schemas: Customer, Product, Order
│   ├── routes/                  # Express routers: /customers /products /wishlist /cart /orders
│   ├── utils/
│   │   └── generateToken.js     # JWT signing helper
│   ├── .env.example             # Environment variable template
│   └── index.js                 # Server entry point
├── ShopKart-frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI: Navbar, ProductCard, CartItem, SearchBar, ...
│   │   ├── context/             # CartContext and useCart hook
│   │   ├── pages/               # Route-level views: Home, Products, ProductDetails,
│   │   │                        #   Wishlist, Cart, Checkout, OrderSuccess, Orders, OrderDetails
│   │   ├── services/
│   │   │   └── api.js           # Shared Axios instance with base URL and credentials
│   │   ├── .env.example         # Frontend environment variable template
│   │   └── App.jsx              # Root component with routes and CartProvider
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
- A **MongoDB** database — [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or a local instance
- A **Razorpay** account with Test Mode enabled — no real money is involved

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ShopKart
```

### 2. Set Up the Backend

```bash
cd ShopKart-backend
npm install
```

Copy the environment template and fill in your values:

```bash
# macOS / Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Start the development server:

```bash
npm run dev
# Server running at http://localhost:8082
```

Expected output: `Server Started at 8082` and `DB Connected`.

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd ShopKart-frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend — `ShopKart-backend/.env`

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | A long, random secret string for signing tokens |
| `PORT` | Port for the Express server (default: `8082`) |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `RAZORPAY_KEY_ID` | Razorpay Test Mode key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Test Mode key secret — **backend only, never expose to the client** |

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
PORT=8082
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
```

> Obtain your Razorpay keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) with **Test Mode ON**.

### Frontend — `ShopKart-frontend/.env.local` *(optional)*

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (defaults to `http://localhost:8082`) |

---

## 🌱 Seeding Products

The product catalogue is managed via the API. Seed an initial product using curl or Postman:

```bash
curl -X POST http://localhost:8082/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mechanical Keyboard",
    "description": "Hot-swappable switches, RGB backlit",
    "price": 2999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    "stock": 25
  }'
```

---

## 💳 Test Payment Credentials

Use the following Razorpay test card details when checking out:

| Field | Success | Failure |
|---|---|---|
| **Card Number** | `4111 1111 1111 1111` | `4000 0000 0000 0002` |
| **Expiry** | Any future date | Any future date |
| **CVV** | Any 3 digits | Any 3 digits |
| **OTP** | `123456` | `654321` |

On a successful payment, the cart clears, stock is decremented, and the order appears under **My Orders**.

---

## 🔌 API Reference

All routes are prefixed by their resource. `🔒` denotes routes that require a valid JWT cookie.

### Customers — `/customers`

| Method | Route | Auth | Description |
|---|---|:--:|---|
| POST | `/register` | | Create a new customer account |
| POST | `/login` | | Authenticate and set an HttpOnly session cookie |
| POST | `/logout` | 🔒 | Invalidate the session and clear the cookie |
| GET | `/me` | 🔒 | Retrieve the authenticated customer's profile |
| PATCH | `/change-password` | 🔒 | Update the account password |

### Products — `/products`

| Method | Route | Auth | Description |
|---|---|:--:|---|
| GET | `/` | | List all products; supports `?search=` and `?category=` query params |
| GET | `/:id` | | Retrieve a single product by ID |
| POST | `/` | | Create a new product |
| PATCH | `/:id` | 🔒 | Update a product's price or stock |

### Wishlist — `/wishlist`

| Method | Route | Auth | Description |
|---|---|:--:|---|
| GET | `/` | 🔒 | Retrieve saved products with count |
| POST | `/:productId` | 🔒 | Add a product to the wishlist |
| DELETE | `/:productId` | 🔒 | Remove a product from the wishlist |
| PATCH | `/:productId/toggle` | 🔒 | Toggle wishlist membership |

### Cart — `/cart`

| Method | Route | Auth | Description |
|---|---|:--:|---|
| GET | `/` | 🔒 | Retrieve the cart with populated product details |
| POST | `/:productId` | 🔒 | Add one unit of a product (no duplicate rows) |
| PATCH | `/:productId` | 🔒 | Set the quantity for a cart line (`{ "quantity": 3 }`) |
| DELETE | `/:productId` | 🔒 | Remove a product line from the cart |

### Orders — `/orders`

| Method | Route | Auth | Description |
|---|---|:--:|---|
| POST | `/create-payment-order` | 🔒 | Validate cart and stock, compute total, create a Razorpay order |
| POST | `/verify-payment` | 🔒 | Verify Razorpay HMAC signature, mark order as PAID, clear cart |
| GET | `/` | 🔒 | List all orders for the authenticated user, newest first |
| GET | `/:id` | 🔒 | Retrieve a single order (ownership enforced) |

---

## 🔐 Security

- Passwords are hashed with **bcrypt** before storage.
- JWTs are signed with a secret and stored in **HttpOnly** cookies — inaccessible to JavaScript.
- The authenticated user is always resolved from `req.user` (the verified token), never from the request body.
- **Server-side validation at checkout:** cart totals are recomputed from live product prices, stock is re-verified, and any `totalAmount` sent by the client is discarded.
- Orders **snapshot** `name`, `price`, and `image` at purchase time so order history remains accurate even if a product is later updated.
- An order is only marked `PAID` after the **Razorpay HMAC-SHA256 signature** is successfully verified; a failed or forged payment leaves the cart untouched.
- `GET /orders/:id` queries `findOne({ _id, user })` to ensure users can only access their own orders.
- `.env` is git-ignored; only `.env.example` is committed to source control.

---

## 📄 License

For academic use only.