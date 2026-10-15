import { Link } from "react-router-dom";
import "../pages/Auth.css";

// The left hand design panel is identical on Login and Register,
// so it is written once here instead of being copied into both pages.
function AuthLayout({ eyebrow, title, highlight, description, children }) {
    return (
        <main className="auth-shell">
            <section className="auth-visual" aria-label="ShopKart highlights">
                <Link className="brand" to="/home">
                    <span className="brand-mark">S</span> ShopKart
                </Link>
                <div className="visual-copy">
                    <p className="eyebrow">{eyebrow}</p>
                    <h1>
                        {title}
                        <br />
                        <em>{highlight}</em>
                    </h1>
                    <p>{description}</p>
                </div>
                <div className="visual-note">
                    <span></span>
                    <span></span>
                </div>
            </section>

            <section className="auth-panel">
                <div className="auth-form-wrap">
                    <div className="mobile-brand">
                        <span className="brand-mark">S</span> shopkart
                    </div>
                    {children}
                </div>
            </section>
        </main>
    );
}

export default AuthLayout;