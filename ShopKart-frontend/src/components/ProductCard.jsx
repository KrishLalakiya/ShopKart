import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/useCart";

function ProductCard({ product, isWishlisted, onWishlistToggle }) {
    const [wishlistStatus, setWishlistStatus] = useState("idle");
    const [cartlistStatus, setCartlistStatus] = useState("idle");
    const [cartError, setCartError] = useState("");
    const { addItem, isCarted, getCartQuantity } = useCart();

    const isCartlisted = isCarted(product._id);
    // the cart may already hold every available unit
    const inCartQuantity = getCartQuantity(product._id);
    const isMaxedOut = product.stock > 0 && inCartQuantity >= product.stock;

    const handleWishlist = async () => {
        setWishlistStatus("saving");

        try {
            if (isWishlisted) {
                await api.delete(`/wishlist/${product._id}`);
            } else {
                await api.post(`/wishlist/${product._id}`);
            } onWishlistToggle?.(product._id);
            setWishlistStatus("idle");
        } catch (error) {
            console.log(error);
            setWishlistStatus("error");
        }

    };
    const handleCartlist = async () => {
        if (product.stock < 1 || isMaxedOut) return;

        setCartlistStatus("saving");
        setCartError("");

        try {
            // the context owns the cart, so this one call updates the
            // button label, the Navbar count and the Cart page together
            await addItem(product._id);
            setCartlistStatus("idle");
        } catch (error) {
            console.log(error);
            setCartlistStatus("error");
            // the backend already explains the real reason (not enough stock)
            setCartError(error.response?.data?.message || "Unable to add to cart. Please try again.");
        }
    };

    return (
        <article className="product-card">
            <Link to={`/products/${product._id}`}>
                <img className="product-image" src={product.image} alt={product.name} />
            </Link>

            <div className="product-card-content">
                <p className="product-category">{product.category}</p>
                <h2>{product.name}</h2>
                <p className="product-price">{"₹"}{product.price.toLocaleString("en-IN")}</p>
                <p className="product-stock">
                    {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                </p>

                <Link className="product-details-link" to={`/products/${product._id}`}>
                    View Details
                </Link>

                <button
                    className="wishlist-button"
                    type="button"
                    onClick={handleWishlist}
                    disabled={wishlistStatus === "saving"}
                >
                    {wishlistStatus === "saving"
                        ? "Saving..."
                        : isWishlisted
                            ? "♥ Remove from Wishlist"
                            : "♡ Add to Wishlist"}
                </button>
                <button
                    className="addtocart-button"
                    type="button"
                    onClick={handleCartlist}
                    disabled={product.stock < 1 || isMaxedOut || cartlistStatus === "saving"}
                >
                    {product.stock < 1
                        ? "Out of stock"
                        : cartlistStatus === "saving"
                            ? "Adding..."
                            : isMaxedOut
                                ? "Max stock reached"
                                : isCartlisted
                                    ? "Add Another"
                                    : "Add to Cart"}
                </button>

                {wishlistStatus === "error" && (
                    <p className="wishlist-error">Unable to save product. Please try again.</p>
                )}
                {cartlistStatus === "error" && (
                    <p className="wishlist-error">{cartError}</p>
                )}
            </div>
        </article>
    );
}

export default ProductCard;