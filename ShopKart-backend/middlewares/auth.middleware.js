import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = req.cookies?.token || bearerToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "Login required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const customer = await Customer.findById(decoded.id).select("-password");

        if (!customer) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        req.user = customer;

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default isAuth;