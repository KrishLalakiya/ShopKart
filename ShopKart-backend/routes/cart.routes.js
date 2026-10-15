import express from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { addtoCart, getCart, updateCart, removeFromCart } from "../controllers/cart.controller.js"

const cartRoutes = express.Router();

cartRoutes.post("/:productId", isAuth, addtoCart);
cartRoutes.get("/", isAuth, getCart)
cartRoutes.patch("/:productId", isAuth, updateCart);
cartRoutes.delete("/:productId", isAuth, removeFromCart);

export default cartRoutes;