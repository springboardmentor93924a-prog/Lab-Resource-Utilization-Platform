import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Building2, User, Mail } from "lucide-react";
import { authApi } from "../../api/authApi";
import { Logo } from "../common/Logo";

export default function PasswordSetupPage({ goTo, toast, onSetupComplete }) {
  const [token, setToken] = useState("");
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tok = urlParams.get("token");
    if (!tok) {
      setErrorMsg("No account setup token was provided in the URL.");
      setLoading(false);
      return;
    }
    setToken(tok);

    authApi.validateSetupToken(tok)
      .then((data) => {
        setAccountInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Invalid or expired setup link. Please contact administrator if you need a new link.");
        setLoading(false);
      });
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.password || form.password.length < 8) {
      errs.password = "Password must be at least 8 characters long.";
    }
    if (form.confirm !== form.password) {
      errs.confirm = "Passwords do not match.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await authApi.setupPassword({
        token,
        password: form.password,
        confirmPassword: form.confirm,
      });

      setSetupDone(true);
      toast?.("Password set up successfully! Your account is now active.", "success");
      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (err) {
      toast?.(err.message || "Failed to set up password.", "error");
      setFieldErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleLabel = (roleName) => {
    if (!roleName) return "Account Holder";
    if (roleName === "INSTITUTION_ADMIN" || roleName === "ROLE_INSTITUTION_ADMIN") return "Institution Administrator";
    if (roleName === "DEPARTMENT_HEAD" || roleName === "ROLE_DEPARTMENT_HEAD") return "Department Head";
    if (roleName === "LAB_MANAGER" || roleName === "ROLE_LAB_MANAGER") return "Lab Manager";
    if (roleName === "LAB_TECHNICIAN" || roleName === "ROLE_LAB_TECHNICIAN" || roleName === "TECHNICIAN") return "Lab Technician";
    if (roleName === "RESEARCHER" || roleName === "ROLE_RESEARCHER" || roleName === "STUDENT") return "Student / Researcher";
    return roleName;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo onClick={() => goTo?.("landing")} />
          <button
            onClick={() => goTo?.("login")}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} /> Sign In
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-600">Validating setup link...</p>
            </div>
          ) : errorMsg ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Link Invalid or Expired</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => goTo?.("login")}
                className="mt-6 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Go to Sign In
              </button>
            </div>
          ) : setupDone ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Account Activated</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Your password has been saved and your account is now ready for use.
              </p>
              <button
                onClick={() => goTo?.("login")}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm"
              >
                Sign In to Platform
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={24} />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">Account Onboarding</p>
                  <h1 className="text-xl font-extrabold text-slate-900">Set Up Your Account Password</h1>
                </div>
              </div>

              {/* Read-Only Account Summary Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" /> Name
                  </span>
                  <span className="font-bold text-slate-900">
                    {accountInfo?.firstName} {accountInfo?.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-400" /> Work Email
                  </span>
                  <span className="font-mono font-medium text-slate-900">{accountInfo?.email}</span>
                </div>
                {accountInfo?.institutionName && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400" /> Institution
                    </span>
                    <span className="font-semibold text-slate-800">{accountInfo.institutionName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Assigned Role</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                    {getRoleLabel(accountInfo?.roleName)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="At least 8 characters"
                      className={`w-full rounded-lg border px-3.5 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        fieldErrors.password ? "border-red-400 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.confirm}
                      onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="Re-enter your password"
                      className={`w-full rounded-lg border px-3.5 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        fieldErrors.confirm ? "border-red-400 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                  </div>
                  {fieldErrors.confirm && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.confirm}</p>
                  )}
                </div>

                {fieldErrors.submit && (
                  <p className="text-xs text-red-500 font-semibold">{fieldErrors.submit}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? "Activating Account..." : "Set Password and Activate Account"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        Lab Resource Utilization Platform • Centralized Research Infrastructure
      </footer>
    </div>
  );
}
