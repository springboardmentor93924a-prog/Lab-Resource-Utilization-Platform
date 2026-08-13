import { useState } from "react";

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
        <div>
            <h1>Lab Resource Platform</h1>

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <div>
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Password</label>
                    <br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <br />

                <button type="submit">
                    Login
                </button>

            </form>

            {message && <p>{message}</p>}
            <p>
           New user?{" "}
           <button type="button" onClick={onRegister}>
            Register
           </button>
          </p>
        </div>
    );
}

export default Login;