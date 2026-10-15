# ShopKart — Frontend

React 19 + Vite client for the ShopKart full-stack MERN e-commerce application.

For the full API reference, environment variable details, and getting started guide, see the [root README](../README.md).

---

## 🚀 Quick Start

Ensure the backend server is running on `http://localhost:8082` before starting the frontend.

```bash
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 🔑 Environment Variables

To connect to a backend other than `http://localhost:8082`, create a `.env.local` file:

```bash
# macOS / Linux
cp .env.example .env.local

# Windows
copy .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:8082`) |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Compile a production-optimised build into `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint across the source files |

---

## 📁 Source Structure

```
src/
├── components/     # Reusable UI components (Navbar, ProductCard, CartItem, SearchBar, ...)
├── context/        # CartContext and useCart hook for global cart state
├── pages/          # Route-level views:
│   ├── Home
│   ├── Products
│   ├── ProductDetails
│   ├── Wishlist
│   ├── Cart
│   ├── Checkout
│   ├── OrderSuccess
│   ├── Orders
│   └── OrderDetails
├── services/
│   └── api.js      # Shared Axios instance (base URL + withCredentials)
└── App.jsx         # Root component — router setup and CartProvider wrapper
```

---

## 📄 License

For academic use only.