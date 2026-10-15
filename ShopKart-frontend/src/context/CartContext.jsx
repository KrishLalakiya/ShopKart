import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { CartContext } from "./useCart";

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const refreshCart = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/cart");
            setCartItems(response.data?.cart ?? []);
            setError("");
        } catch (err) {
            if (err?.response?.status !== 401) {
                setError("Unable to load your cart.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        api.get("/cart")
            .then((response) => {
                setCartItems(response.data?.cart ?? []);
                setError("");
            })
            .catch((err) => {
                if (err?.response?.status !== 401) {
                    setError("Unable to load your cart.");
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const applyCart = (cart) => {
        setCartItems(Array.isArray(cart) ? cart : []);
        setError("");
    };

    const addItem = async (productId) => {
        const response = await api.post(`/cart/${productId}`);
        applyCart(response.data?.cart);
    };

    const removeItem = async (productId) => {
        const response = await api.delete(`/cart/${productId}`);
        applyCart(response.data?.cart);
    };

    const updateQuantity = async (productId, quantity) => {
        const response = await api.patch(`/cart/${productId}`, { quantity });
        applyCart(response.data?.cart);
    };

    // used AFTER the backend has verified payment and cleared the Mongo cart;
    // keeps the navbar count in sync without a page refresh
    const clearCart = () => {
        setCartItems([]);
        setError("");
    };

    const cartedIds = useMemo(
        () => cartItems.map((item) => item.product?._id).filter(Boolean),
        [cartItems]
    );

    const count = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
        [cartItems]
    );

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0),
        [cartItems]
    );

    const isCarted = (productId) => cartedIds.includes(productId);

    // how many units of this product are already in the cart, so a card can
    // show "Max stock reached" before the user hits the server limit
    const getCartQuantity = (productId) => {
        const item = cartItems.find((entry) => entry.product?._id === productId);
        return item ? item.quantity : 0;
    };

    const value = {
        cartItems,
        isLoading,
        error,
        count,
        subtotal,
        cartedIds,
        isCarted,
        getCartQuantity,
        refreshCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
