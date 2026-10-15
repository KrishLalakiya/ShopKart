import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useCart } from "../context/useCart";
import "./Products.css";

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [cartStatus, setCartStatus] = useState("idle");
    const [cartError, setCartError] = useState("");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistStatus, setWishlistStatus] = useState("idle");
    const [wishlistError, setWishlistError] = useState("");
    const { addItem, isCarted, getCartQuantity } = useCart();

    // id comes from the url, so this refetches on every new product
    useEffect(() => {
        api.get(`/products/${id}`)
            .then((response) => setProduct(response.data.product))
            .catch(() => setHasError(true))
            .finally(() => setIsLoading(false));
    }, [id]);

    // is this specific product already saved? the endpoint returns the
    // whole list, so we just look for our own id inside it
    useEffect(() => {
        api.get("/wishlist")
            .then((response) => {
                setIsWishlisted(response.data.wishlist.some((item) => item._id === id));
            })
            .catch(() => setIsWishlisted(false));
    }, [id]);

    const handleWishlist = async () => {
        setWishlistStatus("saving");
        setWishlistError("");

        try {
            if (isWishlisted) {
                await api.delete(`/wishlist/${id}`);
                setIsWishlisted(false);
            } else {
                await api.post(`/wishlist/${id}`);
                setIsWishlisted(true);
            }
            setWishlistStatus("idle");
        } catch (err) {
            console.error(err);
            setWishlistStatus("error");
            setWishlistError("Unable to save product. Please try again.");
        }
    };

    const handleAddToCart = async () => {
        setCartStatus("saving");
        setCartError("");

        try {
            await addItem(id);
            setCartStatus("idle");
        } catch (err) {
            console.error(err);
            setCartStatus("error");
            // show the real reason from the backend, e.g. "Not enough stock"
            setCartError(err.response?.data?.message || "Unable to add to cart. Please try again.");
        }
    };

    const inCart = isCarted(id);
    const isSoldOut = product ? product.stock < 1 : false;
    // the cart may already hold every available unit
    const isMaxedOut = product ? product.stock > 0 && getCartQuantity(id) >= product.stock : false;

    return (
        <div className="catalog-page">
            <Navbar />
            <main className="catalog-container">
                {isLoading ? (
                    <p className="catalog-message">Loading product...</p>
                ) : hasError ? (
                    <p className="catalog-message catalog-error">
                        Something went wrong while loading this product.{" "}
                        <Link to="/products">Back to products</Link>
                    </p>
                ) : (
                    <article className="product-detail">
                        <img className="product-detail-image" src={product.image} alt={product.name} />

                        <div className="product-detail-copy">
                            <p className="eyebrow">{product.category}</p>
                            <h1>{product.name}</h1>
                            <p className="product-detail-price">
                                {"₹"}{product.price.toLocaleString("en-IN")}
                            </p>
                            <p className="product-description">{product.description}</p>
                            <p className="product-stock">
                                {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                            </p>
                            <button
                                className="add-to-cart-button"
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isSoldOut || isMaxedOut || cartStatus === "saving"}
                            >
                                {isSoldOut
                                    ? "Out of stock"
                                    : cartStatus === "saving"
                                        ? "Adding..."
                                        : isMaxedOut
                                            ? "Max stock reached"
                                            : inCart
                                                ? "Add Another"
                                                : "Add to Cart"}
                            </button>

                            {cartStatus === "error" && (
                                <p className="wishlist-error">{cartError}</p>
                            )}

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

                            {wishlistStatus === "error" && (
                                <p className="wishlist-error">{wishlistError}</p>
                            )}

                            <Link className="back-to-products" to="/products">
                                Back to products
                            </Link>
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
}

export default ProductDetails;