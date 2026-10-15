import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 8082;

// comma separated list of allowed frontend origins (see .env.example)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
    process.exit(1);
}

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true
    })
);

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes)
app.use("/orders", orderRoutes)

app.use(errorMiddleware);

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("DB Connected");
})
    .catch((err) => {
        console.error("DB connection failed:", err.message);
        process.exit(1);
    });

app.listen(port, () => {
    console.log(`Server Started at ${port}`);
});