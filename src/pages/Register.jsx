import { useState } from "react";

function Register({ onLogin }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!role) {
            setMessage("Please select your role.");
            return;
        }

        // Frontend-only role storage for Milestone 1
        localStorage.setItem("selectedRole", role);

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
                        password: password
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Registration failed");
            }

            const data = await response.json();

            console.log("Registration response:", data);

            setMessage("Registration successful! You can now login.");

        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div>
            <h1>Lab Resource Platform</h1>

            <h2>Register</h2>

            <form onSubmit={handleRegister}>

                <div>
                    <label>Full Name</label>
                    <br />
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <br />

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
                        placeholder="Create a password"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Role</label>
                    <br />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="">
                            -- Select your role --
                        </option>

                        <option value="SYSTEM_ADMIN">
                            System Administrator
                        </option>

                        <option value="INSTITUTION_ADMIN">
                            Institution Administrator
                        </option>

                        <option value="DEPARTMENT_HEAD">
                            Department Head
                        </option>

                        <option value="LAB_MANAGER">
                            Lab Manager
                        </option>

                        <option value="LAB_TECHNICIAN">
                            Lab Technician
                        </option>

                        <option value="RESEARCHER">
                            Researcher
                        </option>
                    </select>
                </div>

                <br />

                <button type="submit">
                    Register
                </button>

            </form>

            {message && <p>{message}</p>}

            <p>
                Already have an account?{" "}

                <button
                    type="button"
                    onClick={onLogin}
                >
                    Login
                </button>
            </p>

        </div>
    );
}

export default Register;