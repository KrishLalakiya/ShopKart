import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Products.css";

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

function OrderDetails() {
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
                    <p className="catalog-message">Loading order...</p>
                ) : hasError || !order ? (
                    <div className="catalog-message">
                        <p>We could not find this order.</p>
                        <Link className="wishlist-panel-button" to="/orders">
                            Back to My Orders
                        </Link>
                    </div>
                ) : (
                    <div className="order-detail">
                        <header className="catalog-heading">
                            <p className="eyebrow">Order details</p>
                            <h1>Order #{order._id}</h1>
                            <p className="order-date">
                                Placed on {formatDate(order.createdAt)} ·{" "}
                                <span className="status-badge">{order.status}</span>
                            </p>
                        </header>

                        <div className="checkout-layout">
                            <section className="order-detail-items">
                                {order.items.map((item) => (
                                    <div className="order-detail-line" key={item._id}>
                                        <p className="order-detail-name">
                                            {item.name} × {item.quantity}
                                        </p>
                                        <p className="order-detail-price">
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                ))}
                                <div className="order-detail-line order-detail-total">
                                    <p>Total</p>
                                    <p>₹{order.totalAmount.toLocaleString("en-IN")}</p>
                                </div>
                            </section>

                            <aside className="cart-summary">
                                <h3>Shipping Address</h3>
                                <p>{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.phone}</p>
                                <p>
                                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state} — {order.shippingAddress.pincode}
                                </p>
                            </aside>
                        </div>

                        <Link className="continue-shopping" to="/orders">
                            Back to My Orders
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default OrderDetails;