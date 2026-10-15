import express from "express";
import { addToWishlist, getWishlist, toggleWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
import isAuth from "../middlewares/auth.middleware.js";

const wishlistRoutes = express.Router();

wishlistRoutes.post("/:productId", isAuth, addToWishlist);
wishlistRoutes.patch("/:productId/toggle", isAuth, toggleWishlist);
wishlistRoutes.get("/", isAuth, getWishlist);
wishlistRoutes.delete("/:productId", isAuth, removeFromWishlist);

export default wishlistRoutes;