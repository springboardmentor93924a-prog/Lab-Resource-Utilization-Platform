import { useState } from "react";
import "./Register.css";

function Register({ onLogin }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!role) {
            setMessage("Please select your role.");
            setIsSuccess(false);
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullName: fullName,
                        email: email,
                        password: password,
                        role: role // <-- Included role in API payload
                    })
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // Display specific backend message or fallback
                throw new Error(data.message || data || "Registration failed. Please try again.");
            }

            localStorage.setItem("selectedRole", role);
            setMessage("Registration successful! Redirecting to login...");
            setIsSuccess(true);

            // Redirect to login screen after 1.5 seconds
            setTimeout(() => {
                if (onLogin) onLogin();
            }, 1500);

        } catch (error) {
            setMessage(error.message);
            setIsSuccess(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                {/* BRANDING */}
                <div className="register-brand">
                    <div className="register-brand-icon">LR</div>
                    <h1>Lab Resource Platform</h1>
                    <p>Laboratory Resource Utilization Platform</p>
                </div>

                {/* TITLE */}
                <h2 className="register-title">Create Account</h2>
                <p className="register-subtitle">
                    Create your account to access laboratory resources
                </p>

                {/* FORM */}
                <form className="register-form" onSubmit={handleRegister}>
                    {/* FULL NAME */}
                    <div className="register-field">
                        <label>Full Name</label>
                        <input
                            className="register-input"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="register-field">
                        <label>Email Address</label>
                        <input
                            className="register-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="register-field">
                        <label>Password</label>
                        <input
                            className="register-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    {/* ROLE */}
                    <div className="register-field">
                        <label>Select Role</label>
                        <select
                            className="register-input register-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="">Select your role</option>
                            <option value="SYSTEM_ADMIN">System Administrator</option>
                            <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                            <option value="DEPARTMENT_HEAD">Department Head</option>
                            <option value="LAB_MANAGER">Lab Manager</option>
                            <option value="LAB_TECHNICIAN">Lab Technician</option>
                            <option value="RESEARCHER">Researcher</option>
                        </select>
                    </div>

                    {/* REGISTER BUTTON */}
                    <button className="register-submit" type="submit">
                        Create Account
                    </button>
                </form>

                {/* MESSAGE */}
                {message && (
                    <p className={`register-message ${isSuccess ? "success" : "error"}`}>
                        {message}
                    </p>
                )}

                {/* LOGIN */}
                <div className="register-login">
                    <span>Already have an account?</span>
                    <button type="button" onClick={onLogin}>
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;