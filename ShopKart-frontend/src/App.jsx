import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Admin from "./pages/Admin";
import api from "./services/api";
import { CartProvider } from "./context/CartContext";

function ProtectedRoute({ children }) {
    const [isChecking, setIsChecking] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        api.get("/customers/me")
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false))
            .finally(() => setIsChecking(false));
    }, []);

    if (isChecking) {
        return <p className="route-loading">Checking your session...</p>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function GuestRoute({ children }) {
    const [isChecking, setIsChecking] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        api.get("/customers/me")
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false))
            .finally(() => setIsChecking(false));
    }, []);

    if (isChecking) {
        return <p className="route-loading">Checking your session...</p>;
    }

    if (isLoggedIn) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

function NotFound() {
    return (
        <div className="route-loading">
            <h2>404 - Page not found</h2>
            <Link to="/home">Go back to home</Link>
        </div>
    );
}

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />

                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <GuestRoute>
                            <Register />
                        </GuestRoute>
                    }
                />

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <Products />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/products/:id"
                    element={
                        <ProtectedRoute>
                            <ProductDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/wishlist"
                    element={
                        <ProtectedRoute>
                            <Wishlist />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/order-success/:id"
                    element={
                        <ProtectedRoute>
                            <OrderSuccess />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/orders/:id"
                    element={
                        <ProtectedRoute>
                            <OrderDetails />
                        </ProtectedRoute>
                    }
                />

                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;