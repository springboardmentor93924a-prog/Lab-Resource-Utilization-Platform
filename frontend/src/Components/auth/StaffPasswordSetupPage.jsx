import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { authApi } from "../../api/authApi";
import { Logo, Field, inputClass } from "../shared/ui.jsx";

export default function StaffPasswordSetupPage({ goTo, toast, onSetupComplete }) {
  const [token, setToken] = useState("");
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tok = urlParams.get("token");
    if (!tok) {
      setErrorMsg("No invitation token provided in URL.");
      setLoading(false);
      return;
    }
    setToken(tok);

    authApi.validateStaffInvitationToken(tok)
      .then((data) => {
        setInvitation(data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Invalid or expired invitation link.");
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
      const userSummary = await authApi.acceptStaffInvitation({
        token,
        password: form.password,
        confirmPassword: form.confirm,
      });

      toast("Account set up successfully! Please sign in with your password.", "success");
      if (onSetupComplete) {
        onSetupComplete(userSummary);
      } else {
        goTo("login");
      }
    } catch (err) {
      toast(err.message || "Failed to set up password.", "error");
      setFieldErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleLabel = (roleName) => {
    if (roleName === "DEPARTMENT_HEAD") return "Department Head";
    if (roleName === "LAB_MANAGER") return "Lab Manager";
    if (roleName === "LAB_TECHNICIAN" || roleName === "TECHNICIAN") return "Lab Technician";
    return roleName;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo onClick={() => goTo("landing")} />
          <button
            onClick={() => goTo("login")}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} /> Sign In
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-600">Validating invitation link...</p>
            </div>
          ) : errorMsg ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Invalid or Expired Link</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => goTo("login")}
                className="mt-6 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">Staff Onboarding</p>
                  <h1 className="text-xl font-extrabold text-slate-900">Set Up Your Account Password</h1>
                </div>
              </div>

              {/* Read-Only Staff Profile Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Name:</span>
                  <span className="font-bold text-slate-800">{invitation?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-bold text-slate-800">{invitation?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Institution:</span>
                  <span className="font-semibold text-slate-700">{invitation?.institutionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="font-semibold text-slate-700">{invitation?.departmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assigned Role:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                    {getRoleLabel(invitation?.roleName)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="New Password" required error={fieldErrors.password}>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="At least 8 characters"
                      className={`pl-10 pr-10 ${inputClass(fieldErrors.password)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm Password" required error={fieldErrors.confirm}>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.confirm}
                      onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="Re-enter your password"
                      className={`pl-10 pr-10 ${inputClass(fieldErrors.confirm)}`}
                    />
                  </div>
                </Field>

                {fieldErrors.submit && (
                  <p className="text-xs text-red-500 font-semibold">{fieldErrors.submit}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm mt-2 disabled:opacity-50"
                >
                  {submitting ? "Activating Account..." : "Activate Account & Proceed to Sign In"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
