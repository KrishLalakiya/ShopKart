import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import api from "../services/api";
import "./Products.css";

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [removingId, setRemovingId] = useState("");
    // bumping this number makes the effect run again, which is how Try Again works
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
        api.get("/wishlist")
            .then((response) => setWishlist(response.data.wishlist))
            .catch(() => setHasError(true))
            .finally(() => setIsLoading(false));
    }, [reloadCount]);

    const handleRemove = (productId) => {
        setRemovingId(productId);

        api.delete(`/wishlist/${productId}`)
            .then(() => setWishlist(wishlist.filter((item) => item._id !== productId)))
            .catch(() => setHasError(true))
            .finally(() => setRemovingId(""));
    };

    return (
        <div className="catalog-page">
            <Navbar />
            <main className="catalog-container">
                <header className="catalog-heading">
                    <p className="eyebrow">Saved for later</p>
                    <h1>My Wishlist</h1>
                    <p className="wishlist-count">{wishlist.length} products saved</p>
                </header>

                {isLoading ? (
                    <p className="catalog-message">Loading your wishlist...</p>
                ) : hasError ? (
                    <div className="catalog-message">
                        <p>Unable to load wishlist.</p>
                        <button
                            className="wishlist-panel-button"
                            type="button"
                            onClick={() => {
                                setHasError(false);
                                setIsLoading(true);
                                setReloadCount(reloadCount + 1);
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="catalog-message">
                        <p className="wishlist-empty-title">Your wishlist is empty ❤️</p>
                        <p className="wishlist-empty-text">Start saving products you love.</p>
                        <Link className="wishlist-panel-button" to="/products">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <section className="product-grid">
                        {wishlist.map((product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemove}
                                isRemoving={removingId === product._id}
                            />
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}

export default Wishlist;