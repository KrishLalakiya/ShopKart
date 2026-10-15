import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        return res.status(201).json({ success: true, product });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};

        if (search) {
            // escape characters like ( ) . * so a normal search word
            // is never treated as a regular expression
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.name = { $regex: safeSearch, $options: "i" };
        }

        if (category) {
            filter.category = category;
        }

        const products = await Product.find(filter).select("name price category image stock");

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const { price, stock } = req.body;

        // only allow the fields the admin page edits
        const updates = {};
        if (price !== undefined) {
            if (typeof price !== "number" || price < 0) {
                return res.status(400).json({ success: false, message: "Price must be a valid number" });
            }
            updates.price = Math.round(price);
        }
        if (stock !== undefined) {
            if (!Number.isInteger(stock) || stock < 0) {
                return res.status(400).json({ success: false, message: "Stock must be a non-negative integer" });
            }
            updates.stock = stock;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "Nothing to update" });
        }

        const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, message: "Product updated", product });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};