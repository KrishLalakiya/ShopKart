import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Products.css";

function OrderSuccess() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        api.get(`/orders/${id}`)
            .then((response) => setOrder(response.data.order))
            .catch(() => setHasError(true))
            .finally(() => setIsLoading(false));
    }, [id]);

    return (
        <div className="catalog-page">
            <Navbar />
            <main className="catalog-container">
                {isLoading ? (
                    <p className="catalog-message">Loading your order...</p>
                ) : hasError || !order ? (
                    <div className="catalog-message">
                        <p>We could not find this order.</p>
                        <Link className="wishlist-panel-button" to="/orders">
                            View My Orders
                        </Link>
                    </div>
                ) : (
                    <div className="order-success">
                        <p className="success-check">✅</p>
                        <h1>Order Placed Successfully</h1>
                        <p className="order-success-line">
                            <span>Order ID:</span> {order._id}
                        </p>
                        <p className="order-success-line">
                            <span>Total:</span> ₹{order.totalAmount.toLocaleString("en-IN")}
                        </p>
                        <p className="order-success-line">
                            <span>Status:</span> <span className="status-badge">{order.status}</span>
                        </p>
                        <p className="order-success-note">
                            Your order has been saved successfully. Your cart is now empty.
                        </p>
                        <div className="order-success-actions">
                            <Link className="wishlist-panel-button" to="/orders">
                                View My Orders
                            </Link>
                            <Link className="continue-shopping" to="/products">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default OrderSuccess;