import Razorpay from "razorpay";

export const isRazorpayConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let instance = null;

// lazily created so the server still boots without keys in .env
const getRazorpay = () => {
    if (!instance) {
        instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return instance;
};

export default getRazorpay;