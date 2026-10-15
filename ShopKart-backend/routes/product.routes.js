import express from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { createProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller.js";

const productRoutes = express.Router();

productRoutes.post("/", createProduct);
productRoutes.get("/", getAllProducts);
productRoutes.get("/:id", getProductById);
productRoutes.patch("/:id", isAuth, updateProduct);

export default productRoutes;