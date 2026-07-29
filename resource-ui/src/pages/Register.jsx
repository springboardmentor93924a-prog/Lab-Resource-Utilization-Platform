import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        department: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            await registerUser(form);

            alert("Registration successful! Please login.");

            navigate("/login");

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);
        }
    }

    return (
        <div className="auth-page">

            <form className="auth-card" onSubmit={handleSubmit}>

                <h1>Create Account</h1>

                {error && (
                    <p className="error-message">{error}</p>
                )}

                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    minLength="6"
                    required
                />

                <label>Department</label>
                <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p>
                    Already registered?{" "}
                    <Link to="/login">Login</Link>
                </p>

            </form>

        </div>
    );
}

export default Register;