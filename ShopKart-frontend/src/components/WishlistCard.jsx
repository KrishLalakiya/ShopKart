import { Link } from "react-router-dom";

function WishlistCard({ product, onRemove, isRemoving }) {
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
                    className="wishlist-button wishlist-remove-button"
                    type="button"
                    onClick={() => onRemove(product._id)}
                    disabled={isRemoving}
                >
                    {isRemoving ? "Removing..." : "♥ Remove from Wishlist"}
                </button>
            </div>
        </article>
    );
}

export default WishlistCard;