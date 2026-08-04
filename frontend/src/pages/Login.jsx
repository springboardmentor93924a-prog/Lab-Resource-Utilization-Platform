import "./Login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          typeof data === "string"
            ? data
            : "Invalid credentials"
        );
      }


      // Save authentication information
      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "userId",
        data.userId
      );

      localStorage.setItem(
        "fullName",
        data.fullName
      );

      localStorage.setItem(
        "email",
        data.email
      );

      localStorage.setItem(
        "role",
        data.role
      );


      // Go to dashboard
      navigate("/dashboard");


    } catch (error) {

      setError(
        error.message || "Login failed"
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="login-container">

      <div className="login-card">

        <h1 className="title">
          Lab Resource Utilization Platform
        </h1>

        <p className="subtitle">
          Sign in to continue
        </p>


        {error && (
          <p className="login-error">
            {error}
          </p>
        )}


        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>


          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>


          <div className="options">

            <label className="remember">

              <input
                type="checkbox"
              />

              Remember Me

            </label>

            <Link to="/register">
              Register
            </Link>

          </div>


          <button
            className="login-btn"
            type="submit"
            disabled={loading}
          >

            {loading
              ? "LOGGING IN..."
              : "LOGIN"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;
