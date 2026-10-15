import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: ""
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Runs on every change, so a message disappears as soon as the field is fixed.
    const validate = (values) => {
        const found = {};

        if (!values.fullName.trim()) found.fullName = "Full name is required";

        if (!values.email.trim()) found.email = "Email is required";
        else if (!values.email.includes("@")) found.email = "Enter a valid email address";

        if (!values.password) found.password = "Password is required";
        else if (values.password.length < 6) found.password = "Password must be at least 6 characters";

        if (!values.phone.trim()) found.phone = "Phone number is required";
        else if (values.phone.trim().length < 10) found.phone = "Enter a valid phone number";

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

        // do not call the API if anything is invalid
        if (Object.keys(found).length > 0) return;

        setServerError("");
        setIsSubmitting(true);

        try {
            await api.post("/customers/register", formData);

            navigate("/login", {
                replace: true,
                state: { message: "Account created successfully. Please log in." }
            });
        } catch (error) {
            const status = error.response?.status;
            const message = error.response?.data?.message || "Something went wrong";

            // 409 means the email is already taken, so show it on that field
            if (status === 409) {
                setErrors({ email: message });
            } else {
                setServerError(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="A better way to browse"
            title="Good things"
            highlight="find you here."
            description="Save your favourites, follow your orders, and make every checkout feel effortless."
        >
            <p className="eyebrow">Join the community</p>
            <h2>Create your account</h2>
            <p className="form-intro">Start a more personal shopping experience.</p>

            {serverError && <p className="error-text">{serverError}</p>}

            <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="fullName">Full name</label>
                <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className={errors.fullName ? "field-invalid" : ""}
                />
                {errors.fullName && <p className="field-error">{errors.fullName}</p>}

                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={errors.email ? "field-invalid" : ""}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}

                <label htmlFor="password">Password</label>
                <div className="password-field">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        className={errors.password ? "field-invalid" : ""}
                    />
                    <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}

                <label htmlFor="phone">Phone number</label>
                <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    autoComplete="tel"
                    className={errors.phone ? "field-invalid" : ""}
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}

                <button className="primary-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create account"}
                    <span aria-hidden="true">➜ </span>
                </button>
            </form>

            <p className="switch-link">
                Already have an account? <Link to="/login">Log in</Link>
            </p>
        </AuthLayout>
    );
}

export default Register;