import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Products.css";

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

function OrderCard({ order }) {
    return (
        <article className="order-card">
            <header className="order-card-head">
                <div>
                    <h3>Order #{order._id}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <span className="status-badge">{order.status}</span>
            </header>

            <ul className="order-card-items">
                {order.items.map((item) => (
                    <li key={item._id}>
                        {item.name} × {item.quantity}
                    </li>
                ))}
            </ul>

            <footer className="order-card-foot">
                <p>
                    Total: <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                </p>
                <Link className="order-details-link" to={`/orders/${order._id}`}>
                    View Details
                </Link>
            </footer>
        </article>
    );
}

function Orders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const loadOrders = () => {
        api.get("/orders")
            .then((response) => setOrders(response.data.orders))
            .catch(() => setHasError(true))
            .finally(() => setIsLoading(false));
    };

    useEffect(loadOrders, []);

    return (
        <div className="catalog-page">
            <Navbar />
            <main className="catalog-container">
                <header className="catalog-heading">
                    <p className="eyebrow">Your purchase history</p>
                    <h1>My Orders</h1>
                </header>

                {isLoading ? (
                    <p className="catalog-message">Loading your orders...</p>
                ) : hasError ? (
                    <div className="catalog-message">
                        <p>Something went wrong while loading your orders.</p>
                        <button className="wishlist-panel-button" type="button" onClick={loadOrders}>
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="catalog-message">
                        <p className="wishlist-empty-title">You have not placed any orders yet.</p>
                        <Link className="wishlist-panel-button" to="/products">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Orders;