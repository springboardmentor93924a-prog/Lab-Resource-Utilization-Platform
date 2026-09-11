import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import "./Profile.css";

export default function Profile() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setError("You are not logged in.");
                    return;
                }

                const response = await fetch("https://lab-resource-utilization-platform-o09v.onrender.com/auth/me", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load profile details.");
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="profile-layout">
                <aside className="sidebar">
                    <Sidebar />
                </aside>

                <main className="profile-main">
                    <div className="profile-header">
                        <h2>My Profile</h2>
                    </div>

                    <div className="profile-loading">
                        Loading profile...
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-layout">
                <aside className="sidebar">
                    <Sidebar />
                </aside>

                <main className="profile-main">
                    <div className="profile-header">
                        <h2>My Profile</h2>
                    </div>

                    <div className="profile-error">
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="profile-layout">
            <aside className="sidebar">
                <Sidebar />
            </aside>

            <main className="profile-main">

                <div className="profile-header">
                    <h2>My Profile</h2>
                </div>

                <div className="profile-content">

                    {/* Profile card */}
                    <div className="profile-card">

                        {/* Profile icon */}
                        <div className="profile-avatar">
                            👤
                        </div>

                        <h2 className="profile-name">
                            {user.fullName}
                        </h2>

                        <p className="profile-role">
                            {user.role}
                        </p>

                        {/* Details */}
                        <div className="profile-details">

                            <div className="profile-detail">
                                <span className="detail-label">
                                    Full Name
                                </span>
                                <span className="detail-value">
                                    {user.fullName}
                                </span>
                            </div>

                            <div className="profile-detail">
                                <span className="detail-label">
                                    Email
                                </span>
                                <span className="detail-value">
                                    {user.email}
                                </span>
                            </div>

                            <div className="profile-detail">
                                <span className="detail-label">
                                    Role
                                </span>
                                <span className="detail-value">
                                    {user.role}
                                </span>
                            </div>

                            <div className="profile-detail">
                                <span className="detail-label">
                                    Institution
                                </span>
                                <span className="detail-value">
                                    {user.institutionName || "Not assigned"}
                                </span>
                            </div>

                            <div className="profile-detail">
                                <span className="detail-label">
                                    Institution ID
                                </span>
                                <span className="detail-value">
                                    {user.institutionId ?? "Not assigned"}
                                </span>
                            </div>

                            <div className="profile-detail">
                                <span className="detail-label">
                                    User ID
                                </span>
                                <span className="detail-value user-id">
                                    {user.id}
                                </span>
                            </div>

                        <button
                            onClick={handleLogout}
                            style={{
                                marginTop: "20px",
                                width: "100%",
                                padding: "10px",
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Logout
                        </button>
                    </div>

                    </div>

                </div>

            </main>
        </div>
    );
}
