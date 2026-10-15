import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/customers/me")
            .then((response) => setUser(response.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p className="loading-text">Loading your account...</p>;
    }

    // no user means the cookie is missing or expired, so send them to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const firstName = user.fullName.split(" ")[0];

    return (
        <div className="home-page">
            <Navbar />

            <div className="home-container">
                <span className="eyebrow">Your account</span>
                <h2>Welcome, {firstName}</h2>

                <div className="profile-row">
                    <span className="profile-label">Full Name</span>
                    <span className="profile-value">{user.fullName}</span>
                </div>

                <div className="profile-row">
                    <span className="profile-label">Email</span>
                    <span className="profile-value">{user.email}</span>
                </div>

                <div className="profile-row">
                    <span className="profile-label">Phone</span>
                    <span className="profile-value">{user.phone}</span>
                </div>

                <div className="profile-row">
                    <span className="profile-label">Member since</span>
                    <span className="profile-value">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Home;