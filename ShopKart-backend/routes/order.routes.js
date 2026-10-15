import express from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { createPaymentOrder, verifyPayment, getAllOrder, getOrder } from "../controllers/order.controller.js"

const Orderroutes = express.Router();
Orderroutes.post("/create-payment-order",isAuth, createPaymentOrder)
Orderroutes.post("/verify-payment",isAuth, verifyPayment)
Orderroutes.get("/", isAuth, getAllOrder)
Orderroutes.get("/:id", isAuth, getOrder)

export default Orderroutes;