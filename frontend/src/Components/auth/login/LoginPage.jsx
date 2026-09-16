import { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Logo } from "../../common/Logo.jsx";
import { API_BASE_URL } from "../../../api/client.js";

export default function LoginPage({ goTo, toast, pendingAccounts = [], role, onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [invitedUserNotice, setInvitedUserNotice] = useState(null);

  const handleEmailChange = (val) => {
    setForm((f) => ({ ...f, email: val }));
    setInvitedUserNotice(null);
  };

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const err = {};
    if (!form.email.trim()) err.email = "Email is required.";
    if (!form.password) err.password = "Password is required.";

    const pendingMatch = pendingAccounts.find(
      (a) => a.email === form.email.trim().toLowerCase()
    );

    if (Object.keys(err).length > 0) {
      setErrors(err);
      toast("Please fix the highlighted fields.", "error");
      return;
    }

    if (pendingMatch) {
      setErrors({ email: "This account is still pending approval." });
      toast(
        `Your ${pendingMatch.roleLabel || "account"} application is pending approval. You can sign in once a System Administrator approves it.`,
        "error"
      );
      return;
    }

    setErrors({});
    setSubmitting(true);

    const cleanEmail = form.email.trim().toLowerCase();

    // 1. Detect role by email address pattern if role wasn't explicitly selected
    let resolvedRole = role;
    if (cleanEmail.includes("admin") || cleanEmail === "admin@kce.ac.in") {
      resolvedRole = { id: "institution-admin", title: "Institution Administrator" };
    } else if (cleanEmail.includes("bhuvananivetha94") || cleanEmail.includes("head")) {
      resolvedRole = { id: "department-head", title: "Department Head" };
    } else if (cleanEmail.includes("snivetha236") || cleanEmail.includes("bhuvananivetha96") || cleanEmail.includes("manager")) {
      resolvedRole = { id: "manager", title: "Lab Manager" };
    } else if (cleanEmail.includes("tech") || cleanEmail.includes("ramesh") || cleanEmail.includes("sowmya")) {
      resolvedRole = { id: "technician", title: "Lab Technician" };
    } else if (!resolvedRole) {
      resolvedRole = { id: "researcher", title: "Researcher" };
    }

    const roleMap = {
      INSTITUTION_ADMIN: { id: "institution-admin", title: "Institution Administrator" },
      DEPARTMENT_HEAD: { id: "department-head", title: "Department Head" },
      LAB_MANAGER: { id: "manager", title: "Lab Manager" },
      TECHNICIAN: { id: "technician", title: "Lab Technician" },
      RESEARCHER: { id: "researcher", title: "Researcher" },
    };

    try {
      // Authenticate exclusively via Spring Boot REST API
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.token || data.accessToken) && data.user) {
        const token = data.token || data.accessToken;
        localStorage.setItem("labflow_token", token);

        const u = data.user;
        const realRoles = Array.isArray(u.roles) ? u.roles : [];
        const rStr = realRoles.join(",").toUpperCase();

        let detectedRole = resolvedRole || { id: "researcher", title: "Researcher" };
        let targetDashboard = "dashboard-researcher";

        if (rStr.includes("TECHNICIAN")) {
          detectedRole = { id: "technician", title: "Lab Technician" };
          targetDashboard = "dashboard-technician";
        } else if (rStr.includes("DEPARTMENT_HEAD") || rStr.includes("HEAD")) {
          detectedRole = { id: "department-head", title: "Department Head" };
          targetDashboard = "dashboard-department-head";
        } else if (rStr.includes("MANAGER")) {
          detectedRole = { id: "manager", title: "Lab Manager" };
          targetDashboard = "dashboard-manager";
        } else if (rStr.includes("INSTITUTION")) {
          detectedRole = { id: "institution-admin", title: "Institution Administrator" };
          targetDashboard = "dashboard-institution-admin";
        } else if (rStr.includes("SYSTEM")) {
          detectedRole = { id: "system-admin", title: "System Administrator" };
          targetDashboard = "dashboard-system-admin";
        }

        console.log("LOGIN STATUS: 200");
        console.log("LOGIN RESPONSE:", data);
        console.log("AUTHENTICATED USER:", u);
        console.log("BACKEND ROLES:", realRoles);
        console.log("NORMALIZED ROLE:", detectedRole);
        console.log("TARGET DASHBOARD:", targetDashboard);

        const loggedInUser = {
          id: u.userId || u.id,
          userId: u.userId || u.id,
          email: u.email,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
          phone: u.phoneNumber || "",
          department: u.departmentName || "Computer Science and Engineering",
          institution: u.institutionName || "Karpagam College of Engineering",
          institutionId: u.institutionId,
          departmentId: u.departmentId,
          roles: realRoles,
          role: detectedRole.title,
          token: token,
        };

        toast(`Signed in successfully as ${detectedRole.title}.`, "success");
        onLoginSuccess(loggedInUser, detectedRole);
        return;
      } else {
        const errorMsg = data.message || data.error || `Authentication failed (${res.status}). Invalid email or password.`;
        console.error("LOGIN STATUS:", res.status);
        console.error("LOGIN FAILED RESPONSE:", data);
        setErrors({ email: errorMsg });
        toast(errorMsg, "error");
        return;
      }
    } catch (apiErr) {
      console.error("Authentication server connection error:", apiErr);
      const errorMsg = "Unable to connect to authentication server. Please check backend connection.";
      setErrors({ email: errorMsg });
      toast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const googleLogin = () => {
    toast("Google OAuth sign-in is not enabled. Please sign in with your institutional email and password.", "info");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left branding panel */}
      <div className="lg:w-1/2 bg-slate-900 text-white flex flex-col justify-center px-8 sm:px-14 py-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative">
          <Logo dark onClick={() => goTo("landing")} />
          <h1 className="mt-8 text-3xl sm:text-4xl font-extrabold leading-tight">
            Precision Management for<br />Modern Laboratories.
          </h1>
          <p className="mt-4 text-slate-400 max-w-sm leading-relaxed">
            Streamline workflows, track equipment telemetry, and manage institutional
            resources with scientific rigor.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <button
              onClick={() => goTo("roles")}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors mb-6"
            >
              <ArrowLeft size={14} /> Back to Role Selection
            </button>
            <h2 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-600 mt-1">
              Signing in as <span className="font-semibold text-blue-600">{role?.label || "User"}</span>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="admin@kce.ac.in"
                  className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-400 bg-red-50/30" : "border-slate-300"
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
            </div>

            {invitedUserNotice && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-900 shadow-2xs">
                <p className="font-bold text-sm text-blue-950">🎉 Invitation Found for {invitedUserNotice.name}!</p>
                <p className="mt-1 text-blue-700">
                  Role: <span className="font-bold">{invitedUserNotice.role?.replace(/_/g, " ")}</span> · Dept: <span className="font-bold">{invitedUserNotice.department}</span>
                </p>
                <p className="mt-1 font-medium text-slate-600">Please enter your new account password below to complete your setup.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  className={`w-full rounded-lg border pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-400 bg-red-50/30" : "border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <button type="button" onClick={() => goTo("forgot-password")} className="font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
