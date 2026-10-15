import express from "express";
import {
    registerCustomer,
    loginCustomer,
    getProfile,
    logoutCustomer,
    changePassword
} from "../controllers/customer.controller.js";
import isAuth from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

customerRoutes.post("/register", registerCustomer);
customerRoutes.post("/login", loginCustomer);
customerRoutes.get("/me", isAuth, getProfile);
customerRoutes.post("/logout", isAuth, logoutCustomer);
customerRoutes.patch("/change-password", isAuth, changePassword);

export default customerRoutes;