import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const d = await loginUser(form);
            login(d);
            navigate("/");
        } catch (err) {
            setError(err.message);
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
                    <h1>Smarter labs.<br />Better research.</h1>
                    <p>Manage equipment, bookings, maintenance and calibration from one secure workspace.</p>
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
                        <span className="brand-mark small">RU</span> ResourceHub
                    </div>
                    <span className="eyebrow dark">WELCOME BACK</span>
                    <h2>Sign in to your workspace</h2>
                    <p className="subtext">Enter your credentials to continue to ResourceHub.</p>
                    {error && <div className="pro-alert">⚠ {error}</div>}
                    <label>Email address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="name@institution.edu"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <label>Password</label>
                    <div className="password-wrap">
                        <input
                            type={show ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                        <button type="button" className="show-pass" onClick={() => setShow(!show)}>
                            {show ? "Hide" : "Show"}
                        </button>
                    </div>
                    <div className="auth-options">
                        <label className="check">
                            <input type="checkbox" style={{ width: "auto", height: "auto", marginRight: "8px" }} /> Remember me
                        </label>
                        <span>Secure login</span>
                    </div>
                    <button className="btn btn-primary w-100 mt-4" disabled={loading}>
                        {loading ? "Signing in…" : "Sign in →"}
                    </button>
                    
                    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-color, #e5e7eb)" }}>
                        <label style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: "8px", fontWeight: "600" }}>
                            ⚡ Quick Demo Login (Select Role)
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" }}>
                            <button type="button" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 8px" }} onClick={() => setForm({ email: "admin@dypiu.ac.in", password: "password123" })}>
                                👑 System Admin
                            </button>
                            <button type="button" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 8px" }} onClick={() => setForm({ email: "instadmin@dypiu.ac.in", password: "password123" })}>
                                🏛️ Inst. Admin
                            </button>
                            <button type="button" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 8px" }} onClick={() => setForm({ email: "labmanager@dypiu.ac.in", password: "password123" })}>
                                📊 Lab Manager
                            </button>
                            <button type="button" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 8px" }} onClick={() => setForm({ email: "faculty@dypiu.ac.in", password: "password123" })}>
                                🏫 Dept Head
                            </button>
                            <button type="button" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 8px" }} onClick={() => setForm({ email: "technician@dypiu.ac.in", password: "password123" })}>
                                🔧 Technician
                            </button>
                            <button type="button" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 8px" }} onClick={() => setForm({ email: "researcher@dypiu.ac.in", password: "password123" })}>
                                🔬 Researcher
                            </button>
                            <button type="button" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 8px", gridColumn: "span 2" }} onClick={() => setForm({ email: "student@dypiu.ac.in", password: "password123" })}>
                                🎓 Student
                            </button>
                        </div>
                    </div>

                    <p className="auth-switch">
                        New to ResourceHub? <Link to="/register">Create an account</Link>
                    </p>
                </form>
            </section>
        </div>
    );
}
