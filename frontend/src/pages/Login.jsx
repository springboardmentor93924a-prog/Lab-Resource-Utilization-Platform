import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [show, setShow] = useState(false);
    const [selectedRole, setSelectedRole] = useState("SUPER_ADMIN");

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login({ ...form, role: selectedRole });
            navigate("/");
        } catch (err) {
            console.error(err);
            let msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to login";
            if (msg === "Network Error") msg = "Unable to connect to server. Please turn on Dev Mode below.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <section className="auth-visual">
                <div className="brand-mark">RU</div>
                <div>
                    <span className="eyebrow">RESOURCE UTILIZATION PLATFORM</span>
                    <h1>
                        Smarter labs.
                        <br />
                        Better research.
                    </h1>
                    <p>
                        Manage equipment, bookings, maintenance and calibration from one secure workspace.
                    </p>
                    <div className="feature-row">
                        <span>✓ Live availability</span>
                        <span>✓ Centralized bookings</span>
                        <span>✓ Asset insights</span>
                    </div>
                </div>
                <small>Built for modern institutions and research teams.</small>
            </section>
            <section className="auth-panel">
                <form className="pro-auth-card" onSubmit={submit}>
                    <div className="mobile-brand">
                        <span className="brand-mark small">RU</span>
                        ResourceHub
                    </div>
                    <span className="eyebrow dark">WELCOME BACK</span>
                    <h2>Sign in to your workspace</h2>
                    <p className="subtext">Enter your credentials to continue.</p>

                    {error && (
                        <div className="pro-alert">
                            ⚠ {error}
                        </div>
                    )}

                    <label>Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />

                    <label>Password</label>
                    <div className="password-wrap">
                        <input
                            type={show ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                        <button type="button" className="show-pass" onClick={() => setShow(!show)}>
                            {show ? "Hide" : "Show"}
                        </button>
                    </div>

                    <label>Role</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    <button className="primary-action" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in →"}
                    </button>

                    <p className="auth-switch">
                        New to ResourceHub?{" "}
                        <Link to="/register">Create an account</Link>
                    </p>

                    {localStorage.getItem("devMode") === "true" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "15px", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Dev Quick-Fill</span>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    type="button"
                                    className="glass-btn"
                                    style={{ fontSize: "11px", padding: "4px 8px", flex: 1, background: "rgba(59, 130, 246, 0.2)", color: "#93c5fd" }}
                                    onClick={() => {
                                        setForm({ email: "superadmin@example.com", password: "password" });
                                        setSelectedRole("SUPER_ADMIN");
                                    }}
                                >
                                    Super Admin
                                </button>
                                <button
                                    type="button"
                                    className="glass-btn"
                                    style={{ fontSize: "11px", padding: "4px 8px", flex: 1, background: "rgba(16, 185, 129, 0.2)", color: "#6ee7b7" }}
                                    onClick={() => {
                                        setForm({ email: "admin@example.com", password: "password" });
                                        setSelectedRole("ADMIN");
                                    }}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <button
                            type="button"
                            className="glass-btn"
                            style={{ fontSize: "11px", padding: "4px 12px", background: localStorage.getItem("devMode") === "true" ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.1)" }}
                            onClick={() => {
                                const current = localStorage.getItem("devMode") === "true";
                                localStorage.setItem("devMode", !current);
                                window.location.reload();
                            }}
                        >
                            {localStorage.getItem("devMode") === "true" ? "🟢 Dev Mode: ON" : "⚪ Dev Mode: OFF"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}