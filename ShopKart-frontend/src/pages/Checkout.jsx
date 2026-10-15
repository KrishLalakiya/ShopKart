import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useCart } from "../context/useCart";
import "./Products.css";

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const emptyForm = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
};

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, isLoading, count, subtotal, clearCart } = useCart();

    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    // idle -> creating -> paying -> verifying -> error
    const [status, setStatus] = useState("idle");
    const [submitError, setSubmitError] = useState("");

    const updateField = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    // client-side validation; the backend is NOT called on an invalid form
    const validateForm = () => {
        const next = {};
        if (!form.fullName.trim()) next.fullName = "Full name is required.";
        if (!/^[0-9]{10}$/.test(form.phone.trim())) next.phone = "Phone must contain 10 digits.";
        if (!form.addressLine1.trim()) next.addressLine1 = "Address is required.";
        if (!form.city.trim()) next.city = "City is required.";
        if (!form.state.trim()) next.state = "State is required.";
        if (!/^[0-9]{6}$/.test(form.pincode.trim())) next.pincode = "Pincode must contain 6 digits.";
        return next;
    };

    const verifyPayment = async (checkout, paymentResponse) => {
        const response = await api.post("/orders/verify-payment", {
            shopKartOrderId: checkout.shopKartOrderId,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature
        });
        return response.data;
    };

    const openRazorpay = (checkout) => {
        const options = {
            key: checkout.key,
            amount: checkout.amount,
            currency: checkout.currency,
            name: "ShopKart",
            description: "ShopKart Order",
            order_id: checkout.razorpayOrderId,
            prefill: {
                name: form.fullName.trim(),
                contact: form.phone.trim()
            },
            handler: async (paymentResponse) => {
                // the browser callback proves nothing; the backend verifies the signature
                setStatus("verifying");
                setSubmitError("");

                try {
                    await verifyPayment(checkout, paymentResponse);

                    // backend already cleared the Mongo cart; sync the global state
                    clearCart();
                    navigate(`/order-success/${checkout.shopKartOrderId}`);
                } catch (err) {
                    console.error(err);
                    setStatus("error");
                    setSubmitError("Payment verification failed. Your cart has not been cleared.");
                }
            },
            theme: {}
        };

        const paymentObject = new window.Razorpay(options);

        paymentObject.on("payment.failed", () => {
            setStatus("error");
            setSubmitError("Payment failed. Your cart has not been cleared. Please try again.");
        });

        paymentObject.open();
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();

        const nextErrors = validateForm();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setStatus("creating");
        setSubmitError("");

        try {
            const response = await api.post("/orders/create-payment-order", {
                shippingAddress: {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    addressLine1: form.addressLine1.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    pincode: form.pincode.trim()
                }
            });

            const checkout = response.data;

            const loaded = await loadRazorpayScript();
            if (!loaded) {
                setStatus("error");
                setSubmitError("Unable to load the payment page. Please try again.");
                return;
            }

            setStatus("paying");
            openRazorpay(checkout);
        } catch (err) {
            console.error(err);
            setStatus("error");
            setSubmitError(err.response?.data?.message || "Unable to create your order.");
        }
    };

    const isBusy = status !== "idle";

    const inputProps = (field) => ({
        className: "form-input",
        id: field,
        name: field,
        value: form[field],
        onChange: updateField,
        disabled: isBusy
    });

    return (
        <div className="catalog-page">
            <Navbar />
            <main className="catalog-container">
                <header className="catalog-heading">
                    <p className="eyebrow">Almost there</p>
                    <h1>Checkout</h1>
                </header>

                {isLoading ? (
                    <p className="catalog-message">Loading your cart...</p>
                ) : cartItems.length === 0 ? (
                    <div className="catalog-message">
                        <p className="wishlist-empty-title">Your cart is empty 🛒</p>
                        <p className="wishlist-empty-text">
                            Add some products before checking out.
                        </p>
                        <Link className="wishlist-panel-button" to="/products">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="checkout-layout">
                        <form className="checkout-form" onSubmit={handlePlaceOrder} noValidate>
                            <h2>Shipping Details</h2>

                            <div className="form-field">
                                <label className="form-label" htmlFor="fullName">Full Name</label>
                                <input {...inputProps("fullName")} type="text" placeholder="Aarav Sharma" />
                                {errors.fullName && <p className="form-error">{errors.fullName}</p>}
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="phone">Phone</label>
                                <input {...inputProps("phone")} type="tel" placeholder="9876543210" />
                                {errors.phone && <p className="form-error">{errors.phone}</p>}
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="addressLine1">Address</label>
                                <input {...inputProps("addressLine1")} type="text" placeholder="22 MG Road" />
                                {errors.addressLine1 && <p className="form-error">{errors.addressLine1}</p>}
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="city">City</label>
                                <input {...inputProps("city")} type="text" placeholder="Bengaluru" />
                                {errors.city && <p className="form-error">{errors.city}</p>}
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="state">State</label>
                                <input {...inputProps("state")} type="text" placeholder="Karnataka" />
                                {errors.state && <p className="form-error">{errors.state}</p>}
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="pincode">Pincode</label>
                                <input {...inputProps("pincode")} type="text" placeholder="560001" />
                                {errors.pincode && <p className="form-error">{errors.pincode}</p>}
                            </div>

                            {submitError && <p className="form-error form-error-banner">{submitError}</p>}

                            <button className="primary-button" type="submit" disabled={isBusy}>
                                {status === "creating"
                                    ? "Creating your order..."
                                    : status === "paying"
                                        ? "Waiting for payment..."
                                        : status === "verifying"
                                            ? "Verifying payment..."
                                            : "Place Order"}
                            </button>
                        </form>

                        <aside className="cart-summary">
                            <h3>Order Summary</h3>
                            {cartItems.map((item) => (
                                <p key={item.product._id}>
                                    {item.product.name} × {item.quantity}
                                    <br />
                                    ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                                </p>
                            ))}
                            <p>
                                Items: {count} · Total: ₹{subtotal.toLocaleString("en-IN")}
                            </p>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Checkout;