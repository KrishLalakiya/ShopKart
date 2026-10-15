import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // message passed over from the Register page after a successful signup
    const successMessage = location.state?.message;

    const validate = (values) => {
        const found = {};

        if (!values.email.trim()) found.email = "Email is required";
        else if (!values.email.includes("@")) found.email = "Enter a valid email address";

        if (!values.password) found.password = "Password is required";

        return found;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };

        setFormData(updated);
        setErrors(validate(updated));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const found = validate(formData);
        setErrors(found);

        if (Object.keys(found).length > 0) return;

        setServerError("");
        setIsSubmitting(true);

        try {
            const res = await api.post("/customers/login", formData);
            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
            }

            navigate("/home", { replace: true });
        } catch (error) {
            setServerError(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="Your world, well chosen"
            title="Find your"
            highlight="next favourite."
            description="Discover pieces that fit your life, with a little more joy in every detail."
        >
            <p className="eyebrow">Welcome back</p>
            <h2>Log in to ShopKart</h2>
            <p className="form-intro">Pick up right where you left off.</p>

            {successMessage && <p className="success-text">{successMessage}</p>}
            {serverError && <p className="error-text">{serverError}</p>}

            <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="login-email">Email address</label>
                <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={errors.email ? "field-invalid" : ""}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}

                <label htmlFor="login-password">Password</label>
                <div className="password-field">
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className={errors.password ? "field-invalid" : ""}
                    />
                    <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}

                <button className="primary-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Log in"}
                    <span aria-hidden="true">➜</span>
                </button>
            </form>

            <p className="switch-link">
                New to ShopKart? <Link to="/register">Create an account</Link>
            </p>
        </AuthLayout>
    );
}

export default Login;