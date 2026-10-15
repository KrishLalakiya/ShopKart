import mongoose from "mongoose";
import crypto from "crypto";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import getRazorpay, { isRazorpayConfigured } from "../config/razorpay.js";

const validateShippingAddress = (address) => {
    if (!address || typeof address !== "object") {
        return "Shipping address is required";
    }

    const { fullName, phone, addressLine1, city, state, pincode } = address;
    const required = { fullName, phone, addressLine1, city, state, pincode };

    for (const [key, value] of Object.entries(required)) {
        if (typeof value !== "string" || value.trim() === "") {
            return `${key} cannot be empty`;
        }
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
        return "Phone must contain 10 digits";
    }

    if (!/^[0-9]{6}$/.test(pincode.trim())) {
        return "Pincode must contain 6 digits";
    }

    return null;
};

export const createPaymentOrder = async (req, res) => {
    try {
        const shippingError = validateShippingAddress(req.body.shippingAddress);
        if (shippingError) {
            return res.status(400).json({ success: false, message: shippingError });
        }

        const customer = await Customer.findById(req.user._id);
        if (customer.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        // re-read the latest products: stock may have changed since add-to-cart
        const items = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = await Product.findById(cartItem.product);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available"
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });

            totalAmount += product.price * cartItem.quantity;
        }

        if (!isRazorpayConfigured()) {
            return res.status(500).json({
                success: false,
                message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend .env file."
            });
        }

        const order = new Order({
            user: req.user._id,
            items,
            shippingAddress: req.body.shippingAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });
        await order.save();

        // Razorpay expects the amount in the smallest currency unit (paise)
        const razorpayOrder = await getRazorpay().orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString()
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!isRazorpayConfigured()) {
            return res.status(500).json({
                success: false,
                message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend .env file."
            });
        }

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing payment details" });
        }

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        // the order must belong to the logged-in user
        const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
        if (!order || !order.razorpayOrderId) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // use the razorpay order id stored in our database as the trusted value
        if (razorpay_order_id !== order.razorpayOrderId) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // stock is only consumed once the payment is verified; the
        // stock filter stops the counter going below zero
        for (const item of order.items) {
            await Product.updateOne(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
        }

        // only a verified payment clears the cart
        const customer = await Customer.findById(req.user._id);
        customer.cart = [];
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified, order placed",
            order
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        // ownership check: users can never read another user's order
        const order = await Order.findOne({ _id: id, user: req.user._id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};