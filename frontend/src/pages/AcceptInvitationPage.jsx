import { useState, useEffect } from "react";
import { Lock, Mail, User, Phone, ShieldCheck, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { Logo } from "../Components/common/Logo.jsx";
import { API_BASE_URL } from "../api/client.js";

const ROLE_MAP = {
  3: { id: "department-head", title: "Department Head", roleName: "DEPARTMENT_HEAD" },
  4: { id: "manager", title: "Lab Manager", roleName: "LAB_MANAGER" },
  5: { id: "technician", title: "Lab Technician", roleName: "TECHNICIAN" },
  "department-head": { id: "department-head", title: "Department Head", roleName: "DEPARTMENT_HEAD" },
  "manager": { id: "manager", title: "Lab Manager", roleName: "LAB_MANAGER" },
  "technician": { id: "technician", title: "Lab Technician", roleName: "TECHNICIAN" },
  "lab_manager": { id: "manager", title: "Lab Manager", roleName: "LAB_MANAGER" },
  "department_head": { id: "department-head", title: "Department Head", roleName: "DEPARTMENT_HEAD" },
};

export default function AcceptInvitationPage({ goTo, toast, onLoginSuccess }) {
  const [invitedData, setInvitedData] = useState(null);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token") || "";

    localStorage.removeItem("labflow_user");

    if (!tokenParam) {
      toast?.("No invitation token found in link.", "error");
      setLoading(false);
      return;
    }

    // Call real backend validation API
    fetch(`${API_BASE_URL}/staff/invitations/validate?token=${tokenParam}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invalid or expired invitation token.");
        return res.json();
      })
      .then((data) => {
        const roleInfo = ROLE_MAP[data.roleName] || ROLE_MAP[data.roleId] || { id: "manager", title: data.roleName || "Staff", roleName: data.roleName || "STAFF" };
        const nameParts = (data.fullName || "").trim().split(" ");

        setInvitedData({
          email: data.email,
          firstName: nameParts[0] || "Invited",
          lastName: nameParts.slice(1).join(" ") || "",
          fullName: data.fullName,
          phone: data.phoneNumber || "N/A",
          department: data.departmentName,
          departmentId: data.departmentId,
          institution: data.institutionName,
          institutionId: data.institutionId,
          roleName: data.roleName,
          role: roleInfo,
          token: tokenParam,
        });
      })
      .catch((err) => {
        toast?.(err.message || "Failed to validate invitation.", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);

    try {
      // 1. Accept invitation via backend
      const res = await fetch(`${API_BASE_URL}/staff/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: invitedData.token,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Account setup failed.");
      }

      // 2. Authenticate user via backend /api/auth/login
      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: invitedData.email,
          password: form.password,
        }),
      });

      if (!loginRes.ok) {
        toast("Account setup complete! Please log in with your new password.", "success");
        goTo("login");
        return;
      }

      const authData = await loginRes.json();
      const token = authData.token || authData.accessToken;
      if (token) {
        localStorage.setItem("labflow_token", token);
      }

      toast(`Account setup complete! Welcome ${invitedData.firstName}.`, "success");
      onLoginSuccess(authData.user || authData, invitedData.role);
    } catch (err) {
      toast(err.message || "Account setup failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!invitedData) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <Logo className="mx-auto mb-4" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 mb-2 border border-blue-100">
            <ShieldCheck size={14} className="text-blue-600" /> Official Staff Invitation
          </span>
          <h1 className="text-2xl font-black text-slate-900">Create Your Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome <span className="font-bold text-slate-900">{invitedData.fullName}</span>! Your institution account details have been pre-filled below by your administrator.
          </p>
        </div>

        {/* Locked Pre-Filled Profile Details set by Admin */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3 mb-6">
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Full Name</p>
              <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <User size={14} className="text-blue-600" /> {invitedData.fullName}
              </p>
            </div>
            <span className="rounded-md bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              {invitedData.role.title}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email Address</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <Mail size={12} className="text-slate-400 shrink-0" /> {invitedData.email}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Phone Number</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Phone size={12} className="text-slate-400 shrink-0" /> {invitedData.phone}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/70 text-xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Department</p>
            <p className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Building2 size={12} className="text-slate-400 shrink-0" /> {invitedData.department}
            </p>
          </div>
        </div>

        {/* Form: Password creation ONLY */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password (min 6 chars)"
                className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-400 bg-red-50/30" : "border-slate-300"}`}
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? "border-red-400 bg-red-50/30" : "border-slate-300"}`}
              />
            </div>
            {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            {submitting ? "Activating Account…" : "Create Password & Access Dashboard"} <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
