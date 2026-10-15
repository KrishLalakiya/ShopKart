# ShopKart 🛒

A full-stack **MERN** e-commerce application built across six engineering labs.

Browse products → save to wishlist → add to cart → checkout with shipping details →
pay with **Razorpay (Test Mode)** → order history.

---

## ✨ Features

| Area | What it does |
|---|---|
| **Authentication** | Register / login / logout with JWT in HttpOnly cookies, plus change-password |
| **Product catalogue** | Grid of products with search (regex-escaped) and category filter |
| **Wishlist** | Add / remove / toggle wishlist with a live count in the navbar |
| **Shopping cart** | Add, increase, decrease and remove items with stock limits enforced on the server |
| **Global state** | React Context (`CartContext`) so the cart count, cards and cart page share one source of truth |
| **Checkout** | Shipping form with client-side validation, final order review |
| **Payments** | Razorpay Test Mode: server creates the Razorpay order, browser pays, server verifies the HMAC signature |
| **Orders** | Order snapshot (name/price frozen at purchase time), order confirmation, My Orders list and order details |
| **Admin tool** | Hidden `/admin` page to edit product price and stock |

---

## 🧰 Tech Stack

**Backend** — Node.js, Express 5, MongoDB + Mongoose, jsonwebtoken, bcrypt, cookie-parser, razorpay
**Frontend** — React 19, Vite, React Router 7, Axios, React Context API, plain CSS

---

## 📁 Project Structure

```
ShopKart/
├── ShopKart-backend/
│   ├── config/razorpay.js       # lazy Razorpay client (boots without keys)
│   ├── controllers/             # customer, product, wishlist, cart, order
│   ├── middlewares/             # isAuth (JWT), error handler
│   ├── models/                  # customer, product, order
│   ├── routes/                  # /customers /products /wishlist /cart /orders
│   ├── utils/generateToken.js
│   ├── .env.example             # copy to .env and fill in
│   └── index.js
├── ShopKart-frontend/
│   ├── src/
│   │   ├── components/          # Navbar, ProductCard, CartItem, SearchBar, ...
│   │   ├── context/             # CartContext + useCart (global cart state)
│   │   ├── pages/               # Home, Products, ProductDetails, Wishlist, Cart,
│   │   │                        # Checkout, OrderSuccess, Orders, OrderDetails, Admin
│   │   ├── services/api.js      # shared axios instance
│   │   ├── .env.example
│   │   └── App.jsx              # routes + CartProvider
│   └── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js 18+** and **npm**
- A **MongoDB** database — either [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or a local install
- A free **Razorpay account** (Test Mode only — no real money is involved)

### 1. Get the code
```bash
git clone <your-repo-url>
cd ShopKart
```

### 2. Backend
```bash
cd ShopKart-backend
npm install
```

Create your environment file:
```bash
cp .env.example .env      # Windows: copy .env.example .env
```

Open `.env` and fill in your own values:
```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
PORT=8082
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
```

> 🔑 `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` come from the
> [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) with **Test Mode ON**.
> The secret must stay on the backend — never put it in frontend code.

Start the server:
```bash
npm run dev        # nodemon, http://localhost:8082
```

You should see `Server Started at 8082` and `DB Connected`.

### 3. Frontend
```bash
cd ShopKart-frontend
npm install
npm run dev        # vite, http://localhost:5173
```

Optional: copy `.env.example` to `.env.local` and set `VITE_API_URL` if your backend is
not on `http://localhost:8082`.

### 4. Load some products
The catalogue is read-only from the UI, so seed it once with Postman or curl:
```bash
curl -X POST http://localhost:8082/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Mechanical Keyboard","description":"Hot-swappable","price":2999,"category":"Electronics","image":"https://images.unsplash.com/photo-1587829741301-dc798b83add3","stock":25}'
```

### 5. Run it
1. Register a customer at `http://localhost:5173/register`
2. Add products to the wishlist and cart
3. Cart → **Proceed to Checkout** → fill the shipping form → **Place Order**
4. Pay with a Razorpay **test** card:

