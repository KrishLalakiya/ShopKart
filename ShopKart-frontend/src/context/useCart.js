import { createContext, useContext } from "react";

// Kept out of CartContext.jsx on purpose: a file that exports both a
// component and a hook breaks react-refresh's fast reload.
export const CartContext = createContext(null);

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside a CartProvider");
    }
    return context;
}
