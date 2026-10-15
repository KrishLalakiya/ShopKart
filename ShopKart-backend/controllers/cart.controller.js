import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addtoCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const customer = await Customer.findById(req.user._id);

        const alreadySaved = customer.cart.some((item) => item.product.toString() === productId);
        if (alreadySaved) {
            const item = customer.cart.find((item) => item.product.toString() === productId);
            if (item.quantity + 1 > product.stock) {
                return res.status(400).json({ success: false, message: "Not enough stock" });
            }

            item.quantity += 1;
            await customer.save();
            await customer.populate({
                path: "cart.product",
                select: "name price category image stock"
            });
            return res.status(200).json({
                success: true,
                message: "Product quantity increased in cart",
                count: customer.cart.length,
                cart: customer.cart
            });
        } else {
            if (product.stock < 1) {
                return res.status(400).json({ success: false, message: "Product is out of stock" });
            }

            customer.cart.push({ product: productId, quantity: 1 })
            await customer.save();
            await customer.populate({
                path: "cart.product",
                select: "name price category image stock"
            });
            return res.status(200).json({
                success: true,
                message: "Product added to Cart",
                count: customer.cart.length,
                cart: customer.cart
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            count: customer.cart.length,
            cart: customer.cart
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const updateCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const updquant = req.body.quantity;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        if (!Number.isInteger(updquant)) {
            return res.status(400).json({ success: false, message: "Quantity is not Integer" })
        }
        if (updquant < 1) {
            return res.status(400).json({ success: false, message: "Quantity cannot be less than 1" })

        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);

        const inCart = customer.cart.some((item) => item.product.toString() === productId);
        if (!inCart) {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }
        const item = customer.cart.find((item) => item.product.toString() === productId);
        if (updquant > product.stock) {
            return res.status(400).json({ success: false, message: "Not enough stock" });
        }
        item.quantity = updquant;
        await customer.save();
        await customer.populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Product quantity is updated Cart",
            count: customer.cart.length,
            cart: customer.cart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const customer = await Customer.findById(req.user._id);
        const position = await customer.cart.findIndex((item) => item.product.toString() === productId);
        if (position === -1) {
            return res.status(404).json({ success: false, message: "Product is not in your cart" });
        }

        customer.cart.splice(position, 1);
        await customer.save();
        await customer.populate({
            path: "cart.product",
            select: "name price category image stock"
        });

return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            count: customer.cart.length,
            cart: customer.cart
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}