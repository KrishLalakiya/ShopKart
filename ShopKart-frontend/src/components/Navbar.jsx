import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/useCart";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);
    const { count: cartCount } = useCart();

    // the count comes from the backend, never a hardcoded number
    useEffect(() => {
        api.get("/wishlist")
            .then((response) => setWishlistCount(response.data?.count ?? 0))
            .catch(() => setWishlistCount(0));
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await api.post("/customers/logout");
        } catch (error) {
            // even if the API call fails, send the user back to login
            console.error(error);
        } finally {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
        }
    };

    return (
        <nav className="navbar">
            <Link className="brand" to="/home">
                <span className="brand-mark">S</span> shopkart
            </Link>

            <div className="navbar-actions">
                <Link className="navbar-link" to="/home">
                    Home
                </Link>
                <Link className="navbar-link" to="/products">
                    Products
                </Link>
                <Link className="navbar-link" to="/wishlist">
                    Wishlist{wishlistCount > 0 && ` (${wishlistCount})`}
                </Link>
                <Link className="navbar-link" to="/cart">
                    Cart{cartCount > 0 && ` (${cartCount})`}
                </Link>
                <Link className="navbar-link" to="/orders">
                    My Orders
                </Link>
                <button className="navbar-logout" onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;