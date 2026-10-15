import { Link } from "react-router-dom";

function CartItem({ item, onIncrease, onDecrease, onRemove, isUpdating }) {
    const product = item.product;
    const lineTotal = product.price * item.quantity;

    return (
        <article className="product-card">
            <Link to={`/products/${product._id}`}>
                <img className="product-image" src={product.image} alt={product.name} />
            </Link>

            <div className="product-card-content">
                <p className="product-category">{product.category}</p>
                <h2>{product.name}</h2>
                <p className="product-price">{"₹"}{product.price.toLocaleString("en-IN")}</p>

                <div className="quantity-row">
                    <button
                        type="button"
                        className="quantity-button"
                        onClick={() => onDecrease(item)}
                        disabled={isUpdating || item.quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        -
                    </button>

                    <span className="quantity-value">{item.quantity}</span>

                    <button
                        type="button"
                        className="quantity-button"
                        onClick={() => onIncrease(item)}
                        disabled={isUpdating || item.quantity >= product.stock}
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>

                <p className="product-stock">
                    {item.quantity >= product.stock
                        ? "Max stock reached"
                        : `${product.stock} available`}
                </p>

                <p className="product-subtotal">
                    Subtotal: {"₹"}{lineTotal.toLocaleString("en-IN")}
                </p>

                <button
                    type="button"
                    className="wishlist-button wishlist-remove-button"
                    onClick={() => onRemove(product._id)}
                    disabled={isUpdating}
                >
                    {isUpdating ? "Updating..." : "Remove"}
                </button>
            </div>
        </article>
    );
}

export default CartItem;