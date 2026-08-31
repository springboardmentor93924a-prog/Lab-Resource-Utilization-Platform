import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Invalid email or password");
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));
            onLogin();

            setMessage("Login successful!");

            console.log("Login response:", data);

        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
    <div className="login-page">

        <div className="login-card">

            <div className="login-brand">

                <div className="login-brand-icon">
                    LR
                </div>

                <h1>
                    Lab Resource Platform
                </h1>

                <p>
                    Laboratory Resource Utilization Platform
                </p>

            </div>


            <h2 className="login-title">
                Welcome Back
            </h2>

            <p className="login-subtitle">
                Sign in to access your laboratory workspace
            </p>


            <form
                className="login-form"
                onSubmit={handleLogin}
            >

                <div className="login-field">

                    <label>
                        Email Address
                    </label>

                    <input
                        className="login-input"
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter your email"
                        required
                    />

                </div>


                <div className="login-field">

                    <label>
                        Password
                    </label>

                    <input
                        className="login-input"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter your password"
                        required
                    />

                </div>


                <button
                    className="login-submit"
                    type="submit"
                >
                    Login
                </button>

            </form>


            {message && (
                <p className="login-message">
                    {message}
                </p>
            )}


            <div className="login-register">

                <span>
                    New user?
                </span>

                <button
                    type="button"
                    onClick={onRegister}
                >
                    Create an account
                </button>

            </div>

        </div>

    </div>
);
}

export default Login;