| Field | Value |
|---|---|
| Card number | `4111 1111 1111 1111` (success) |
| Card number | `4000 0000 0000 0002` (failure) |
| Expiry / CVV | any future date / any 3 digits |
| OTP | `123456` (success) / `654321` (failure) |

5. On success you land on the confirmation page, the cart empties, stock drops and the
   order appears under **My Orders**.

---

## 🔌 API Reference

All routes are prefixed by their resource. 🔒 = requires a valid JWT cookie.

### Customers — `/customers`
| Method | Route | Auth | Purpose |
|---|---|:--:|---|
| POST | `/register` | | Create account |
| POST | `/login` | | Login, sets HttpOnly cookie |
| POST | `/logout` | 🔒 | Clear session |
| GET | `/me` | 🔒 | Current profile |
| PATCH | `/change-password` | 🔒 | Change password (lab bonus) |

### Products — `/products`
| Method | Route | Auth | Purpose |
|---|---|:--:|---|
| GET | `/` | | List with `?search=` and `?category=` |
| GET | `/:id` | | Single product |
| POST | `/` | | Create product |
| PATCH | `/:id` | 🔒 | Update price / stock (admin page) |

### Wishlist — `/wishlist`
| Method | Route | Auth | Purpose |
|---|---|:--:|---|
| GET | `/` | 🔒 | Saved products + count |
| POST | `/:productId` | 🔒 | Add to wishlist |
| DELETE | `/:productId` | 🔒 | Remove |
| PATCH | `/:productId/toggle` | 🔒 | Toggle (lab bonus) |

### Cart — `/cart`
| Method | Route | Auth | Purpose |
|---|---|:--:|---|
| GET | `/` | 🔒 | Cart with populated products |
| POST | `/:productId` | 🔒 | Add one unit (never duplicates a row) |
| PATCH | `/:productId` | 🔒 | Set quantity (`{ "quantity": 3 }`) |
| DELETE | `/:productId` | 🔒 | Remove line |

### Orders — `/orders`
| Method | Route | Auth | Purpose |
|---|---|:--:|---|
| POST | `/create-payment-order` | 🔒 | Validate cart + stock, calculate total, create ShopKart + Razorpay order |
| POST | `/verify-payment` | 🔒 | Verify Razorpay signature, mark PAID, clear cart |
| GET | `/` | 🔒 | My orders, newest first |
| GET | `/:id` | 🔒 | One order (ownership enforced) |

---

## 🔐 Security Notes

- Passwords are hashed with **bcrypt**; JWTs are signed and stored in **HttpOnly** cookies.
- The user is always taken from `req.user` (the verified token) — never from the request body.
- **The server never trusts the frontend**: cart totals are recomputed from current
  product prices, stock is re-checked at checkout, and `totalAmount` sent by the client is ignored.
- Orders **snapshot** `name` / `price` / `image` so order history stays accurate even after a
  product is renamed or repriced.
- An order only becomes `PAID` after the **Razorpay HMAC-SHA256 signature** verifies, and the
  cart is cleared only after that — a failed or forged payment leaves the cart untouched.
- `GET /orders/:id` uses `findOne({ _id, user })`, so a user can never read another user's order.
- `.env` is git-ignored; only `.env.example` is committed.

---

## 🚀 Deployment (optional)

**Backend — Render / Railway**
1. New Web Service → point at this repo → root directory `ShopKart-backend`
2. Build: `npm install` · Start: `npm run dev`
3. Add the environment variables from `.env.example` in the dashboard
4. Note the public URL

**Frontend — Vercel / Netlify**
1. New project → root directory `ShopKart-frontend`
2. Build: `npm run build` · Output: `dist`
3. Set `VITE_API_URL` to the backend URL
4. Set the backend's `CLIENT_URL` to the frontend URL (CORS)

---

## 📄 License

For academic use only.