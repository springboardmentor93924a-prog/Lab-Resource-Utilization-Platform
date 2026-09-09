import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMe } from "../services/authService";
import "./Profile.css";

export default function Profile() {
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

                const data = await getMe();
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

                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}