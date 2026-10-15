import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import api from "../services/api";
import "./Products.css";

function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [savedIds, setSavedIds] = useState([]);

    // runs on load and again whenever search or category changes
    useEffect(() => {
        api.get("/products", { params: { search, category } })
            .then((response) => setProducts(response.data.products))
            .catch(() => {
                setProducts([]);
                setHasError(true);
            })
            .finally(() => setIsLoading(false));
    }, [search, category]);

    // only needed once, because the wishlist does not change with the filters
    useEffect(() => {
        api.get("/wishlist")
            .then((response) => setSavedIds(response.data.wishlist.map((item) => item._id)))
            .catch(() => setSavedIds([]));
    }, []);

    const handleWishlistToggle = (productId) => {
        if (savedIds.includes(productId)) {
            setSavedIds(savedIds.filter((id) => id !== productId));
        } else {
            setSavedIds([...savedIds, productId]);
        }
    };

    return (
        <div className="catalog-page">
            <Navbar />
            <main className="catalog-container">
                <header className="catalog-heading">
                    <p className="eyebrow">ShopKart collection</p>
                    <h1>Products</h1>
                </header>

                <SearchBar
                    search={search}
                    category={category}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setIsLoading(true);
                        setHasError(false);
                    }}
                    onCategoryChange={(value) => {
                        setCategory(value);
                        setIsLoading(true);
                        setHasError(false);
                    }}
                />

                {isLoading ? (
                    <p className="catalog-message">Loading products...</p>
                ) : hasError ? (
                    <p className="catalog-message catalog-error">
                        Something went wrong while loading products.
                    </p>
                ) : products.length === 0 ? (
                    <p className="catalog-message">No products found.</p>
                ) : (
                    <section className="product-grid">
                        {products.map((product) => (
                            <ProductCard
                            key={product._id}
                            product={product}
                            isWishlisted={savedIds.includes(product._id)}
                            onWishlistToggle={handleWishlistToggle}
                        />
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}

export default Products;