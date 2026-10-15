import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
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

        const alreadySaved = customer.wishlist.some((id) => id.toString() === productId);
        if (alreadySaved) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        customer.wishlist.push(productId);
        await customer.save();

        return res.status(200).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getWishlist = async (req, res) => {
    try {
        // populate replaces each stored id with the real product document
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const toggleWishlist = async (req, res) => {
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

        const position = customer.wishlist.findIndex((id) => id.toString() === productId);

        // not saved yet, so save it now
        if (position === -1) {
            customer.wishlist.push(productId);
            await customer.save();

            return res.status(200).json({
                success: true,
                message: "Product added to wishlist",
                saved: true
            });
        }

        // already saved, so take it back out
        customer.wishlist.splice(position, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            saved: false
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);

        const position = customer.wishlist.findIndex((id) => id.toString() === productId);
        if (position === -1) {
            return res.status(404).json({ success: false, message: "Product is not in your wishlist" });
        }

        customer.wishlist.splice(position, 1);
        await customer.save();

        return res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};