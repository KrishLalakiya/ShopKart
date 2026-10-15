import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Products.css";

function Admin() {
    const [products, setProducts] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [savingId, setSavingId] = useState("");
    const [savedId, setSavedId] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // used by the retry button; the first load runs inline in the effect below
    const loadProducts = () => {
        setIsLoading(true);
        api.get("/products")
            .then((response) => {
                setProducts(response.data.products);
                setError("");
            })
            .catch(() => setError("Unable to load products."))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        api.get("/products")
            .then((response) => {
                setProducts(response.data.products);
                setError("");
            })
            .catch(() => setError("Unable to load products."))
            .finally(() => setIsLoading(false));
    }, []);

    const handleChange = (productId, field, value) => {
        setDrafts({ ...drafts, [productId]: { ...drafts[productId], [field]: value } });
    };

    const handleSave = async (product) => {
        const draft = drafts[product._id] || {};
        const payload = {};

        // only send what actually changed
        if (draft.price !== undefined && draft.price !== "") {
            payload.price = Number(draft.price);
        }
        if (draft.stock !== undefined && draft.stock !== "") {
            payload.stock = Number(draft.stock);
        }

        if (Object.keys(payload).length === 0) {
            setError("Change the price or stock before saving.");
            return;
        }
        if (payload.price !== undefined && (Number.isNaN(payload.price) || payload.price < 0)) {
            setError("Price must be a valid number.");
            return;
        }
        if (payload.stock !== undefined && (!Number.isInteger(payload.stock) || payload.stock < 0)) {
            setError("Stock must be a whole number of 0 or more.");
            return;
        }

        setSavingId(product._id);
        setError("");

        try {
            const response = await api.patch(`/products/${product._id}`, payload);
            setProducts((current) =>
                current.map((item) => (item._id === product._id ? response.data.product : item))
            );
            setDrafts({ ...drafts, [product._id]: {} });
            setSavedId(product._id);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Unable to update this product.");
        } finally {
            setSavingId("");
        }
    };

    return (
        <div className="catalog-page">
            <Navbar />
            <main className="catalog-container">
                <header className="catalog-heading">
                    <p className="eyebrow">Internal tool</p>
                    <h1>Product Admin</h1>
                    <p className="wishlist-count">Edit price and stock for any product.</p>
                </header>

                {error && (
                    <div className="admin-error">
                        <p className="wishlist-error cart-action-error">{error}</p>
                        <button className="admin-save" type="button" onClick={loadProducts}>
                            Refresh
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <p className="catalog-message">Loading products...</p>
                ) : (
                    <div className="admin-list">
                        {products.map((product) => {
                            const draft = drafts[product._id] || {};
                            const priceValue = draft.price ?? product.price;
                            const stockValue = draft.stock ?? product.stock;
                            const isSaving = savingId === product._id;

                            return (
                                <article className="admin-row" key={product._id}>
                                    <img className="admin-thumb" src={product.image} alt={product.name} />

                                    <div className="admin-info">
                                        <h3>{product.name}</h3>
                                        <p>{product.category}</p>
                                    </div>

                                    <div className="admin-field">
                                        <label htmlFor={`price-${product._id}`}>Price</label>
                                        <input
                                            id={`price-${product._id}`}
                                            type="number"
                                            min="0"
                                            value={priceValue}
                                            onChange={(e) => handleChange(product._id, "price", e.target.value)}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="admin-field">
                                        <label htmlFor={`stock-${product._id}`}>Stock</label>
                                        <input
                                            id={`stock-${product._id}`}
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={stockValue}
                                            onChange={(e) => handleChange(product._id, "stock", e.target.value)}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <button
                                        className="admin-save"
                                        type="button"
                                        onClick={() => handleSave(product)}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? "Saving..." : savedId === product._id ? "Saved" : "Save"}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Admin;