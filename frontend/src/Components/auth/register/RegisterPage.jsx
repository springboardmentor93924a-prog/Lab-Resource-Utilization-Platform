import { useState, useEffect } from "react";
import { ArrowLeft, Landmark, ShieldCheck, CheckCircle2, KeyRound, AlertTriangle, Building2 } from "lucide-react";
import { Logo } from "../../common/Logo.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { API_BASE_URL } from "../../../api/client.js";

export default function RegisterPage({ goTo, role, toast, addPendingAccount, onLoginSuccess }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institutionId: "",
    institutionName: "",
    departmentId: "",
    departmentName: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [isUnregisteredCollege, setIsUnregisteredCollege] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Guard: Staff roles are created ONLY via Institution Admin invitations, not public registration
  useEffect(() => {
    if (role?.id === "technician" || role?.id === "manager" || role?.id === "department-head") {
      toast("Staff accounts are created by your Institution Admin via invitation. Redirecting to sign in.", "info");
      goTo("login");
    }
  }, [role, goTo, toast]);

  // Fetch approved institutions on page load
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/institutions`);
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data.filter((i) => i.isActive && i.approvalStatus !== "REJECTED"));
        }
      } catch (err) {
        console.error("Failed to load institutions", err);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    fetchInstitutions();
  }, []);

  // Fetch departments when an institution is selected
  const handleInstitutionChange = async (e) => {
    const val = e.target.value;
    if (val === "OTHER") {
      setIsUnregisteredCollege(true);
      setForm((f) => ({ ...f, institutionId: "", institutionName: "Unregistered Institution", departmentId: "", departmentName: "" }));
      setDepartments([]);
      return;
    }

    setIsUnregisteredCollege(false);
    const selectedInst = institutions.find((i) => String(i.institutionId) === String(val));
    setForm((f) => ({
      ...f,
      institutionId: val,
      institutionName: selectedInst ? selectedInst.name : "",
      departmentId: "",
      departmentName: "",
    }));

    if (val) {
      setLoadingDepartments(true);
      try {
        const res = await fetch(`${API_BASE_URL}/institutions/${val}/departments`);
        if (res.ok) {
          const depts = await res.json();
          setDepartments(depts);
        }
      } catch (err) {
        toast("Failed to load departments for selected institution.", "error");
      } finally {
        setLoadingDepartments(false);
      }
    } else {
      setDepartments([]);
    }
  };

  const handleDepartmentChange = (e) => {
    const val = e.target.value;
    const selectedDept = departments.find((d) => String(d.departmentId) === String(val));
    setForm((f) => ({
      ...f,
      departmentId: val,
      departmentName: selectedDept ? selectedDept.name : "",
    }));
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSendOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setErrors((e) => ({ ...e, email: "Enter a valid institutional email address first." }));
      return;
    }
    setErrors((e) => ({ ...e, email: undefined, otp: undefined }));
    setSendingOtp(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/otp/send?email=${encodeURIComponent(form.email.trim().toLowerCase())}&purpose=REGISTRATION`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP.");

      toast(data.message || "Verification OTP code sent to your email.", "success");
      setOtpSent(true);
    } catch (err) {
      toast(err.message || "Failed to send OTP. Is backend server running?", "error");
      setErrors((e) => ({ ...e, email: err.message }));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 6) {
      setErrors((e) => ({ ...e, otp: "Enter 6-digit OTP code." }));
      return;
    }
    setErrors((e) => ({ ...e, otp: undefined }));
    setVerifyingOtp(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/otp/verify?email=${encodeURIComponent(form.email.trim().toLowerCase())}&purpose=REGISTRATION&otp=${encodeURIComponent(otp.trim())}`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid or expired OTP code.");

      toast("Email verified successfully! You can now complete your registration.", "success");
      setIsEmailVerified(true);
    } catch (err) {
      toast(err.message || "Invalid OTP.", "error");
      setErrors((e) => ({ ...e, otp: err.message }));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid institutional email.";
    if (isUnregisteredCollege) e.institution = "Your college is not registered yet. Contact your Institution Admin.";
    if (!form.institutionId) e.institution = "Please select your institution.";
    if (!form.departmentId) e.department = "Please select your department.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const backendRole = role?.id === "manager" ? "LAB_MANAGER" : role?.id === "department-head" ? "DEPARTMENT_HEAD" : role?.id === "technician" ? "LAB_TECHNICIAN" : "RESEARCHER";
      const cleanEmail = form.email.trim().toLowerCase();

      // 1. REGISTER
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: cleanEmail,
          phone: form.phone,
          institutionId: Number(form.institutionId),
          departmentId: Number(form.departmentId),
          password: form.password,
          confirmPassword: form.confirm,
          role: backendRole,
        }),
      });

      const regData = await response.json().catch(() => ({}));

      // Handle HTTP 409 Conflict (Existing Email)
      if (response.status === 409 || regData.message?.includes("already exists") || regData.error?.includes("already exists")) {
        console.error("REGISTER 409 CONFLICT:", response.status, regData);
        const msg = "An account with this email already exists. Please log in instead.";
        setErrors({ email: msg });
        toast(msg, "error");
        return;
      }

      if (!response.ok) {
        console.error("REGISTER ERROR:", response.status, regData);
        const msg = regData.message || regData.error || `Registration failed with status ${response.status}.`;
        setErrors({ email: msg });
        toast(msg, "error");
        return;
      }

      console.log("REGISTER SUCCESS:", response.status, regData);

      // Add to pending accounts list and navigate to Pending Page for Institution Admin approval
      if (addPendingAccount) {
        addPendingAccount(cleanEmail, "Student / Researcher");
      }

      toast("Registration submitted successfully! Your application is pending approval by your Institution Administrator.", "success");
      goTo("pending");
      return;
    } catch (err) {
      console.error("REGISTER SUBMIT EXCEPTION:", err);
      toast(err.message || "Failed to submit registration.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = role?.icon || Landmark;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo onClick={() => goTo("landing")} />
          <button
            onClick={() => goTo("roles")}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} /> Change Role
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">Student / Researcher</p>
              <h1 className="text-lg font-extrabold text-slate-900">Create your account</h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3 mb-6">
            Select your registered college and department. Your application will be sent to your college's Institution Administrator for approval.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required error={errors.firstName}>
                <input value={form.firstName} onChange={update("firstName")} placeholder="Jane" className={inputClass(errors.firstName)} />
              </Field>
              <Field label="Last Name">
                <input value={form.lastName} onChange={update("lastName")} placeholder="Cooper" className={inputClass()} />
              </Field>
            </div>

            {/* Email + OTP Verification Box */}
            <Field label="Institutional Email" required error={errors.email}>
              <div className="flex gap-2">
                <input
                  value={form.email}
                  onChange={(e) => {
                    update("email")(e);
                    setIsEmailVerified(false);
                    setOtpSent(false);
                  }}
                  disabled={isEmailVerified}
                  placeholder="name@institution.edu"
                  className={`${inputClass(errors.email)} ${isEmailVerified ? "bg-emerald-50 text-emerald-900 font-medium" : ""}`}
                />
                {!isEmailVerified ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !form.email}
                    className="whitespace-nowrap rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold px-4 transition-colors"
                  >
                    {sendingOtp ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2">
                    <CheckCircle2 size={16} /> Verified
                  </span>
                )}
              </div>
              {errors.email && errors.email.includes("already exists") && (
                <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 shadow-2xs">
                  <span className="font-medium">An account with this email already exists. Please log in instead.</span>
                  <button
                    type="button"
                    onClick={() => goTo("login")}
                    className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Log In Instead
                  </button>
                </div>
              )}
            </Field>

            {otpSent && !isEmailVerified && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-blue-600" /> Enter 6-digit OTP code sent to your email:
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className={`w-full rounded-lg border pl-9 pr-3 py-2 text-sm text-slate-900 tracking-widest bg-white ${errors.otp ? "border-red-400" : "border-slate-200"}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || !otp}
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 transition-colors"
                  >
                    {verifyingOtp ? "Verifying…" : "Verify OTP"}
                  </button>
                </div>
                {errors.otp && <p className="text-xs text-red-500 font-medium">{errors.otp}</p>}
              </div>
            )}

            {/* Institution & Department Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="College / Institution" required error={errors.institution}>
                <select
                  value={form.institutionId}
                  onChange={handleInstitutionChange}
                  disabled={loadingInstitutions}
                  className={inputClass(errors.institution)}
                >
                  <option value="">{loadingInstitutions ? "Loading colleges…" : "-- Select your college --"}</option>
                  {institutions.map((i) => (
                    <option key={i.institutionId} value={i.institutionId}>
                      {i.name} ({i.code})
                    </option>
                  ))}
                  <option value="OTHER">⚠️ My College is Not Listed</option>
                </select>
              </Field>

              <Field label="Department" required error={errors.department}>
                <select
                  value={form.departmentId}
                  onChange={handleDepartmentChange}
                  disabled={!form.institutionId || loadingDepartments || isUnregisteredCollege}
                  className={inputClass(errors.department)}
                >
                  <option value="">{loadingDepartments ? "Loading departments…" : "-- Select department --"}</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Unregistered College Alert Banner */}
            {isUnregisteredCollege && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
                <div className="flex items-start gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-sm">College Not Registered Yet!</p>
                    <p className="mt-1 text-xs text-amber-800 font-normal leading-relaxed">
                      Your college is not registered on LabFlow Pro yet. Please ask your **Institution Administrator** to register your college first before students can apply.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goTo("register-admin")}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 text-xs transition-colors shadow-sm"
                >
                  <Building2 size={15} /> Register Institution (For Institution Admin)
                </button>
              </div>
            )}

            <Field label="Phone Number" required error={errors.phone}>
              <input value={form.phone} onChange={update("phone")} placeholder="+91 XXXXX XXXXX" className={inputClass(errors.phone)} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Password" required error={errors.password}>
                <input type="password" value={form.password} onChange={update("password")} placeholder="••••••••••" className={inputClass(errors.password)} />
              </Field>
              <Field label="Confirm Password" required error={errors.confirm}>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={update("confirm")}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="••••••••••"
                  className={inputClass(errors.confirm)}
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={submitting || isUnregisteredCollege}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm mt-2"
            >
              {submitting ? "Submitting Application…" : "Submit Application"}
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <button onClick={() => goTo("login")} className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
