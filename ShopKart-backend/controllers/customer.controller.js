import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

// Dynamic cookie options supporting cross-origin cookies in production (Vercel <-> Render)
const getCookieOptions = (req) => {
    const isProduction =
        process.env.NODE_ENV === "production" ||
        Boolean(process.env.CLIENT_URL && !process.env.CLIENT_URL.includes("localhost")) ||
        req?.secure ||
        req?.headers?.["x-forwarded-proto"] === "https";

    return {
        httpOnly: true,
        secure: Boolean(isProduction),
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000
    };
};

export const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        const cleanEmail = email?.trim().toLowerCase();

        if (!fullName || !cleanEmail || !password || !phone) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const emailExists = await Customer.findOne({ email: cleanEmail });
        if (emailExists) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            fullName: fullName,
            email: cleanEmail,
            password: hashedPassword,
            phone: phone
        });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                createdAt: customer.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const customer = await Customer.findOne({ email: email.trim().toLowerCase() });

        if (!customer) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, customer.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(customer._id);
        res.cookie("token", token, getCookieOptions(req));

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getProfile = async (req, res) => {
    return res.status(200).json(req.user);
};

export const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie("token", getCookieOptions(req));

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Bonus task
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const customer = await Customer.findById(req.user._id);

        const isPasswordCorrect = await bcrypt.compare(currentPassword, customer.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        customer.password = await bcrypt.hash(newPassword, 10);
        await customer.save();

        // logging out the old session so the new password is used from scratch
        res.clearCookie("token", getCookieOptions(req));

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please log in again."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};