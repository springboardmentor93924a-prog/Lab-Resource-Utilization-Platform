import { useState } from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { Logo } from "../../common/Logo.jsx";
import { API_BASE_URL } from "../../../api/client.js";

export default function VerifyEmailNoticePage({ goTo, toast, email = "" }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/otp/verify?email=${encodeURIComponent(email.trim().toLowerCase())}&purpose=REGISTRATION&otp=${encodeURIComponent(otp.trim())}`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid or expired verification code.");
      }

      toast("Email verified successfully!", "success");
      setVerified(true);
    } catch (err) {
      toast(err.message || "Failed to verify OTP.", "error");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/otp/send?email=${encodeURIComponent(email.trim().toLowerCase())}&purpose=REGISTRATION`,
        { method: "POST" }
      );
      const data = await response.json();
      toast(data.message || "A new verification code has been sent.", "info");
    } catch (err) {
      toast("Failed to resend verification code.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {verified ? <CheckCircle2 size={32} className="text-emerald-600" /> : <ShieldCheck size={32} />}
        </div>

        <Logo className="justify-center mb-6" />

        {!verified ? (
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Verify Your Email Address</h1>
            <p className="mt-2 text-sm text-slate-600">
              We sent a 6-digit verification OTP to <span className="font-semibold text-slate-900">{email || "your email"}</span>.
            </p>

            <div className="mt-6 text-left space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">6-Digit Verification Code (OTP)</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className={`w-full rounded-lg border pl-10 pr-3.5 py-2.5 text-sm text-slate-900 tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400" : "border-slate-200"}`}
                  />
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
              >
                {loading ? "Verifying code…" : "Verify Email & Proceed"}
              </button>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Didn't receive the code?{" "}
              <button onClick={handleResend} className="font-semibold text-blue-600 hover:underline">
                Resend Code
              </button>
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Email Verified!</h1>
            <p className="mt-2 text-sm text-slate-600">
              Your email address has been verified. Your account registration is pending approval by your **Institution Administrator**.
            </p>

            <button
              onClick={() => goTo("login")}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
            >
              Go to Sign In <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
