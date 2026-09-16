import { useRef, useState } from "react";
import { ArrowLeft, Landmark, ShieldCheck, CheckCircle2, KeyRound } from "lucide-react";
import { Logo } from "../../common/Logo.jsx";
import { SectionLabel } from "../../common/SectionLabel.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { API_BASE_URL } from "../../../api/client.js";

export default function InstitutionAdminRegisterPage({ goTo, toast, addPendingAccount, onLoginSuccess }) {
  const fileInputRef = useRef(null);
  const [logoName, setLogoName] = useState("");
  const [form, setForm] = useState({
    institutionName: "",
    institutionEmail: "",
    address: "",
    contactPhone: "",
    city: "",
    state: "",
    country: "India",
    firstName: "",
    lastName: "",
    workEmail: "",
    phoneNumber: "",
    password: "",
    confirm: "",
    authorized: false,
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleLogoClick = () => fileInputRef.current?.click();
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoName(file.name);
      toast(`Logo "${file.name}" selected.`, "success");
    }
  };

  const handleSendOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(form.workEmail.trim())) {
      setErrors((e) => ({ ...e, workEmail: "Enter a valid work email address first." }));
      return;
    }
    setErrors((e) => ({ ...e, workEmail: undefined, otp: undefined }));
    setSendingOtp(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/otp/send?email=${encodeURIComponent(form.workEmail.trim().toLowerCase())}&purpose=REGISTRATION`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP.");

      toast(data.message || "Verification OTP code sent to your work email.", "success");
      setOtpSent(true);
    } catch (err) {
      toast(err.message || "Failed to send OTP. Is backend server running?", "error");
      setErrors((e) => ({ ...e, workEmail: err.message }));
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
        `${API_BASE_URL}/auth/otp/verify?email=${encodeURIComponent(form.workEmail.trim().toLowerCase())}&purpose=REGISTRATION&otp=${encodeURIComponent(otp.trim())}`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid or expired OTP code.");

      toast("Work email verified successfully!", "success");
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
    if (!form.institutionName.trim()) e.institutionName = "Institution name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.institutionEmail)) e.institutionEmail = "Enter a valid contact email.";
    if (!form.address.trim()) e.address = "Address is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!form.country.trim()) e.country = "Country is required.";
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.workEmail)) e.workEmail = "Enter a valid work email.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    if (!form.authorized) e.authorized = "You must confirm you are authorized to register this institution.";
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
      const response = await fetch(`${API_BASE_URL}/institutions/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.institutionName,
          code: form.institutionName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 10) || "INST",
          officialEmail: form.institutionEmail,
          officialPhone: form.contactPhone || form.phoneNumber,
          address: `${form.address}, ${form.city}, ${form.state}, ${form.country}`,
          adminFirstName: form.firstName,
          adminLastName: form.lastName,
          adminEmail: form.workEmail.trim().toLowerCase(),
          adminPhone: form.phoneNumber,
          adminPassword: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // Handle HTTP 409 Conflict (Existing Admin Email)
      if (response.status === 409 || data.message?.includes("already exists") || data.error?.includes("already exists")) {
        const msg = "An account with this email already exists. Please log in instead.";
        setErrors({ workEmail: msg });
        toast(msg, "error");
        return;
      }

      if (!response.ok) {
        const msg = data.message || data.error || "Institution registration failed.";
        setErrors({ workEmail: msg });
        toast(msg, "error");
        return;
      }

      // Auto-login new Institution Admin
      const cleanEmail = form.workEmail.trim().toLowerCase();
      try {
        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password: form.password,
          }),
        });

        const loginData = await loginRes.json().catch(() => ({}));
        if (loginRes.ok && (loginData.token || loginData.accessToken)) {
          const token = loginData.token || loginData.accessToken;
          localStorage.setItem("labflow_token", token);

          const u = loginData.user || {};
          const loggedInUser = {
            id: u.userId || u.id || data.adminUserId || "U-101",
            userId: u.userId || u.id || data.adminUserId,
            email: cleanEmail,
            firstName: form.firstName,
            lastName: form.lastName,
            name: `${form.firstName} ${form.lastName}`.trim(),
            phone: form.phoneNumber,
            department: "Administration",
            institution: form.institutionName,
            institutionId: data.institutionId ? Number(data.institutionId) : null,
            roles: u.roles || ["INSTITUTION_ADMIN"],
            role: "Institution Administrator",
            token: token,
          };

          toast("Institution registered successfully! Welcome.", "success");
          if (onLoginSuccess) {
            onLoginSuccess(loggedInUser, { id: "institution-admin", title: "Institution Administrator" });
            return;
          }
        }
      } catch (loginErr) {
        console.warn("Auto-login error after admin registration:", loginErr);
      }

      addPendingAccount(form.workEmail, "Institution Administrator");
      toast("Institution registration submitted! Pending approval.", "success");
      goTo("pending");
    } catch (err) {
      toast(err.message || "Failed to submit institution registration.", "error");
    } finally {
      setSubmitting(false);
    }
  };

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

      <main className="flex-1 flex items-start justify-center px-5 py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3">
              <Landmark size={20} />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Institution Administrator Registration</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Create an administrator account for your institution. Email OTP verification is required before System Admin review.
            </p>
          </div>

          {/* Institution details */}
          <SectionLabel>Institution Details</SectionLabel>
          <div className="space-y-4 mb-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Institution Name" required error={errors.institutionName}>
                <input
                  value={form.institutionName}
                  onChange={set("institutionName")}
                  placeholder="Institution name"
                  className={inputClass(errors.institutionName)}
                />
              </Field>
              <Field label="Institution Contact Email" required error={errors.institutionEmail}>
                <input
                  value={form.institutionEmail}
                  onChange={set("institutionEmail")}
                  placeholder="admin@institution.edu"
                  className={inputClass(errors.institutionEmail)}
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Field label="Address" required error={errors.address}>
                  <input
                    value={form.address}
                    onChange={set("address")}
                    placeholder="Institution address"
                    className={inputClass(errors.address)}
                  />
                </Field>
              </div>
              <Field label="Contact Phone" error={errors.contactPhone}>
                <input
                  value={form.contactPhone}
                  onChange={set("contactPhone")}
                  placeholder="+91 XXXXX XXXXX"
                  className={inputClass(errors.contactPhone)}
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="City" required error={errors.city}>
                <input value={form.city} onChange={set("city")} placeholder="City" className={inputClass(errors.city)} />
              </Field>
              <Field label="State" required error={errors.state}>
                <input value={form.state} onChange={set("state")} placeholder="State" className={inputClass(errors.state)} />
              </Field>
              <Field label="Country" required error={errors.country}>
                <input value={form.country} onChange={set("country")} placeholder="Country" className={inputClass(errors.country)} />
              </Field>
            </div>

            <Field label="Institution Logo">
              <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleLogoChange} className="hidden" />
              <button
                type="button"
                onClick={handleLogoClick}
                className="w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 transition-colors py-6 flex flex-col items-center justify-center gap-1 text-slate-500"
              >
                <span className="text-blue-600 font-semibold text-sm">⬆ Upload institution logo</span>
                <span className="text-xs">{logoName || "PNG / JPG / WEBP"}</span>
              </button>
            </Field>
          </div>

          {/* Administrator details */}
          <SectionLabel>Administrator Details</SectionLabel>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First Name" required error={errors.firstName}>
                <input value={form.firstName} onChange={set("firstName")} placeholder="First name" className={inputClass(errors.firstName)} />
              </Field>
              <Field label="Last Name" error={errors.lastName}>
                <input value={form.lastName} onChange={set("lastName")} placeholder="Last name" className={inputClass(errors.lastName)} />
              </Field>
            </div>

            {/* Work Email + OTP Verification Box */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Work Email" required error={errors.workEmail}>
                <div className="flex gap-2">
                  <input
                    value={form.workEmail}
                    onChange={(e) => {
                      set("workEmail")(e);
                      setIsEmailVerified(false);
                      setOtpSent(false);
                    }}
                    disabled={isEmailVerified}
                    placeholder="name@institution.edu"
                    className={`${inputClass(errors.workEmail)} ${isEmailVerified ? "bg-emerald-50 text-emerald-900 font-medium" : ""}`}
                  />
                  {!isEmailVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || !form.workEmail}
                      className="whitespace-nowrap rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold px-3 transition-colors"
                    >
                      {sendingOtp ? "Sending…" : otpSent ? "Resend" : "Send OTP"}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-2">
                      <CheckCircle2 size={16} /> Verified
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Phone Number" error={errors.phoneNumber}>
                <input value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+91 XXXXX XXXXX" className={inputClass(errors.phoneNumber)} />
              </Field>
            </div>

            {otpSent && !isEmailVerified && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-blue-600" /> Enter 6-digit OTP code sent to your work email:
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

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Password" required error={errors.password}>
                <input type="password" value={form.password} onChange={set("password")} placeholder="•••••••••••••" className={inputClass(errors.password)} />
              </Field>
              <Field label="Confirm Password" required error={errors.confirm}>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="•••••••••••••"
                  className={inputClass(errors.confirm)}
                />
              </Field>
            </div>

            <div>
              <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.authorized}
                  onChange={set("authorized")}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                I confirm that I am authorized to register this institution.
              </label>
              {errors.authorized && <p className="mt-1 text-xs text-red-500">{errors.authorized}</p>}
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm mt-2"
            >
              {submitting ? "Submitting Registration…" : "Submit for Approval"}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already registered?{" "}
              <button onClick={() => goTo("login")} className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
