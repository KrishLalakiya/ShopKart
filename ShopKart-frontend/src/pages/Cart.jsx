import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/useCart";
import "./Products.css";

function Cart() {
    const { cartItems, isLoading, error, count, subtotal, refreshCart, removeItem, updateQuantity } = useCart();

    // per-action lock, so only the row being edited shows as busy
    const [updatingId, setUpdatingId] = useState("");
    // a failed mutation must not wipe the whole page out
    const [actionError, setActionError] = useState("");

    const runAction = async (productId, action) => {
        setUpdatingId(productId);
        setActionError("");

        try {
            await action();
        } catch (err) {
            console.error(err);
            setActionError("That change could not be saved. Please try again.");
        } finally {
            setUpdatingId("");
        }
    };

    const handleRemove = (productId) => runAction(productId, () => removeItem(productId));

    const handleIncrease = (item) => {
        if (item.quantity >= item.product.stock) return;
        return runAction(item.product._id, () => updateQuantity(item.product._id, item.quantity + 1));
    };

    const handleDecrease = (item) => {
        // spec: quantity 1 is removed with the explicit Remove action
        if (item.quantity <= 1) return;
        return runAction(item.product._id, () => updateQuantity(item.product._id, item.quantity - 1));
    };

    return (
        <div className="catalog-page">
            <Navbar />
            <main className="catalog-container">
                <header className="catalog-heading">
                    <p className="eyebrow">Your cart</p>
                    <h1>My Cart</h1>
                    <p className="wishlist-count">
                        {count} {count === 1 ? "item" : "items"} in cart
                    </p>
                </header>

                {isLoading ? (
                    <p className="catalog-message">Loading your cart...</p>
                ) : error ? (
                    <div className="catalog-message">
                        <p>{error}</p>
                        <button
                            className="wishlist-panel-button"
                            type="button"
                            onClick={refreshCart}
                        >
                            Try Again
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="catalog-message">
                        <p className="wishlist-empty-title">Your cart is empty 🛒</p>
                        <p className="wishlist-empty-text">Looks like you haven't added anything yet.</p>
                        <Link className="wishlist-panel-button" to="/products">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <>
                        {actionError && (
                            <p className="wishlist-error cart-action-error">{actionError}</p>
                        )}

                        <div className="cart-layout">
                            <section className="product-grid cart-grid">
                                {cartItems.map((item) => (
                                    <CartItem
                                        key={item.product._id}
                                        item={item}
                                        onIncrease={handleIncrease}
                                        onDecrease={handleDecrease}
                                        onRemove={handleRemove}
                                        isUpdating={updatingId === item.product._id}
                                    />
                                ))}
                            </section>

                            <aside className="cart-summary">
                                <h3>Order Summary</h3>
                                <p>Items: {count}</p>
                                <p>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>
                                <Link className="primary-button" to="/checkout">
                                    Proceed to Checkout
                                </Link>
                            </aside>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Cart;
