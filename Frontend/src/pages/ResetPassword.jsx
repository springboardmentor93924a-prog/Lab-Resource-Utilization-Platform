import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, password);

      setMessage(
        "Password changed successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {

  console.error(
    "Reset password error:",
    err
  );

  const backendError =
    err?.response?.data;


  setError(

    typeof backendError ===
    "string"

      ? backendError

      : backendError?.message ||

        "Invalid or expired reset link."

  );

} finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#061329",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      {/* MAIN CARD */}
      <div
        style={{
          width: "100%",
          maxWidth: "1120px",
          minHeight: "650px",
          backgroundColor: "#ffffff",
          borderRadius: "28px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          display: "flex",
          overflow: "hidden",
        }}
      >

        {/* ================= LEFT SIDE ================= */}
        <div
          style={{
            width: "50%",
            padding: "70px 60px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >

          {/* TITLE */}
          <div
            style={{
              marginBottom: "42px",
            }}
          >
            <h1
              style={{
                margin: 0,
                padding: 0,
                color: "#162d5b",
                fontSize: "68px",
                lineHeight: "0.98",
                fontWeight: 800,
                letterSpacing: "-2px",
              }}
            >
              Reset
              <br />
              Your
              <br />
              Password
            </h1>

            <div
              style={{
                width: "280px",
                height: "3px",
                backgroundColor: "#162d5b",
                marginTop: "10px",
              }}
            />
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              maxWidth: "490px",
            }}
          >

            {/* PASSWORD */}
            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  color: "#162d5b",
                  fontSize: "17px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Password:
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                style={{
                  display: "block",
                  width: "100%",
                  height: "58px",
                  boxSizing: "border-box",
                  padding: "0 15px",
                  border: "2px solid #cbd5e1",
                  borderRadius: "7px",
                  backgroundColor: "#ffffff",
                  color: "#162d5b",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div
              style={{
                marginBottom: "30px",
              }}
            >
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  color: "#162d5b",
                  fontSize: "17px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Confirm password:
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                required
                style={{
                  display: "block",
                  width: "100%",
                  height: "58px",
                  boxSizing: "border-box",
                  padding: "0 15px",
                  border: "2px solid #cbd5e1",
                  borderRadius: "7px",
                  backgroundColor: "#ffffff",
                  color: "#162d5b",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div
                style={{
                  color: "#dc2626",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "18px",
                }}
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {message && (
              <div
                style={{
                  color: "#16a34a",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "18px",
                }}
              >
                {message}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 28px",
                minWidth: "190px",
                height: "48px",
                border: "none",
                borderRadius: "25px",
                backgroundColor: "#162d5b",
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
                opacity: loading ? 0.65 : 1,
              }}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>

          </form>
        </div>


        {/* ================= RIGHT SIDE ================= */}
        <div
          style={{
            width: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            padding: "40px",
            boxSizing: "border-box",
          }}
        >

          <div
            style={{
              width: "360px",
              height: "420px",
              position: "relative",
            }}
          >

            {/* LOCK SHACKLE */}
            <div
              style={{
                position: "absolute",
                top: "25px",
                left: "105px",
                width: "150px",
                height: "150px",
                border: "34px solid #4f9cf9",
                borderBottom: "none",
                borderRadius: "90px 90px 0 0",
                boxSizing: "border-box",
              }}
            />

            {/* LOCK BODY */}
            <div
              style={{
                position: "absolute",
                top: "140px",
                left: "70px",
                width: "220px",
                height: "190px",
                backgroundColor: "#4f9cf9",
                borderRadius: "25px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
              }}
            >

              {/* KEYHOLE */}
              <div
                style={{
                  position: "absolute",
                  top: "70px",
                  left: "95px",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "92px",
                  left: "104px",
                  width: "12px",
                  height: "45px",
                  borderRadius: "0 0 10px 10px",
                  backgroundColor: "#dbeafe",
                }}
              />
            </div>

            {/* PEOPLE / DECORATION */}
            <div
              style={{
                position: "absolute",
                bottom: "55px",
                left: "55px",
                display: "flex",
                alignItems: "flex-end",
                gap: "22px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "90px",
                  backgroundColor: "#9bc7f9",
                  borderRadius: "30px 30px 0 0",
                }}
              />

              <div
                style={{
                  width: "52px",
                  height: "125px",
                  backgroundColor: "#c4ddfa",
                  borderRadius: "30px 30px 0 0",
                }}
              />

              <div
                style={{
                  width: "52px",
                  height: "90px",
                  backgroundColor: "#9bc7f9",
                  borderRadius: "30px 30px 0 0",
                }}
              />
            </div>

            {/* GROUND */}
            <div
              style={{
                position: "absolute",
                bottom: "25px",
                left: "20px",
                width: "320px",
                height: "20px",
                borderRadius: "20px",
                backgroundColor: "#dbeafe",
              }}
            />

          </div>

        </div>

      </div>
    </div>
  );
}