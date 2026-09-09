import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function OAuth2Callback() {
  const navigate = useNavigate();
  const { setGoogleSession } = useAuth();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          console.error("No JWT token received from Google");
          navigate("/login?error=google");
          return;
        }

        console.log("Google JWT received");

        await setGoogleSession(token);

        console.log("Google session created successfully");

        navigate("/dashboard");
      } catch (error) {
        console.error("Google login callback failed:", error);
        navigate("/login?error=google");
      }
    }

    handleCallback();
  }, [navigate, setGoogleSession]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>

        <p className="text-gray-500 mt-2">
          Please wait while we complete Google authentication.
        </p>
      </div>
    </div>
  );
}